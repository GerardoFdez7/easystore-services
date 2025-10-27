import { ObjectType, Field, ID, InputType, Float, Int } from '@nestjs/graphql';
import { FirstAttributeType } from '../../../../cart/presentation/graphql/types/cart.types';

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

@InputType()
export class WishListManyItemsInput {
  @Field(() => [String])
  variantIds: string[];
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

@ObjectType('WishListWithVariant')
export class WishListWithVariantType extends WishListType {
  @Field()
  sku: string;

  @Field()
  productName: string;

  @Field(() => FirstAttributeType, { nullable: true })
  firstAttribute?: FirstAttributeType;

  @Field(() => Float)
  price: number;

  @Field(() => Boolean, { nullable: true })
  isArchived: boolean;
}

@ObjectType('PaginatedWishlist')
export class PaginatedWishlistType {
  @Field(() => [WishListWithVariantType])
  wishlistItems: WishListWithVariantType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@InputType()
export class GetWishlistPaginatedInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: 'Page number for pagination (starts from 1)',
    nullable: true,
  })
  page?: number;

  @Field(() => Int, {
    defaultValue: 25,
    description: 'Number of items per page (max 50)',
    nullable: true,
  })
  limit?: number;

  @Field(() => [ID], {
    description: 'Optional filter by variant IDs',
    nullable: true,
  })
  variantIds?: string[];
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
