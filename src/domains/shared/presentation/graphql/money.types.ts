import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { DecimalValue } from './decimal.scalar';

@ObjectType('Money')
export class MoneyType {
  @Field(() => DecimalValue) amount: string;
  @Field() currency: string;
}

@InputType('MoneyInput')
export class MoneyInput {
  @Field(() => DecimalValue) amount: string;
  @Field() currency: string;
}
