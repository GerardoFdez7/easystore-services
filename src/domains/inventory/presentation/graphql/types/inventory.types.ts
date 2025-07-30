import { InputType, Field, ID, Int, ObjectType } from '@nestjs/graphql';

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

@InputType()
export class CreateStockPerWarehouseInput {
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

  @Field(() => ID)
  tenantId: string;
}

@InputType()
export class UpdateStockPerWarehouseInput {
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

  @Field(() => ID, { nullable: true })
  tenantId?: string;
}

@InputType()
export class CreateWarehouseInput {
  @Field()
  name: string;

  @Field(() => ID)
  addressId: string;

  @Field(() => ID)
  tenantId: string;
}

@InputType()
export class UpdateWarehouseInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  addressId?: string;

  @Field(() => ID, { nullable: true })
  tenantId?: string;
}
