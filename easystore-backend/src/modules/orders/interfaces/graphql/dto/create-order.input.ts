import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  cartId: number;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  addressId: number;
}
