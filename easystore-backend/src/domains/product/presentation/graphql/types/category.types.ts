import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

// Query types for product categories
@ObjectType('ProductCategory')
export class ProductCategoryType {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  categoryId: number;
}

// Input types for creating product categories
@InputType()
export class CreateProductCategoryInput {
  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  categoryId: number;
}

// Input types for updating product categories
@InputType()
export class UpdateProductCategoryInput {
  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;
}
