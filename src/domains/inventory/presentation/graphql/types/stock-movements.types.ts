import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { VariantAttributeType } from './';

@ObjectType('StockMovement')
export class StockMovementType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  deltaQty: number;

  @Field()
  reason: string;

  @Field(() => ID)
  warehouseId: string;

  @Field()
  occurredAt: Date;

  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  variantSku?: string;

  @Field(() => VariantAttributeType, { nullable: true })
  variantFirstAttribute?: VariantAttributeType;
}

@ObjectType()
export class PaginatedStockMovementsType {
  @Field(() => [StockMovementType])
  stockMovements: StockMovementType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
