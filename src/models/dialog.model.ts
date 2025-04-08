import { Expose, Transform, Type } from "class-transformer";
import { EntityModel } from "./entity.model";
import { UserModel } from "./user.model";
import { MessageModel } from "./message.model";

export class DialogModel extends EntityModel {
	@Expose({ name: 'entity' })
	@Type(() => UserModel)
	user!: UserModel;

	@Expose()
	isGroup!: boolean;

	@Expose()
	@Transform(({ obj }: any) => !!obj.entity?.bot)
	isBot!: boolean;

	@Expose({ name: 'message' })
	@Type(() => MessageModel)
	lastMessage!:MessageModel 

	@Expose()
	unreadCount!: number;

	@Expose()
	unreadMentionsCount!: number;

	@Expose()
	title!: string;

	@Expose()
	@Transform(({ obj }: any) => obj)
	raw!: any;
}
