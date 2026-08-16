import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  page?: number;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  limit?: number;

  @Field(() => String, { nullable: true })
  name?: string;
}
