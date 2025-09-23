import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { AddressTypeEnum } from '../../../aggregates/value-objects';

registerEnumType(AddressTypeEnum, {
  name: 'AddressTypeEnum',
  description: 'Types of addresses',
});

@ObjectType()
export class AddressType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  addressLine1: string;

  @Field(() => String, { nullable: true })
  addressLine2?: string;

  @Field(() => String)
  postalCode: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  stateId: string;

  @Field(() => String)
  countryId: string;

  @Field(() => AddressTypeEnum)
  addressType: AddressTypeEnum;

  @Field(() => String)
  deliveryNum: string;

  @Field(() => String, { nullable: true })
  deliveryInstructions?: string;
}

@ObjectType()
export class PaginatedAddressesType {
  @Field(() => [AddressType])
  addresses: AddressType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

//Input type for creating address
@InputType()
export class CreateAddressInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  addressLine1: string;

  @Field(() => String, { nullable: true })
  addressLine2?: string;

  @Field(() => String)
  postalCode: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  countryId: string;

  @Field(() => String)
  stateId: string;

  @Field(() => AddressTypeEnum)
  addressType: AddressTypeEnum;

  @Field(() => String)
  deliveryNum: string;

  @Field(() => String, { nullable: true })
  deliveryInstructions?: string;
}

@InputType()
export class UpdateAddressInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  addressLine1?: string;

  @Field(() => String, { nullable: true })
  addressLine2?: string;

  @Field(() => String, { nullable: true })
  postalCode?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  countryId?: string;

  @Field(() => String, { nullable: true })
  stateId?: string;

  @Field(() => AddressTypeEnum, { nullable: true })
  addressType?: AddressTypeEnum;

  @Field(() => String, { nullable: true })
  deliveryNum?: string;

  @Field(() => String, { nullable: true })
  deliveryInstructions?: string;
}
