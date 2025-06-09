import {
  Field,
  Int,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';

export enum AccountType {
  TENANT = 'TENANT',
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
}

registerEnumType(AccountType, {
  name: 'AccountType',
});

@ObjectType('AuthIdentity')
export class AuthIdentityType {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => AccountType)
  accountType: AccountType;

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

  @Field(() => AccountType)
  accountType: AccountType;
}

// Input para login
@InputType()
export class LoginAuthInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
