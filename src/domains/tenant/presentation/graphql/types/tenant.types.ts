import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('Tenant')
export class TenantType {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => ID, { nullable: true })
  defaultStoreId?: string;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}

// Input type for update
@InputType()
export class UpdateTenantInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  defaultPhoneNumberId?: string;

  @Field(() => ID, { nullable: true })
  defaultShippingAddressId?: string;

  @Field(() => ID, { nullable: true })
  defaultBillingAddressId?: string;
}
