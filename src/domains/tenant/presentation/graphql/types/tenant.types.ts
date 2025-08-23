import {
  Field,
  ID,
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

  @Field({ nullable: true })
  logo: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => CurrencyCodes)
  currency: CurrencyCodes;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}

// Input type for update

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
  currency?: CurrencyCodes;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;
}
