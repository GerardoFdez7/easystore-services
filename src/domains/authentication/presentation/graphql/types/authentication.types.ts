import {
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

@ObjectType('Response')
export class ResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

// Input to register or login a new AuthIdentity
@InputType()
export class AuthenticationInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => AccountTypeEnum)
  accountType: AccountTypeEnum;
}

// Input for forgot password request
@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;

  @Field(() => AccountTypeEnum)
  accountType: AccountTypeEnum;
}

// Input for update password request
@InputType()
export class UpdatePasswordInput {
  @Field()
  token: string;

  @Field()
  password: string;
}

// Input for get in touch request
@InputType()
export class GetInTouchInput {
  @Field()
  fullName: string;

  @Field()
  businessEmail: string;

  @Field()
  businessPhone: string;

  @Field()
  company: string;

  @Field()
  websiteUrl: string;

  @Field()
  country: string;

  @Field()
  annualRevenue: string;

  @Field()
  isAgency: string;
}
