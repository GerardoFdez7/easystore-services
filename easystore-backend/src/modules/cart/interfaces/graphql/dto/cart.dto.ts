import { Field, ObjectType, Int } from '@nestjs/graphql';
import { CartItemDto } from './cart-item.dto';

@ObjectType()
export class CartDto {
  @Field(() => Int)
  userId: number;

  @Field(() => [CartItemDto])
  items: CartItemDto[];
}
