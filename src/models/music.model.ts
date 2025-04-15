import * as telegram from 'telegram';
import { Expose, Transform } from "class-transformer";

const AVERAGE_MP3_BITRATE = 192;

export class MusicModel {
	@Expose()
	@Transform(({ obj }) => obj.document)
	document!: telegram.Api.Document;

	@Expose()
	@Transform(({ obj }) => obj.document.id.toString())
	id!: any;

  @Expose()
  @Transform(({ obj }) => obj.document.mimeType.replace(/(mpeg3|mp4|mp3|mpeg)/, 'mpeg'))
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

		return (obj.document.attributes[0]?.performer || fileName.split('-')[0] || 'Unnamed Artist')
      .replace(/_/g, ' ')
	})
	artist!: string;

	@Expose()
	@Transform(({ obj }) => {
    let { fileName = '' } = obj.document.attributes[1] || {};
    fileName = fileName.split('.').slice(0, -1).join('.');

		return (obj.document.attributes[0]?.title || fileName.split('-')[1] || 'Unnamed Song')
      .replace(/_/g, ' ')
	})
	songName!: string;

	@Expose()
	@Transform(({ obj }) => {
		return obj.document.attributes[0]?.duration || 0;
	})
	duration!: number;

  @Expose()
  @Transform(({ obj }) => {
    return !obj.document.attributes[0]?.duration;
  })
  needRecalculateDuration!: boolean;

  sourceId: string | null = null;

  get isSupported() {
    return MediaSource.isTypeSupported(this.mimeType);
  }

  recalculateDuration(bitrate: number | null) {
    console.log('Recalculating duration', this.id, bitrate);
    const size = +this.document.size.toString() * 8;
    const bitrateValue = bitrate || AVERAGE_MP3_BITRATE;
    this.duration = Math.floor(size / (bitrateValue * 1000));
    this.needRecalculateDuration = false;
  }
}
