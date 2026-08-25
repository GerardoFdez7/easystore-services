import {
  ArgsType,
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { WishListSortBy } from '../../../application/queries/many/wish-list/find-wish-list-items.dto';

export { WishListSortBy };

@ArgsType()
export class CustomerReviewPaginationArgs {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  page?: number;

  @Field(() => Int, { defaultValue: 25, nullable: true })
  limit?: number;

  @Field(() => [ID], { defaultValue: [], nullable: true })
  reviewIds?: string[];
}

@ObjectType('CustomerFirstAttribute')
export class FirstAttributeType {
  @Field()
  key: string;

  @Field()
  value: string;
}

@ObjectType('Customer')
export class CustomerType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

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

@ObjectType('WishListMultiStatusSummary')
export class WishListMultiStatusSummaryType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  successful: number;

  @Field(() => Int)
  failed: number;
}

@ObjectType('WishListMultiStatusResult')
export class WishListMultiStatusResultType {
  @Field(() => ID, { nullable: true })
  id: string | null;

  @Field(() => ID)
  variantId: string;

  @Field(() => Int)
  status: number;

  @Field()
  message: string;
}

@ObjectType('WishListMultiStatus')
export class WishListMultiStatusType {
  @Field(() => WishListMultiStatusSummaryType)
  summary: WishListMultiStatusSummaryType;

  @Field(() => [WishListMultiStatusResultType])
  results: WishListMultiStatusResultType[];
}

@ObjectType('Wishlist')
export class WishListType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  variantId: string;

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
  isArchived?: boolean;
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

@ObjectType('CustomerReviewProduct')
export class CustomerReviewProductType {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  ratingCount: number;

  @Field()
  comment: string;

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
  isArchived?: boolean;
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
