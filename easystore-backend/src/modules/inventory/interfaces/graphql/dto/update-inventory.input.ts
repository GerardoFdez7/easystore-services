import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt } from 'class-validator';

@InputType()
export class UpdateInventoryInput {
  @Field()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsInt()
  warehouseId: number;

  @Field(() => Int)
  @IsInt()
  quantity: number;

  @Field()
  @IsString()
  reason: string;
}
