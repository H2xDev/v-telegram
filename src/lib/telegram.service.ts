import * as telegram from 'telegram';
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
  client!: telegram.TelegramClient;

  constructor() {
    if (TelegramService.instance) return TelegramService.instance;

    super();
    this.client = new telegram.TelegramClient("vton", APP_ID, APP_HASH, {
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

  async getEmojis() {
    const data = (await this.client.invoke(
      new telegram.Api.messages.GetEmojiStickers({}),
    )) as any;

    const id = String(data.sets[1]?.id.value);
    console.log(id);

    const data2 = await this.client.invoke(
      new telegram.Api.messages.GetCustomEmojiDocuments({
        documentId: [id as any],
      }),
    );

    console.log(data2);
  }

  async isLoggedIn() {
    if (!this.client.connected) {
      await this.forEvent(TelegramServiceEvents.CONNECTED);
    }

    return this.client.isUserAuthorized();
  }

  async login(
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
