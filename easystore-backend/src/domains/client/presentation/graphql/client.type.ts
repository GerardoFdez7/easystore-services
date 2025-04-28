import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Client')
export class ClientType {
  @Field(() => ID)
  id: string;

  @Field()
  ownerName: string;

  @Field()
  businessName: string;

  @Field()
  email: string;
}
