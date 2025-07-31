import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';

@ObjectType('Category')
export class CategoryType {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  cover: string;

  @Field(() => [CategoryType])
  subCategories: CategoryType[];

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaginatedCategoriesType {
  @Field(() => [CategoryType])
  categories: CategoryType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

// Input type for creating categories
@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => [CreateCategoryInput], { nullable: true })
  subCategories?: CreateCategoryInput[];

  @Field(() => ID, { nullable: true })
  parentId?: string;
}

// Input type for updating categories
@InputType()
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => [UpdateCategoryInput], { nullable: true })
  subCategories?: UpdateCategoryInput[];

  @Field(() => ID, { nullable: true })
  parentId?: string;
}
