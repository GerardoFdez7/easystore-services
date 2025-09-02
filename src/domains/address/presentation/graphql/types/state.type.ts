import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class StateType {
  @Field()
  name: string;

  @Field()
  code: string;
}
