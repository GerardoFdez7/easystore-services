import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  sku: string;

  @Field(() => Int)
  stock: number;

  @Field()
  categoryId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
