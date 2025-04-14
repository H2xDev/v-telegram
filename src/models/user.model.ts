import { Expose, Transform } from "class-transformer";
import type { ChannelModel } from "./channel.model";
import { EntityModel } from "./entity.model";

export class UserModel extends EntityModel {
	@Expose()
	firstName!: string;

	@Expose()
	lastName!: string;

	@Expose()
	@Transform(({ obj }: any) => obj.about)
	about!: string;

	@Expose()
	@Transform(({ obj }: any) => obj.birthday ? new Date(obj.birthday.year, obj.birthday.month - 1, obj.birthday.day) : null)
	birthday!: Date;

	@Expose()
	phone!: string;

	@Expose()
	username!: string;

	@Expose({ name: 'self' })
	isSelf!: boolean;

	@Expose({ name: 'verified' })
	isVerified!: boolean;

	@Expose({ name: 'premium' })
	isPremium!: boolean;

	@Expose({ name: 'bot' })
	isBot!: boolean;

	@Expose()
	@Transform((_) => _.obj)
	raw!: any;

	personalChannel: ChannelModel | null = null;

	get fullName() {
    if (this.raw.title) return this.raw.title;
		return `${this.firstName} ${this.lastName || ''}`;
	}

  get url() {
    const id = this.username || this.id;
    if (!id) return null;

    return '/' + id;
  }
}
