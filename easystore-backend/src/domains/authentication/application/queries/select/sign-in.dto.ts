import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class AuthenticationLoginDTO {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  accountType: string;
}

@ObjectType()
export class AuthenticationLoginResponseDTO {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

export class AuthenticationLoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly accountType: string,
  ) {}
}
