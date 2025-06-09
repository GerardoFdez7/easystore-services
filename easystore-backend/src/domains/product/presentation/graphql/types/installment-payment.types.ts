import { Field, ObjectType, Float, InputType, Int } from '@nestjs/graphql';

@ObjectType('Installment')
export class InstallmentType {
  @Field(() => Int)
  months: number;

  @Field(() => Float)
  interestRate: number;
}

@InputType()
export class CreateInstallmentInput {
  @Field(() => Int)
  months: number;

  @Field(() => Float)
  interestRate: number;
}

@InputType()
export class UpdateInstallmentInput {
  @Field(() => Int, { nullable: true })
  months?: number;

  @Field(() => Float, { nullable: true })
  interestRate?: number;
}
