import {
  Field,
  ObjectType,
  InputType,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  VariantType,
  AddVariantToProductInput,
  MediaType,
  CreateMediaInput,
  UpdateMediaInput,
  ProductCategoryType,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  SustainabilityType,
  CreateSustainabilityInput,
  UpdateSustainabilityInput,
} from './';
import { TypeEnum } from '../../../aggregates/value-objects';

// Query types for products
registerEnumType(TypeEnum, {
  name: 'TypeEnum',
});

@ObjectType('Product')
export class ProductType {
  @Field()
  name: string;

  @Field()
  shortDescription: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => TypeEnum)
  productType: TypeEnum;

  @Field()
  cover: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => Boolean)
  isArchived: boolean;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => [VariantType], { nullable: true })
  variants?: VariantType[];

  @Field(() => [MediaType], { nullable: true })
  media?: MediaType[];

  @Field(() => [ProductCategoryType], { nullable: true })
  categories?: ProductCategoryType[];

  @Field(() => [SustainabilityType], { nullable: true })
  sustainabilities?: SustainabilityType[];
}

@ObjectType()
export class PaginatedProductsType {
  @Field(() => [ProductType])
  products: ProductType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

// Input types for creating products
@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field()
  shortDescription: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => [AddVariantToProductInput])
  variants: AddVariantToProductInput[];

  @Field(() => TypeEnum, { nullable: true })
  productType: TypeEnum;

  @Field({ nullable: true })
  cover?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field(() => [CreateMediaInput], { nullable: true })
  media?: CreateMediaInput[];

  @Field(() => [CreateProductCategoryInput], { nullable: true })
  categories?: CreateProductCategoryInput[];

  @Field(() => [CreateSustainabilityInput], { nullable: true })
  sustainabilities?: CreateSustainabilityInput[];
}

// Input types for updating products
@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => TypeEnum, { nullable: true })
  productType?: TypeEnum;

  @Field({ nullable: true })
  cover?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field(() => [UpdateMediaInput], { nullable: true })
  media?: UpdateMediaInput[];

  @Field(() => [UpdateProductCategoryInput], { nullable: true })
  categories?: UpdateProductCategoryInput[];

  @Field(() => [UpdateSustainabilityInput], { nullable: true })
  sustainabilities?: UpdateSustainabilityInput[];
}
