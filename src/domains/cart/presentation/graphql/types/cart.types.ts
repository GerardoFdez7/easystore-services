import { ObjectType, Field, ID, Int, Float, InputType } from '@nestjs/graphql';

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

  @Field()
  updatedAt: Date;

  @Field(() => Float)
  unitPrice: number;

  @Field()
  name: string;

  @Field(() => Float)
  subTotal: number;
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
  total: number;
}

// Input type for creating carts
@InputType()
export class CreateCartInput {
  @Field(() => ID)
  customerId: string;
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
  @Field(() => [ID])
  variantIds: string[];
}

@InputType()
export class UpdateItemQtyInput {
  @Field(() => ID)
  variantId: string;

  @Field(() => Int)
  quantity: number;
}
