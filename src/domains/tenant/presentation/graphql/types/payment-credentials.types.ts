import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PagaditoCredentialsInput {
  @Field()
  uid: string;

  @Field()
  wsk: string;

  @Field({ nullable: true })
  sandbox?: boolean;
}

@InputType()
export class VisanetCredentialsInput {
  @Field()
  merchantId: string;

  @Field()
  merchantKeyId: string;

  @Field()
  merchantSecretKey: string;

  @Field()
  environment: string; // 'sandbox' | 'production'
}

@InputType()
export class PaypalCredentialsInput {
  @Field()
  clientId: string;

  @Field()
  clientSecret: string;
}

@InputType()
export class CreatePaymentCredentialsInput {
  @Field()
  tenantId: string;

  @Field()
  providerType: string;

  @Field(() => PagaditoCredentialsInput, { nullable: true })
  pagaditoCredentials?: PagaditoCredentialsInput;

  @Field(() => VisanetCredentialsInput, { nullable: true })
  visanetCredentials?: VisanetCredentialsInput;

  @Field(() => PaypalCredentialsInput, { nullable: true })
  paypalCredentials?: PaypalCredentialsInput;
}

@InputType()
export class UpdatePaymentCredentialsInput {
  @Field()
  tenantId: string;

  @Field()
  providerType: string;

  @Field(() => PagaditoCredentialsInput, { nullable: true })
  pagaditoCredentials?: PagaditoCredentialsInput;

  @Field(() => VisanetCredentialsInput, { nullable: true })
  visanetCredentials?: VisanetCredentialsInput;

  @Field(() => PaypalCredentialsInput, { nullable: true })
  paypalCredentials?: PaypalCredentialsInput;
}

@InputType()
export class DeletePaymentCredentialsInput {
  @Field()
  tenantId: string;

  @Field()
  providerType: string;
}

@ObjectType()
export class PaymentCredentialsResponse {
  @Field()
  id: string;

  @Field()
  tenantId: string;

  @Field()
  providerType: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
