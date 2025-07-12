import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Warehouse')
export class WarehouseDTO {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  addressId: string;

  @Field()
  tenantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

/**
 * Interface for paginated warehouse results
 */
export interface PaginatedWarehousesDTO {
  warehouses: WarehouseDTO[];
  total: number;
  hasMore: boolean;
} 