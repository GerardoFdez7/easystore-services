import { Field, ObjectType, InputType, ID } from '@nestjs/graphql';

// Query types for product categories
@ObjectType('ProductCategory')
export class ProductCategoryType {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  categoryName?: string;

  @Field({ nullable: true })
  categoryDescription?: string;

  @Field({ nullable: true })
  categoryCover?: string;
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
