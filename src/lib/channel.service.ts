import * as telegram from "telegram";
import { plainToInstance } from "class-transformer";
import { ChannelModel } from "../models/channel.model";
import { DBBanks, DBService } from "./db.service";
import { EventHandler } from "./event-handler";
import { TelegramService } from "./telegram.service";
import { MessageModel } from "../models/message.model";
import { UserModel } from "$models/user.model";
import { UserService } from "./user.service";

const POSTS_PAGE_LIMIT = 100;

export interface CommentChunk {
  list: MessageModel[];
  count: number;
  loadNext: () => Promise<CommentChunk>;
}

export enum ChannelServiceEvents {
	CHANNEL_UPDATED = 'channel-updated',
}

interface ChannelServiceEventsDeclaration {
	[ChannelServiceEvents.CHANNEL_UPDATED]: ChannelModel;
}

export class ChannelService extends EventHandler<ChannelServiceEventsDeclaration> {
	static instance = new ChannelService();

	private telegramService = new TelegramService;
	private dbService = new DBService;
	private groups: Record<string, MessageModel> = {};

	channels: ChannelModel[] = [];
	channelsMap: Record<string, ChannelModel> = {};

	constructor() {
		if (ChannelService.instance) return ChannelService.instance;
		super();
	}

	saveChannel(channel: ChannelModel) {
		channel = Object.assign(new ChannelModel, channel);
		this.channelsMap[channel.id] = channel;
    this.channelsMap[+channel.raw.id.toString()] = channel;
		this.dbService.save(channel, DBBanks.CHANNELS, 10);
		this.trigger(ChannelServiceEvents.CHANNEL_UPDATED, channel);
	}

	async getChannel(username: string | number) {
		if (this.channelsMap[username]) {
			return this.channelsMap[username];
		}

		const cachedData = await this.dbService.get(username, DBBanks.CHANNELS);

		if (cachedData && cachedData.data) {
			const instance = Object.assign(new ChannelModel, cachedData.data);
			instance.pinnedMessage = await this.getPinnedPost(instance.id);
			instance.pinnedMessage.channel = instance;
			this.channelsMap[username] = instance;
			return instance as ChannelModel;
		}

		const res = await this.telegramService.client.invoke(
			new telegram.Api.channels.GetFullChannel({
				channel: username,
			}),
		);

		const instance = plainToInstance(ChannelModel, Object.assign(res.chats[0], res.fullChat) as any, { excludeExtraneousValues: true });
		instance.pinnedMessage = await this.getPinnedPost(instance.id);

		if (instance.pinnedMessage) {
			instance.pinnedMessage.channel = instance;
		}

		this.saveChannel(instance);

		return instance;
	}

	async getPosts(id: any, lastPostId?: number) {
		const newPosts = [];

		for await (const post of this.telegramService.client.iterMessages(id, {
			limit: POSTS_PAGE_LIMIT,
			offsetId: lastPostId,
		})) {
			if (!this.isMessage(post)) continue;
			newPosts.push(post);
		}

		return plainToInstance(MessageModel, newPosts, { excludeExtraneousValues: true })
			.reverse()
			.filter(this.assignGroup.bind(this))
			.reverse();
	}

	async getChannelList() {
    if (this.channels.length) {
      return this.channels;
    }

		const list = (await this.telegramService.client.getDialogs())
			.filter((d) => d.isChannel && !d.isGroup)

		this.channels = plainToInstance(ChannelModel, list, { excludeExtraneousValues: true });

		return this.channels;
	}

	async leaveChannel(channelId: string) {
		const channel = await this.getChannel(channelId);
		if (!channel) {
			throw new Error('Channel not found');
		}

		if (!channel.isSubscribed) {
			return;
		}

		await this.telegramService.client.invoke(
			new telegram.Api.channels.LeaveChannel({
				channel: channelId,
			}),
		);

		channel.isSubscribed = false;
		this.saveChannel(channel);
	}

	async joinChannel(channelId: string) {
		const channel = await this.getChannel(channelId);
		if (!channel) {
			throw new Error('Channel not found');
		}

		if (channel.isSubscribed) {
			return;
		}

		await this.telegramService.client.invoke(
			new telegram.Api.channels.JoinChannel({
				channel: channelId,
			}),
		);

		channel.isSubscribed = true;
		this.saveChannel(channel);
	}

  async getComments(post: MessageModel, offsetId?: number) {
    const res = await this.telegramService.client.invoke(
      new telegram.Api.messages.GetReplies({
        peer: post.raw.inputChat,
        msgId: post.raw.id,
        limit: 20,
        offsetId,
      }),
    ) as any;

    const users = plainToInstance(UserModel, res.users as any[], { excludeExtraneousValues: true });
    users.forEach((user) => new UserService().saveUser(user));

    plainToInstance(ChannelModel, res.chats as any[], { excludeExtraneousValues: true })
      .forEach((channel) => this.saveChannel(channel));

    let messages = plainToInstance(MessageModel, res.messages as any[], { excludeExtraneousValues: true }).reverse();
    const messageRecords: Record<number, MessageModel> = {};
    const count = messages.length;
    const lastId = messages[0]?.id;

    messages = messages.filter(this.assignGroup.bind(this));

    messages.forEach((message) => {
      messageRecords[message.id] = message;

      if (message.fromUser) {
        message.user = users.find((user) => user.id === message.fromId.toString()) || null;
      }

      if (message.fromChannel) {
        message.channel = this.channelsMap[message.fromId] || null;
      }

      if (message.replyToId) {
        const targetMessage = messageRecords[message.replyToId] || messages.find((msg) => msg.id === message.replyToId);
        if (!targetMessage) return;
        targetMessage.replies.push(message);
      }
    });

    return { 
      list: messages.filter((message) => !message.replyToId),
      count,
      loadNext: () => this.getComments(post, lastId),
    };
  }

	private async getPinnedPost(channelId: string) {
		if (!channelId) {
			return null;
		}

		const filter = new telegram.Api.InputMessagesFilterPinned();

		const res = await this.telegramService.client.invoke(
			new telegram.Api.messages.Search({
				filter,
				limit: 1,
				peer: channelId,
				q: '',
			}), 
		) as any;

		if (!res.messages.length) {
			return null;
		}

		return plainToInstance(MessageModel, res.messages[0], { excludeExtraneousValues: true });
	}

	private isMessage(message: any) {
		return message.className === 'Message';
	}

	private assignGroup(post: MessageModel) {
		if (!post.groupedId) {
			post.group.push(post);
			post.parentPost = post;
			return true;
		}

		if (post.groupedId in this.groups) {
			this.groups[post.groupedId].group.push(post);
			post.parentPost = this.groups[post.groupedId];
			return false;
		}

		this.groups[post.groupedId] = post;
		post.group.push(post);
		post.parentPost = post;
		return true;
	}
}
