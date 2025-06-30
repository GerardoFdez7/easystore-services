import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

import { registerEnumType } from '@nestjs/graphql';
import { AddressTypes } from '.prisma/postgres';

registerEnumType(AddressTypes, {
  name: 'AddressTypes',
  description: 'Types of addresses',
});

@ObjectType()
export class AddressType {
  @Field(() => String)
  name: string;

  @Field(() => String)
  addressLine1: string;

  @Field(() => String)
  addressLine2: string;

  @Field(() => String)
  postalCode: string;

  @Field(() => String)
  city: string;

  @Field(() => ID)
  countryId: string;

  @Field(() => AddressTypes)
  addressType: AddressTypes;

  @Field(() => String)
  deliveryNum: string;

  @Field(() => ID)
  tenantId: string;

  @Field(() => ID)
  customerId: string;
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

  @Field(() => String, { nullable: true })
  postalCode?: string;

  @Field(() => String)
  city: string;

  @Field(() => ID)
  countryId: string;

  @Field(() => AddressTypes)
  addressType: AddressTypes;

  @Field(() => String, { nullable: true })
  deliveryNum?: string;

  @Field(() => ID, { nullable: true })
  tenantId?: string;

  @Field(() => ID, { nullable: true })
  customerId?: string;
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

  @Field(() => ID, { nullable: true })
  countryId?: string;

  @Field(() => AddressTypes, { nullable: true })
  addressType?: AddressTypes;

  @Field(() => String, { nullable: true })
  deliveryNum?: string;
}
