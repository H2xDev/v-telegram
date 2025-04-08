import { Expose, Transform } from "class-transformer";

export class EntityModel {
	@Expose({ name: 'id' })
	@Transform((_) => _.obj.id.value.toString())
	id!: string;
}
