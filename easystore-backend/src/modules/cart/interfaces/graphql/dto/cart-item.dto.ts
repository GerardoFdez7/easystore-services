import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CartItemDto {
  @Field()
  productId: string;

  @Field()
  quantity: number;
}
