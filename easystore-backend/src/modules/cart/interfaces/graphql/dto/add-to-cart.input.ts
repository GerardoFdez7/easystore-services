import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field()
  @IsNotEmpty()
  productId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}
