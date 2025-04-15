import { Expose, Transform } from "class-transformer";

export class ReactionModel {
  @Expose()
  count!: number;

  @Expose()
  @Transform(({ obj }) => obj.reaction.emoticon)
  emoticon!: string;

  @Expose()
  @Transform(({ obj }) => obj)
  raw!: any;
}
