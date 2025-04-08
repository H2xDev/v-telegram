import { Expose, Transform } from "class-transformer";
import * as telegram from "telegram";
import type { MessageModel } from "./message.model";

export class ChannelModel {
	@Expose()
	@Transform(({ obj }: any) => String(obj.username || obj.entity?.username || obj.id))
	id!: string;

	@Expose()
	title!: string;

	@Expose()
	username!: string;

	@Expose()
	verified!: boolean;

	@Expose()
	@Transform(({ obj }: any) => obj.entity?.participantsCount || obj?.participantsCount || 0)
	subscribersCount!: number;

	@Expose()
	@Transform(({ obj }: any) => !obj.left)
	isSubscribed!: boolean;

	@Expose()
	@Transform(({ obj }: any) => obj)
	raw!: telegram.Api.ChannelFull;

	pinnedMessage: MessageModel | null = null;

	@Expose()
	@Transform(({ obj }: any) => obj.about)
	about!: string;
}
