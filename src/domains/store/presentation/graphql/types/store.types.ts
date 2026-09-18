import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CurrencyCodes } from '../../../aggregates/value-objects';

registerEnumType(CurrencyCodes, { name: 'CurrencyCodes' });

@ObjectType('Store')
export class StoreType {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) name?: string;
  @Field(() => String, { nullable: true }) domain?: string;
  @Field(() => String, { nullable: true }) logo?: string;
  @Field(() => String, { nullable: true }) description?: string;
  @Field(() => CurrencyCodes) currency: CurrencyCodes;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@InputType()
export class CreateStoreInput {
  @Field(() => String, { nullable: true }) name?: string;
  @Field(() => String, { nullable: true }) domain?: string;
  @Field(() => String, { nullable: true }) logo?: string;
  @Field(() => String, { nullable: true }) description?: string;
  @Field(() => CurrencyCodes, { nullable: true }) currency?: CurrencyCodes;
}

@InputType()
export class UpdateStoreInput extends CreateStoreInput {}

@ObjectType()
export class PaginatedStoresType {
  @Field(() => [StoreType]) stores: StoreType[];
  @Field(() => Int) total: number;
  @Field(() => Boolean) hasMore: boolean;
}
