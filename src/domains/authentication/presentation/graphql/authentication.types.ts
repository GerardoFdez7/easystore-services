import {
  Field,
  Int,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { AccountTypeEnum } from '../../aggregates/value-objects';

registerEnumType(AccountTypeEnum, {
  name: 'AccountTypeEnum',
});

@ObjectType('AuthIdentity')
export class AuthIdentityType {
  @Field(() => Int)
  id: number;

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

// Input para crear un nuevo AuthIdentity (sign up)
@InputType()
export class RegisterAuthInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => AccountTypeEnum)
  accountType: AccountTypeEnum;
}

// Input para login
@InputType()
export class LoginAuthInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
