import {
  ID,
  Field,
  Int,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { AccountTypeEnum } from '../../../aggregates/value-objects';

registerEnumType(AccountTypeEnum, {
  name: 'AccountTypeEnum',
});

@ObjectType('AuthIdentity')
export class AuthIdentityType {
  @Field()
  email: string;

  @Field(() => AccountTypeEnum)
  accountType: AccountTypeEnum;

  @Field()
  isActive: boolean;

  @Field()
  emailVerified: boolean;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field(() => Int)
  failedAttempts: number;

  @Field({ nullable: true })
  lockedUntil?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('LoginResponse')
export class LoginResponseType {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => ID)
  userId: string;
}

// Input to create a new AuthIdentity
@InputType()
export class RegisterAuthInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => AccountTypeEnum)
  accountType: AccountTypeEnum;
}

// Input for login
@InputType()
export class LoginAuthInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => AccountTypeEnum)
  accountType: AccountTypeEnum;
}
