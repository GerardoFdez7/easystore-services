import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType('StockPerWarehouse')
export class StockPerWarehouseDTO {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  qtyAvailable: number;

  @Field(() => Int)
  qtyReserved: number;

  @Field()
  productLocation: string;

  @Field({ nullable: true })
  estimatedReplenishmentDate?: Date;

  @Field({ nullable: true })
  lotNumber?: string;

  @Field(() => [String], { nullable: true })
  serialNumbers?: string[];

  @Field(() => ID)
  variantId: string;

  @Field(() => ID)
  warehouseId: string;
}

/**
 * Interface for paginated stock per warehouse results
 */
export interface PaginatedStockPerWarehousesDTO {
  stockPerWarehouses: StockPerWarehouseDTO[];
  total: number;
  hasMore: boolean;
}
