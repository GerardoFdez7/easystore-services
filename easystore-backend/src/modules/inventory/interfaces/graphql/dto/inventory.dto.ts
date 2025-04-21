import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class InventoryDto {
  @Field()
  productId: string;

  @Field(() => Int)
  warehouseId: number;

  @Field(() => Int)
  quantity: number;

  @Field()
  lastUpdated: Date;

  @Field(() => Int, { nullable: true })
  updatedById?: number;
}
