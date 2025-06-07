import { Field, ObjectType, Float, InputType } from '@nestjs/graphql';

@ObjectType('Sustainability')
export class SustainabilityType {
  @Field()
  certification: string;

  @Field(() => Float)
  recycledPercentage: number;
}

@InputType()
export class CreateSustainabilityInput {
  @Field()
  certification: string;

  @Field(() => Float)
  recycledPercentage: number;
}

@InputType()
export class UpdateSustainabilityInput {
  @Field({ nullable: true })
  certification?: string;

  @Field(() => Float, { nullable: true })
  recycledPercentage?: number;
}
