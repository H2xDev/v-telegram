import { TelegramClient } from 'telegram';
import { EventHandler } from './event-handler';

const APP_ID = +import.meta.env.VITE_TELEGRAM_APP_ID;
const APP_HASH = import.meta.env.VITE_TELEGRAM_APP_HASH;

export enum TelegramServiceEvents {
	CONNECTED = "connected",
	AUTHORIZED = "authorized",
	UNAUTHORIZED = "unauthorized",
}

interface TelegramServiceEventsDelcaration {
	[TelegramServiceEvents.CONNECTED]: undefined;
}

export class TelegramService extends EventHandler<TelegramServiceEventsDelcaration> {
	static instance: TelegramService;
	public client!: TelegramClient;

	constructor() {
		if (TelegramService.instance) return TelegramService.instance;

		super();
		this.client = new TelegramClient("vton", APP_ID, APP_HASH, {
			connectionRetries: 5,
			maxConcurrentDownloads: 5,
		});

		this.client
			.connect()
			.then(this.triggerConnected.bind(this));

		TelegramService.instance = this;
	}

	private triggerConnected() {
		this.trigger(TelegramServiceEvents.CONNECTED, undefined);
	}

	public async isLoggedIn() {
		if (!this.client.connected) {
			await this.forEvent(TelegramServiceEvents.CONNECTED);
		}

		return this.client.isUserAuthorized();
	}

	public async login(
		pnum: () => Promise<string>,
		pcode: () => Promise<string>,
		psswd: () => Promise<string>,
		error: (err: Error) => void
	) {
		if (!this.client.connected) {
			await this.forEvent(TelegramServiceEvents.CONNECTED);
		}

		await this.client
			.start({
				phoneNumber: pnum,
				password: psswd,
				phoneCode: pcode,
				onError: error,
			})
			.then(this.trigger.bind(this, TelegramServiceEvents.AUTHORIZED, undefined))
			.catch(error);

		this.client.session.save();
	}
}
