import * as telegram from 'telegram';
import { Expose, Transform } from "class-transformer";

export class MusicModel {
	@Expose()
	@Transform(({ obj }) => obj.document)
	document!: telegram.Api.Document;

	@Expose()
	@Transform(({ obj }) => obj.document.id.toString())
	id!: any;

  @Expose()
  @Transform(({ obj }) => obj.document.mimeType.replace(/(mpeg3|mp4|mp3)/, 'mpeg'))
  mimeType!: string;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[1]?.fileName;
	})
	filename!: string;

	@Expose()
	@Transform(({ obj }) => {
		let { fileName = '' } = obj.document.attributes[1] || {};
    fileName = fileName.split('.').slice(0, -1).join('.');

		return obj.document.attributes[0]?.performer || fileName.split('-')[0] || 'Unnamed Artist'
	})
	artist!: string;

	@Expose()
	@Transform(({ obj }) => {
    let { fileName = '' } = obj.document.attributes[1] || {};
    fileName = fileName.split('.').slice(0, -1).join('.');

		return obj.document.attributes[0]?.title || fileName.split('-')[1] || 'Unnamed Song'
	})
	songName!: string;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0].duration;
	})
	duration!: number;

  get isSupported() {
    return MediaSource.isTypeSupported(this.mimeType);
  }
}
