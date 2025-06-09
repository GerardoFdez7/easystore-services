import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('Warranty')
export class WarrantyType {
  @Field()
  months: number;

  @Field()
  coverage: string;

  @Field()
  instructions: string;
}

@InputType()
export class CreateWarrantyInput {
  @Field()
  months: number;

  @Field()
  coverage: string;

  @Field()
  instructions: string;
}

@InputType()
export class UpdateWarrantyInput {
  @Field({ nullable: true })
  months?: number;

  @Field({ nullable: true })
  coverage?: string;

  @Field({ nullable: true })
  instructions?: string;
}
