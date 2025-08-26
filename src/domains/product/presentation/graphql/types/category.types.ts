import { Field, ObjectType, InputType, ID } from '@nestjs/graphql';

// Query types for product categories
@ObjectType('ProductCategory')
export class ProductCategoryType {
  @Field(() => ID)
  categoryId: string;

  @Field({ nullable: true })
  categoryName?: string;
}

// Input types for creating product categories
@InputType()
export class CreateProductCategoryInput {
  @Field(() => ID)
  categoryId: string;
}

// Input types for updating product categories
@InputType()
export class UpdateProductCategoryInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;
}
