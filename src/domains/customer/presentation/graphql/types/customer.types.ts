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

@ObjectType('PaginatedCustomerReviewProductWithVariant')
export class PaginatedCustomerReviewProductWithVariantType {
  @Field(() => [CustomerReviewProductWithVariantType])
  reviews: CustomerReviewProductWithVariantType[];

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
export class GetCustomerReviewsPaginatedInput {
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
    description: 'Optional filter by review IDs',
    nullable: true,
  })
  reviewIds?: string[];
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

@ObjectType('CustomerReviewProduct')
export class CustomerReviewProductType {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  ratingCount: number;

  @Field()
  comment: string;

  @Field(() => ID)
  customerId: string;

  @Field(() => ID)
  variantId: string;

  @Field()
  updatedAt: Date;
}

@ObjectType('CustomerReviewProductWithVariant')
export class CustomerReviewProductWithVariantType extends CustomerReviewProductType {
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

@InputType()
export class CreateCustomerReviewProductInput {
  @Field(() => Float, {
    description: 'Rating from 1.0 to 5.0',
  })
  ratingCount: number;

  @Field({
    description: 'Review comment',
  })
  comment: string;

  @Field(() => ID, {
    description: 'Variant ID being reviewed',
  })
  variantId: string;
}

@InputType()
export class UpdateCustomerReviewProductInput {
  @Field(() => ID, {
    description: 'Review ID to update',
  })
  id: string;

  @Field(() => Float, {
    description: 'Updated rating from 1.0 to 5.0',
    nullable: true,
  })
  ratingCount?: number;

  @Field({
    description: 'Updated review comment',
    nullable: true,
  })
  comment?: string;
}

@InputType()
export class DeleteCustomerReviewProductInput {
  @Field(() => ID, {
    description: 'Review ID to delete',
  })
  id: string;
}
