import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Tenant')
export class TenantType {
  @Field(() => ID)
  id: string;

  @Field()
  ownerName: string;

  @Field()
  businessName: string;

  @Field()
  email: string;
}
