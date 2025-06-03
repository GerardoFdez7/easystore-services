import {
  Field,
  ObjectType,
  Float,
  InputType,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  MediaType,
  CreateMediaInput,
  UpdateMediaInput,
  WarrantyType,
  CreateWarrantyInput,
  UpdateWarrantyInput,
  InstallmentType,
  CreateInstallmentInput,
  UpdateInstallmentInput,
} from './';
import { ConditionEnum } from '../../../aggregates/value-objects';

// Query types for variants
registerEnumType(ConditionEnum, {
  name: 'ConditionEnum',
});

@ObjectType('Attribute')
export class AttributeType {
  @Field()
  key: string;

  @Field()
  value: string;
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
  @Field(() => Int)
  id: number;

  @Field(() => [AttributeType])
  attributes: AttributeType[];

  @Field(() => Float)
  price: number;

  @Field(() => String, { nullable: true })
  variantCover?: string;

  @Field(() => ConditionEnum)
  condition: ConditionEnum;

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => DimensionType, { nullable: true })
  dimensions?: DimensionType;

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

  @Field(() => [MediaType], { nullable: true })
  variantMedia?: MediaType[];

  @Field(() => [WarrantyType], { nullable: true })
  warranties?: WarrantyType[];

  @Field(() => [InstallmentType], { nullable: true })
  installmentPayments?: InstallmentType[];
}

// Input types for creating variants
@InputType()
export class CreateAttributeInput {
  @Field()
  key: string;

  @Field()
  value: string;
}

@InputType()
export class CreateDimensionInput {
  @Field(() => Float)
  height: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  length: number;
}

@InputType()
export class AddVariantToProductInput {
  @Field(() => [CreateAttributeInput])
  attributes: CreateAttributeInput[];

  @Field(() => Float)
  price: number;

  @Field(() => String, { nullable: true })
  variantCover?: string;

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => CreateDimensionInput, { nullable: true })
  dimensions?: CreateDimensionInput;

  @Field(() => ConditionEnum, {
    defaultValue: ConditionEnum.NEW,
    nullable: true,
  })
  condition: ConditionEnum;

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

  @Field(() => [CreateMediaInput], { nullable: true })
  variantMedia?: CreateMediaInput[];

  @Field(() => [CreateWarrantyInput], { nullable: true })
  warranties?: CreateWarrantyInput[];

  @Field(() => [CreateInstallmentInput], { nullable: true })
  installmentPayments?: CreateInstallmentInput[];
}

@InputType()
export class CreateVariantInput {
  @Field(() => [CreateAttributeInput])
  attributes: CreateAttributeInput[];

  @Field(() => Float)
  price: number;

  @Field(() => String, { nullable: true })
  variantCover?: string;

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => CreateDimensionInput, { nullable: true })
  dimensions?: CreateDimensionInput;

  @Field(() => ConditionEnum, {
    defaultValue: ConditionEnum.NEW,
    nullable: true,
  })
  condition: ConditionEnum;

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

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  tenantId: number;

  @Field(() => [CreateMediaInput], { nullable: true })
  variantMedia?: CreateMediaInput[];

  @Field(() => [CreateWarrantyInput], { nullable: true })
  warranties?: CreateWarrantyInput[];

  @Field(() => [CreateInstallmentInput], { nullable: true })
  installmentPayments?: CreateInstallmentInput[];
}

// Input types for updating variants
@InputType()
export class UpdateAttributeInput {
  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  value?: string;
}

@InputType()
export class UpdateDimensionInput {
  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  width?: number;

  @Field(() => Float, { nullable: true })
  length?: number;
}

@InputType()
export class UpdateVariantInput {
  @Field(() => [UpdateAttributeInput], { nullable: true })
  attributes?: UpdateAttributeInput[];

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => String, { nullable: true })
  variantCover?: string;

  @Field(() => [String], { nullable: true })
  personalizationOptions?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => UpdateDimensionInput, { nullable: true })
  dimensions?: UpdateDimensionInput;

  @Field(() => ConditionEnum, { nullable: true })
  condition?: ConditionEnum;

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

  @Field(() => [UpdateMediaInput], { nullable: true })
  variantMedia?: UpdateMediaInput[];

  @Field(() => [UpdateWarrantyInput], { nullable: true })
  warranties?: UpdateWarrantyInput[];

  @Field(() => [UpdateInstallmentInput], { nullable: true })
  installmentPayments?: UpdateInstallmentInput[];
}
