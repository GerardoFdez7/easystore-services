import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType('Customer')
export class CustomerType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID)
  tenantId: string;

  @Field(() => ID)
  authIdentityId: string;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  createdAt?: Date;
}

@InputType()
export class UpdateCustomerInput {
  @Field()
  name: string;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;
}

@InputType()
export class WishListItemCreateInput {
  @Field()
  variantId: string;
}

@InputType()
export class WishListItemDeleteInput {
  @Field()
  variantId: string;
}

@ObjectType('Wishlist')
export class WishListType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => ID)
  customerId: string;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateCustomerInput {
  @Field()
  name: string;

  @Field(() => ID)
  tenantId: string;

  @Field(() => ID)
  authIdentityId: string;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;
}
