import * as telegram from 'telegram';
import 'reflect-metadata';
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { ChannelModel } from "./channel.model";
import { VideoModel } from './video.model';
import { PhotoModel } from './photo.model';
import { UserModel } from './user.model';
import { MusicModel } from './music.model';
import { StickerModel } from './sticker.model';
import { FileModel } from './file.model';

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
  @Transform(({ obj }) => plainToInstance(UserModel, obj._chat, { excludeExtraneousValues: true }))
  chat!: UserModel;

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

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.sticker) return null;
    return plainToInstance(StickerModel, obj.media, { excludeExtraneousValues: true });
  })
  sticker!: StickerModel | null;

  // FIXME Need to detect the file attachment more easier way
  @Expose({ name: 'file' })
  @Transform(({ obj }) => {
    if (obj.file?.media.photo || obj.sticker || obj.video) return null;
    if (!obj.media?.document?.attributes) return null;

    const isSticker = obj.media?.document.attributes?.some((attr: any) => attr.className.includes('Sticker'));
    if (isSticker) return null;

    return plainToInstance(FileModel, obj.media, { excludeExtraneousValues: true });
  })
  file!: FileModel | null
	
	group: MessageModel[] = [];

  get hasAttachments() {
    const fields = ['video', 'photo', 'music', 'sticker', 'file'];
    return this.group.some((item) => {
      return fields.some((field) => (item as unknown as Record<string, string>)[field]);
    });
  }

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
