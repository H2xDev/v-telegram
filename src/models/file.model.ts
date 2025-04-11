import { Expose, Transform } from "class-transformer";

export class FileModel {
  @Expose()
  @Transform(({ obj }) => obj)
  document!: any;

  @Expose()
  @Transform(({ obj }) => {
    return obj.document?.attributes?.[0].fileName
      || obj.document?.attributes?.[1]?.fileName;
  })
  fileName!: string;
}
