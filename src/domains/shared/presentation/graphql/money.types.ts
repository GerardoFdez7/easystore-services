import { Field, ObjectType } from '@nestjs/graphql';
import { DecimalValue } from './decimal.scalar';

@ObjectType('Money')
export class MoneyType {
  @Field(() => DecimalValue) amount: string;
  @Field() currency: string;
}
