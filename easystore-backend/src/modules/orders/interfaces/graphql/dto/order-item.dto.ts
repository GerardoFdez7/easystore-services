import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class OrderItemDto {
  @Field()
  productId: string;

  @Field()
  productName: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  subtotal: number;
}
