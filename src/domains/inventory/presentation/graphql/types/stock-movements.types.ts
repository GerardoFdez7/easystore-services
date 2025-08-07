import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

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
