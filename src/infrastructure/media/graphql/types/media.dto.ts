import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MediaAuthResponse {
  @Field()
  token: string;

  @Field()
  expire: number;

  @Field()
  signature: string;

  @Field()
  publicKey: string;
}
