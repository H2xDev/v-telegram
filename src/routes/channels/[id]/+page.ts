import { goto } from "$app/navigation";
import { TelegramService } from "$lib/telegram.service";

export const load = async ({ params }) => {
	return params;
}
