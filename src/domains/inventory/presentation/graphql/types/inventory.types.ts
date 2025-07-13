import { InputType, Field, ID, Int } from '@nestjs/graphql';

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