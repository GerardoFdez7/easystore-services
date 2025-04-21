import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
