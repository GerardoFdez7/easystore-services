import { ObjectType, Field, ID, Int, Float, InputType } from '@nestjs/graphql';

@ObjectType('FirstAttribute')
export class FirstAttributeType {
  @Field()
  key: string;

  @Field()
  value: string;
}

@ObjectType('CartItem')
export class CartItemType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  qty: number;

  @Field(() => ID)
  variantId: string;

  @Field(() => ID, { nullable: true })
  promotionId?: string | null;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field({ nullable: true })
  productName?: string;

  @Field(() => Float, { nullable: true })
  subTotal?: number;

  @Field(() => FirstAttributeType, { nullable: true })
  firstAttribute?: FirstAttributeType;
}

@ObjectType('Cart')
export class CartType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  customerId: string;

  @Field(() => [CartItemType])
  cartItems: CartItemType[];

  @Field(() => Float)
  totalCart: number;
}

@ObjectType('PaginatedCart')
export class PaginatedCartType {
  @Field(() => [CartItemType])
  cartItems: CartItemType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => Float)
  totalCart: number;
}

@InputType()
export class AddItemToCartInput {
  @Field(() => ID)
  variantId: string;

  @Field(() => ID, { nullable: true })
  promotionId?: string;
}

@InputType()
export class RemoveItemFromCartInput {
  @Field(() => ID)
  variantId: string;
}

@InputType()
export class RemoveManyItemFromCartInput {
  @Field(() => [ID], { nullable: false })
  variantIds: string[];
}

@InputType()
export class UpdateItemQtyInput {
  @Field(() => ID)
  variantId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class GetCartPaginatedInput {
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
}
