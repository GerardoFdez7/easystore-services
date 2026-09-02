import { Field, ObjectType } from '@nestjs/graphql';
import { DecimalScalar } from './decimal.scalar';

@ObjectType('Money')
export class MoneyType {
  @Field(() => DecimalScalar) amount: string;
  @Field() currency: string;
}
