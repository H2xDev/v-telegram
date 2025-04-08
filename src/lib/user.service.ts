import * as telegram from 'telegram';

import { EventHandler } from './event-handler';
import { TelegramService } from './telegram.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UserModel } from '../models/user.model';
import { DBBanks, DBService } from './db.service';
import { ChannelModel } from '../models/channel.model';
import { ChannelService } from './channel.service';

export type UserFull = telegram.Api.users.UserFull;
export type User = telegram.Api.User;

export enum UserServiceEvents {
	LOGGED_IN = 'logged-in',
	LOGGED_OUT = 'logged-out',
}

interface UserServiceEventsDeclaration {
	[UserServiceEvents.LOGGED_IN]: { user: string };
	[UserServiceEvents.LOGGED_OUT]: { user: string };
}

export class UserService extends EventHandler<UserServiceEventsDeclaration> {
	static instance: UserService;
	private telegramService = new TelegramService;
	private cacheService = new DBService;
	private channelService = new ChannelService;
	private client = this.telegramService.client;

	constructor() {
		if (UserService.instance) return UserService.instance;
		super();
		UserService.instance = this;
	}

	saveUser(user: UserModel) {
		user = Object.assign(new UserModel, user);
		this.cacheService.save(user, DBBanks.USER_INFO);
		return user;
	}

	async getFullUser(id: string | number) {
		const cachedData = await this.cacheService.get(id, DBBanks.USER_INFO);
		if (cachedData?.data) return Object.assign(new UserModel, cachedData.data) as UserModel;

		const raw = await this.client.invoke(new telegram.Api.users.GetFullUser({ id }))
		
		const plain = Object.assign(raw.users[0], raw.fullUser) as any;
		const user = plainToInstance(UserModel, plain, { excludeExtraneousValues: true });

		const [channelRaw] = raw.chats;
		if (channelRaw) {
			const channel = plainToInstance(ChannelModel, channelRaw, { excludeExtraneousValues: true });
			user.personalChannel = channel;
			this.channelService.saveChannel(channel);
		}

		this.cacheService.save(user, DBBanks.USER_INFO);

		return user;
	}

	async getUser(id: string | number) {
		const cachedData = await this.cacheService.get(id, DBBanks.USER_INFO_SHORT);
		if (cachedData?.data) return Object.assign(new UserModel, cachedData.data) as UserModel;

		const raw = await this.client.getEntity(id);
		const receivedData = plainToClass(UserModel, raw, { excludeExtraneousValues: true });
		this.cacheService.save(receivedData, DBBanks.USER_INFO_SHORT);

		return receivedData;
	}

	async getUserPhoto(id: string | number) {
		const blob = this.cacheService.getBlob(id);
		if (blob) return blob;

		const cachedData = await this.cacheService.get(id, DBBanks.USER_PHOTOS);
		const buffer = !cachedData?.buffer
			? await this.client.downloadProfilePhoto(id, {
				isBig: true,
			})
			: cachedData.buffer;

		if (!cachedData) {
			this.cacheService.save({ id, buffer }, DBBanks.USER_PHOTOS);
		}

		if (!blob) {
			this.cacheService.saveBlob(id, buffer);
		}

		return this.cacheService.getBlob(id);
	}
}
