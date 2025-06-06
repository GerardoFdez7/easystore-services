import { Field, ObjectType, Float, InputType } from '@nestjs/graphql';

@ObjectType('Installment')
export class InstallmentType {
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
