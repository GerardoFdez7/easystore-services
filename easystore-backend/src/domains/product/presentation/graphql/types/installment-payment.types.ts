import { Field, ObjectType, Float, InputType, Int } from '@nestjs/graphql';

@ObjectType('Installment')
export class InstallmentType {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  months: number;

  @Field(() => Float)
  interestRate: number;
}

@InputType()
export class CreateInstallmentInput {
  @Field()
  months: number;

  @Field(() => Float)
  interestRate: number;
}

@InputType()
export class UpdateInstallmentInput {
  @Field({ nullable: true })
  months?: number;

  @Field(() => Float, { nullable: true })
  interestRate?: number;
}
