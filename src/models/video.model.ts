import { MediaService } from "$lib/media.service";
import { Expose, Transform } from "class-transformer";

export class VideoModel {
	static volume = 0.5;

	@Expose()
	@Transform(({ obj }) => obj.document.mimeType)
	mimeType!: string;

	@Expose()
	@Transform(({ obj }) => {
		const attrs = obj.document.attributes[0];

		return attrs.w / attrs.h;
	})
	aspectRatio!: number;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0].duration;
	})
	duration!: number;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0].roundMessage;
	})
	isRound!: boolean;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0].videoCodec;
	})
	codec!: string;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0].nosound;
	})
	isNoSound!: boolean;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0].supportsStreaming;
	})
	supportsStreaming!: boolean;

	@Expose()
	@Transform(({ obj }) => obj)
	document!: any;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[1]?.fileName;
	})
	filename!: string;

	getUrl() {
		return new MediaService().downloadVideo(this.document);
	}

	getThumbUrl() {
		return new MediaService().downloadMedia(this.document);
	}
}
