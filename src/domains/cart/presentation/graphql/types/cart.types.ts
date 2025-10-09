import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';

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
}

@ObjectType('Cart')
export class CartType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  customerId: string;

  @Field(() => [CartItemType])
  cartItems: CartItemType[];
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
  cartId: string;

  @Field(() => Int)
  qty: number;

  @Field(() => ID)
  variantId: string;

  @Field(() => ID, { nullable: true })
  promotionId?: string;
}

@InputType()
export class RemoveItemFromCartInput {
  @Field(() => ID)
  cartId: string;

  @Field(() => ID)
  variantId: string;
}
