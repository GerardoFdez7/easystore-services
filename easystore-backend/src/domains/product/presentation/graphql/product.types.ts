import { Field, ID, ObjectType, Float, InputType, Int } from '@nestjs/graphql';

@ObjectType('Attribute')
export class AttributeType {
  @Field()
  key: string;

  @Field()
  value: string;
}

@ObjectType('StockPerWarehouse')
export class StockPerWarehouseType {
  @Field(() => Int)
  warehouseId: number;

  @Field()
  qtyAvailable: number;

  @Field({ nullable: true })
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

@ObjectType('Dimension')
export class DimensionType {
  @Field(() => Float)
  height: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  length: number;
}

@ObjectType('Variant')
export class VariantType {
  @Field(() => [AttributeType])
  attributes: AttributeType[];

  @Field(() => [StockPerWarehouseType])
  stockPerWarehouse: StockPerWarehouseType[];

  @Field(() => Float)
  price: number;

  @Field()
  currency: string;

  @Field(() => [String], { nullable: true })
  variantMedia?: string[];

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => DimensionType, { nullable: true })
  dimensions?: DimensionType;

  @Field()
  condition: 'NEW' | 'USED' | 'REFURBISHED';

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  upc?: string;

  @Field({ nullable: true })
  ean?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  barcode?: string;
}

@ObjectType('InstallmentDetail')
export class InstallmentDetailType {
  @Field(() => Float)
  months: number;

  @Field(() => Float)
  interestRate: number;
}

@ObjectType('SustainabilityAttribute')
export class SustainabilityAttributeType {
  @Field()
  certification: string;

  @Field(() => Float)
  recycledPercentage: number;
}

@ObjectType('WarrantyDetail')
export class WarrantyDetailType {
  @Field()
  months: number;

  @Field()
  coverage: string;

  @Field()
  instructions: string;
}

@ObjectType('Metadata')
export class MetadataType {
  @Field()
  deleted: boolean;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field({ nullable: true })
  scheduledForHardDeleteAt?: Date;
}

@ObjectType('Product')
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [String], { nullable: true })
  categoryId?: string[];

  @Field()
  shortDescription: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => [VariantType])
  variants: VariantType[];

  @Field()
  type: 'PHYSICAL' | 'DIGITAL';

  @Field()
  cover: string;

  @Field(() => [String], { nullable: true })
  media?: string[];

  @Field(() => [String], { nullable: true })
  availableShippingMethods?: string[];

  @Field(() => [String], { nullable: true })
  shippingRestrictions?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [InstallmentDetailType], { nullable: true })
  installmentPayments?: InstallmentDetailType[];

  @Field(() => [String])
  acceptedPaymentMethods: string[];

  @Field(() => [SustainabilityAttributeType], { nullable: true })
  sustainability?: SustainabilityAttributeType[];

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field(() => WarrantyDetailType, { nullable: true })
  warranty?: WarrantyDetailType;

  @Field(() => MetadataType)
  metadata: MetadataType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedProductsType {
  @Field(() => [ProductType])
  products: ProductType[];

  @Field(() => Int)
  total: number;
}
// Input types for creating and updating products

@InputType()
export class AttributeInput {
  @Field()
  key: string;

  @Field()
  value: string;
}

@InputType()
export class StockPerWarehouseInput {
  @Field(() => Int)
  warehouseId: number;

  @Field({ nullable: true })
  qtyAvailable?: number;

  @Field({ nullable: true })
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

@InputType()
export class DimensionInput {
  @Field(() => Float)
  height: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  length: number;
}

@InputType()
export class VariantInput {
  @Field(() => [AttributeInput])
  attributes: AttributeInput[];

  @Field(() => [StockPerWarehouseInput])
  stockPerWarehouse: StockPerWarehouseInput[];

  @Field(() => Float)
  price: number;

  @Field({ defaultValue: 'USD', nullable: true })
  currency: string;

  @Field(() => [String], { nullable: true })
  variantMedia?: string[];

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => DimensionInput, { nullable: true })
  dimensions?: DimensionInput;

  @Field({ defaultValue: 'NEW', nullable: true })
  condition: 'NEW' | 'USED' | 'REFURBISHED';

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  upc?: string;

  @Field({ nullable: true })
  ean?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  barcode?: string;
}

