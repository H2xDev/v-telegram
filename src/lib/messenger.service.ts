import * as telegram from "telegram";
import { EventHandler } from "./event-handler";
import { TelegramService } from "./telegram.service";
import { plainToInstance } from "class-transformer";
import { DialogModel } from "../models/dialog.model";
import { MessageModel } from "../models/message.model";

export enum MessengerServiceEvents {
	MESSAGE_RECEIVED = 'message-received',
	MESSAGE_ADDED = 'message-added',
	CONTACTS_LOADED = 'contacts-loaded',

	INTERNAL_SHORT_MESSAGE = 'UpdateShortMessage',
	INTERNAL_NEW_NESSAGE = 'UpdateNewMessage',
	INTERNAL_DELETE_MESSAGES = 'UpdateDeleteMessages',
}

interface MessengerServiceEventsDeclaration {
	[MessengerServiceEvents.MESSAGE_RECEIVED]: MessageModel;
	[MessengerServiceEvents.MESSAGE_ADDED]: MessageModel;
	[MessengerServiceEvents.CONTACTS_LOADED]: DialogModel[];

	[MessengerServiceEvents.INTERNAL_SHORT_MESSAGE]: telegram.Api.UpdateShortMessage;
	[MessengerServiceEvents.INTERNAL_NEW_NESSAGE]: telegram.Api.UpdateNewMessage;
	[MessengerServiceEvents.INTERNAL_DELETE_MESSAGES]: telegram.Api.UpdateDeleteMessages;
}

export class MessengerService extends EventHandler<MessengerServiceEventsDeclaration> {
	static instance = new MessengerService();

	private telegramService = new TelegramService;

	dialogs_: DialogModel[] = [];
	groups: Record<string, MessageModel> = {};
	messages: Record<string, MessageModel[]> = {};

	constructor() {
		if (MessengerService.instance) return MessengerService.instance;
		super();

		this.telegramService.client.addEventHandler((event) => {
			this.trigger(event.className as MessengerServiceEvents, event);
		})

		this.on(MessengerServiceEvents.INTERNAL_NEW_NESSAGE, (event) => {
			this.registerMessage(event.message as telegram.Api.Message);
		});
	}

	get dialogs() {
		return this.dialogs_;
	}

	set dialogs(dialogs: DialogModel[]) {
		this.dialogs_ = dialogs;
		this.trigger(MessengerServiceEvents.CONTACTS_LOADED, this.dialogs_);
	}

	get chats() {
		return this.dialogs_.filter((dialog) => dialog.isGroup);
	}

	get contacts() {
		return this.dialogs_.filter((dialog) => !dialog.isGroup && !dialog.user.isBot);
	}

	get bots() {
		return this.dialogs_.find((dialog) => dialog.user.isBot);
	}

	async loadDialogs() {
		const data = (await this.telegramService.client.getDialogs())
			.filter((dialog) => !dialog.isChannel);

		this.dialogs = plainToInstance(DialogModel, data, { excludeExtraneousValues: true });
	}

	async getMessages(id: string, offsetId?: number, limit = 20) {
		const messages = await this.telegramService.client.getMessages(id, {
			limit,
			offsetId,
		});

		let previousPost: MessageModel | null = null;
		let posts = plainToInstance(MessageModel, messages, { excludeExtraneousValues: true });
		const byGroup = this.assignGroup.bind(this);

		posts = posts.reverse().filter(byGroup);

		posts.forEach((post) => {
			post.previousPost = previousPost;
			previousPost = post;
		});

		posts.reverse();

		this.messages[id] ??= [];
		this.messages[id].push(...posts);

		return posts;
	}

	/**
	 * Places the post in a group in case this post is a part of a group.
	 */
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

	private registerMessage(msg: telegram.Api.Message) {
		const chatId = +String(msg.chatId);
		msg._chat = this.messages[chatId]?.[0]?.raw._chat || null;

		const post = plainToInstance(MessageModel, msg, { excludeExtraneousValues: true });
		this.assignGroup(post);
		post.previousPost = this.messages[chatId]?.[this.messages[chatId].length - 1] || null;
		this.trigger(MessengerServiceEvents.MESSAGE_ADDED, post);
	}

	async sendMessage(chatId: number | string, message: string) {
		const msg = await this.telegramService.client.sendMessage(chatId, {
			message,
		});

		this.registerMessage(msg);
	}
}
