import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterClientInput {
  @Field() businessName: string;
  @Field() ownerName: string;
  @Field() email: string;
  @Field() password: string;
}