@InputType()
export class InstallmentDetailInput {
  @Field()
  months: number;

  @Field(() => Float)
  interestRate: number;
}

@InputType()
export class SustainabilityAttributeInput {
  @Field()
  certification: string;

  @Field(() => Float)
  recycledPercentage: number;
}

@InputType()
export class WarrantyDetailInput {
  @Field()
  months: number;

  @Field()
  coverage: string;

  @Field()
  instructions: string;
}

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field(() => [String], { nullable: true })
  categoryId?: string[];

  @Field()
  shortDescription: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => [VariantInput])
  variants: VariantInput[];

  @Field({ defaultValue: 'PHYSICAL', nullable: true })
  type: 'PHYSICAL' | 'DIGITAL';

  @Field(() => [String])
  acceptedPaymentMethods: string[];

  @Field({ nullable: true })
  cover?: string;

  @Field(() => [String], { nullable: true })
  media?: string[];

  @Field(() => [String], { nullable: true })
  availableShippingMethods?: string[];

  @Field(() => [String], { nullable: true })
  shippingRestrictions?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [InstallmentDetailInput], { nullable: true })
  installmentPayments?: InstallmentDetailInput[];

  @Field(() => [SustainabilityAttributeInput], { nullable: true })
  sustainability?: SustainabilityAttributeInput[];

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field(() => WarrantyDetailInput, { nullable: true })
  warranty?: WarrantyDetailInput;
}

@InputType()
export class UpdateAttributeInput {
  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  value?: string;
}

@InputType()
export class UpdateStockPerWarehouseInput {
  @Field(() => Int, { nullable: true })
  warehouseId?: number;

  @Field({ nullable: true })
  qtyAvailable?: number;

  @Field({ nullable: true })
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

@InputType()
export class UpdateDimensionInput {
  @Field(() => Float, { nullable: true })
  height: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  length: number;
}

@InputType()
export class UpdateVariantInput {
  @Field(() => [UpdateAttributeInput], { nullable: true })
  attributes: AttributeInput[];

  @Field(() => [UpdateStockPerWarehouseInput], { nullable: true })
  stockPerWarehouse: StockPerWarehouseInput[];

  @Field(() => Float, { nullable: true })
  price: number;

  @Field({ nullable: true })
  currency: string;

  @Field(() => [String], { nullable: true })
  variantMedia?: string[];

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => UpdateDimensionInput, { nullable: true })
  dimensions?: UpdateDimensionInput;

  @Field({ nullable: true })
  condition: 'NEW' | 'USED' | 'REFURBISHED';

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  upc?: string;

  @Field({ nullable: true })
  ean?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  barcode?: string;
}

@InputType()
export class UpdateInstallmentDetailInput {
  @Field({ nullable: true })
  months: number;

  @Field(() => Float, { nullable: true })
  interestRate: number;
}

@InputType()
export class UpdateSustainabilityAttributeInput {
  @Field({ nullable: true })
  certification?: string;

  @Field(() => Float, { nullable: true })
  recycledPercentage: number;
}

@InputType()
export class UpdateWarrantyDetailInput {
  @Field({ nullable: true })
  months: number;

  @Field({ nullable: true })
  coverage: string;

  @Field({ nullable: true })
  instructions: string;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  categoryId?: string[];

  @Field({ nullable: true })
  shortDescription?: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => [UpdateVariantInput], { nullable: true })
  variants?: UpdateVariantInput[];

  @Field({ nullable: true })
  type?: 'PHYSICAL' | 'DIGITAL';

  @Field({ nullable: true })
  cover?: string;

  @Field(() => [String], { nullable: true })
  media?: string[];

  @Field(() => [String], { nullable: true })
  availableShippingMethods?: string[];

  @Field(() => [String], { nullable: true })
  shippingRestrictions?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [UpdateInstallmentDetailInput], { nullable: true })
  installmentPayments?: UpdateInstallmentDetailInput[];

  @Field(() => [String], { nullable: true })
  acceptedPaymentMethods?: string[];

  @Field(() => [UpdateSustainabilityAttributeInput], { nullable: true })
  sustainability?: UpdateSustainabilityAttributeInput[];

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field(() => UpdateWarrantyDetailInput, { nullable: true })
  warranty?: UpdateWarrantyDetailInput;
}
