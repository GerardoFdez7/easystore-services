import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PaymentDetailInput {
  @Field()
  quantity: number;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  urlProduct?: string;
}

@InputType()
export class VisanetCardInput {
  @Field()
  cardNumber: string;

  @Field()
  expirationDate: string; // Format: MM/YYYY

  @Field()
  cvv: string;

  @Field({ nullable: true })
  capture?: boolean; // true for sale, false for auth only

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  phoneNumber?: string;
}

@InputType()
export class InitiatePaymentInput {
  @Field()
  tenantId: string;

  @Field()
  providerType: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  orderId: string;

  @Field(() => [PaymentDetailInput], { nullable: true })
  details?: PaymentDetailInput[];

  @Field({ nullable: true })
  customParams?: string;

  @Field({ nullable: true })
  allowPendingPayments?: boolean;

  @Field({ nullable: true })
  externalReferenceNumber?: string;

  // VisaNet specific fields
  @Field(() => VisanetCardInput, { nullable: true })
  visanetCard?: VisanetCardInput;
}

@ObjectType()
export class PaymentResultOutput {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  checkoutUrl?: string;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  correlationId?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  environment?: string;
}
