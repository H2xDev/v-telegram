import { Expose, Transform } from "class-transformer";
import { MediaService } from "$lib/media.service";

export class PhotoModel {
	@Expose()
	@Transform(({ obj }) => obj)
	document!: any;

	@Expose()
	@Transform(({ obj }) => {
		const attrs = obj.photo.sizes[1];

		return attrs.w / attrs.h;
	})
	aspectRatio!: number;

	getUrl() {
		return new MediaService().downloadPhoto(this.document);
	}
}
