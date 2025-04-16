import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ClientType {
  @Field(() => Int)
  id: number;

  @Field() businessName: string;
  @Field() ownerName: string;
  @Field() email: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
