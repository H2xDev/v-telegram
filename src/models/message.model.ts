import 'reflect-metadata';
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { ChannelModel } from "./channel.model";
import { VideoModel } from './video.model';
import { PhotoModel } from './photo.model';
import { UserModel } from './user.model';
import { MusicModel } from './music.model';

export class MessageModel {
	@Expose()
	@Transform(({ obj }) => +obj.id.toString())
	id!: number;

	@Expose()
	@Transform(_ => _.obj)
	raw!: any;

	@Expose()
	message!: string;

	@Expose()
	@Transform(({ value }) => value || [])
	entities!: any[];

	@Expose()
	@Transform(({ obj }) => +String(obj.chatId.value))
	authorId!: string;

	@Expose()
	@Transform(({ obj }) => +String(obj.fromId?.userId || obj.peerId?.userId))
	fromId!: string;

	@Expose({ name: '_chat' })
	@Type(() => ChannelModel)
	channel!: ChannelModel;

	@Expose()
	@Transform(({ obj }) => plainToInstance(UserModel, obj._sender, { excludeExtraneousValues: true }))
	user!: UserModel;

	@Expose()
	views!: number;

	@Expose()
	@Transform(({ obj }) => {
		if (!obj.media?.video) return null;
		return plainToInstance(VideoModel, obj.media, { excludeExtraneousValues: true });
	})
	video: VideoModel | null = null;

	@Expose()
	@Transform(({ obj }) => {
		if (!obj.media?.round) return null;
		return plainToInstance(VideoModel, obj.media, { excludeExtraneousValues: true });
	})
	round: VideoModel | null = null;

	@Expose()
	@Transform(({ obj }) => {
		if (!obj.media?.photo) return null;
		return plainToInstance(PhotoModel, obj.media, { excludeExtraneousValues: true });
	})
	photo: PhotoModel | null = null;

	@Expose()
	@Transform(({ obj }) => {
		return (obj.media?.document?.mimeType || '').includes('audio') 
			? plainToInstance(MusicModel, obj.media, { excludeExtraneousValues: true })
			: null;
	})
	music: MusicModel | null = null;

	@Expose()
	@Transform(({ obj }) => obj.groupedId?.value.toString())
	groupedId?: string;
	
	group: MessageModel[] = [];

	@Expose()
	@Transform(({ value }) => new Date(value * 1000))
	date!: Date;

	@Expose({ name: 'out' })
	isOut!: boolean;

	parentPost: MessageModel | null = null;
	previousPost: MessageModel | null = null;

	get isPreviousSame() {
		return this.fromId === this.previousPost?.fromId;
	}
}
