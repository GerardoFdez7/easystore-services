import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('Tenant')
export class TenantType {
  @Field(() => ID)
  id: number;

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

  @Field(() => ID)
  authIdentityId: number;

  @Field(() => ID)
  defaultPhoneNumberId: number;

  @Field(() => ID)
  defaultShippingAddressId: number;

  @Field(() => ID)
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

  @Field(() => ID)
  authIdentityId: number;
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

  @Field(() => ID, { nullable: true })
  authIdentityId?: number;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: number;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: number;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: number;
}
