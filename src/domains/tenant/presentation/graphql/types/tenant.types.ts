import {
  Field,
  Int,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { CurrencyCodes } from '../../../aggregates/value-objects';

registerEnumType(CurrencyCodes, {
  name: 'CurrencyCodes',
});

@ObjectType('Tenant')
export class TenantType {
  @Field()
  ownerName: string;

  @Field()
  businessName: string;

  @Field()
  domain: string;

  @Field()
  logo: string;

  @Field()
  description: string;

  @Field(() => CurrencyCodes)
  currency: CurrencyCodes;

  @Field(() => Int)
  authIdentityId: number;

  @Field(() => Int)
  defaultPhoneNumberId: number;

  @Field(() => Int)
  defaultShippingAddressId: number;

  @Field(() => Int)
  defaultBillingAddressId: number;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;
}

// Input types for creating and updating tenants

@InputType()
export class CreateTenantInput {
  @Field()
  ownerName: string;

  @Field()
  businessName: string;

  @Field({ nullable: true })
  domain?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => CurrencyCodes, { nullable: true })
  currency: CurrencyCodes;
}

@InputType()
export class UpdateTenantInput {
  @Field({ nullable: true })
  ownerName?: string;

  @Field({ nullable: true })
  businessName?: string;

  @Field({ nullable: true })
  domain?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => CurrencyCodes, { nullable: true })
  currency: CurrencyCodes;

  @Field(() => Int, { nullable: true })
  authIdentityId?: number;

  @Field(() => Int, { nullable: true })
  defaultPhoneNumberId?: number;

  @Field(() => Int, { nullable: true })
  defaultShippingAddressId?: number;

  @Field(() => Int, { nullable: true })
  defaultBillingAddressId?: number;
}
