import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

@ObjectType('Warranty')
export class WarrantyType {
  @Field(() => Int)
  id: number;

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
