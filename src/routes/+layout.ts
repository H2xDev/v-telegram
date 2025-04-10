import { TelegramService, TelegramServiceEvents } from "@/lib/telegram.service";

export const ssr = false;

export const load = async ({ params }) => { 
  const tg = new TelegramService();
  if (!tg.client.connected) {
    await new TelegramService().forEvent(TelegramServiceEvents.CONNECTED)
  }

  return params;
}
