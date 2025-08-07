import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';

@ObjectType('StockPerWarehouse')
export class StockPerWarehouseType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  qtyAvailable: number;

  @Field(() => Int)
  qtyReserved: number;

  @Field({ nullable: true })
  productLocation?: string;

  @Field({ nullable: true })
  estimatedReplenishmentDate?: Date;

  @Field({ nullable: true })
  lotNumber?: string;

  @Field(() => [String], { nullable: true })
  serialNumbers?: string[];

  @Field(() => ID)
  warehouseId: string;
}

// Input type for adding stock to warehouse
@InputType()
export class AddStockToWarehouseInput {
  @Field(() => Int)
  qtyAvailable: number;

  @Field(() => Int, { nullable: true })
  qtyReserved?: number;

  @Field({ nullable: true })
  productLocation?: string;

  @Field({ nullable: true })
  estimatedReplenishmentDate?: Date;

  @Field({ nullable: true })
  lotNumber?: string;

  @Field(() => [String], { nullable: true })
  serialNumbers?: string[];
}

// Input type for updating stock in warehouse
@InputType()
export class UpdateStockInWarehouseInput {
  @Field(() => Int, { nullable: true })
  qtyAvailable?: number;

  @Field(() => Int, { nullable: true })
  qtyReserved?: number;

  @Field({ nullable: true })
  productLocation?: string;

  @Field({ nullable: true })
  estimatedReplenishmentDate?: Date;

  @Field({ nullable: true })
  lotNumber?: string;

  @Field(() => [String], { nullable: true })
  serialNumbers?: string[];
}
