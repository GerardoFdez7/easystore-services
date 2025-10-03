import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';
import { StockPerWarehouseType } from './';

@ObjectType('Warehouse')
export class WarehouseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID)
  addressId: string;

  @Field({ nullable: true })
  addressLine1?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  countryCode?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field(() => [StockPerWarehouseType])
  stockPerWarehouses: StockPerWarehouseType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedWarehousesType {
  @Field(() => [WarehouseType])
  warehouses: WarehouseType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

// Input type for creating warehouses
@InputType()
export class CreateWarehouseInput {
  @Field()
  name: string;

  @Field(() => ID)
  addressId: string;
}

// Input type for updating warehouses
@InputType()
export class UpdateWarehouseInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  addressId?: string;
}

@InputType()
export class OrderBy {
  @Field({ nullable: true })
  product?: string;

  @Field({ nullable: true })
  available?: string;

  @Field({ nullable: true })
  reserved?: string;

  @Field({ nullable: true })
  date?: string;
}

@InputType()
export class FiltersWarehouseInput {
  @Field({ nullable: true })
  variantId?: string;

  @Field({ nullable: true })
  isArchived?: boolean;

  @Field({ nullable: true })
  lowStockThreshold?: number;

  @Field(() => OrderBy, { nullable: true })
  orderBy?: OrderBy;
}
