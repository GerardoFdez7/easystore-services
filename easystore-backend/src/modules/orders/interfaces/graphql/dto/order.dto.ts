import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { OrderItemDto } from './order-item.dto';

@ObjectType()
export class OrderDto {
  @Field(() => Int)
  orderId: number;

  @Field()
  orderNumber: string;

  @Field(() => [OrderItemDto], { nullable: true })
  items?: OrderItemDto[];

  @Field(() => Float, { nullable: true })
  totalAmount?: number;

  @Field()
  status: string;

  @Field()
  createdAt: Date;
}
