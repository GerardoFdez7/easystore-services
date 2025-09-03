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
}
