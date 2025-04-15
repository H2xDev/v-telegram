import { MediaService } from "@/lib/media.service";
import { Expose, Transform } from "class-transformer";

export class StickerModel {
  @Expose()
  @Transform(({ obj }) => obj)
  document!: any;

  @Expose()
  @Transform(({ obj }) => {
    return 1;
  })
  aspectRatio!: number;

  @Expose()
  @Transform(({ obj }) => obj.document?.mimeType === "image/webp")
  isStatic!: boolean;

  @Expose()
  @Transform(({ obj }) => obj.document?.mimeType === "video/webm")
  isVideo!: boolean;

  getUrl() {
    return new MediaService().downloadMedia(this.document);
  }
}
