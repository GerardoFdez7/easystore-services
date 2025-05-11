import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthTokenType {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
