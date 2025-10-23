import { Entity, EntityProps } from '@shared/entity.base';
import { Id, Name } from '@shared/value-objects';
import { CustomerCreatedEvent } from '../events';
import { ICustomerCreate } from './customer.attributes';

export interface ICustomerProps extends EntityProps {
  id: Id;
  name: Name;
  tenantId: Id;
  authIdentityId: Id;
  defaultPhoneNumberId?: Id;
  defaultShippingAddressId?: Id;
  defaultBillingAddressId?: Id;
  updatedAt: Date;
  createdAt: Date;
}

export class Customer extends Entity<ICustomerProps> {
  private constructor(props: ICustomerProps) {
    super(props);
  }

  static reconstitute(props: ICustomerProps): Customer {
    return new Customer(props);
  }

  static create(input: ICustomerCreate): Customer {
    const customer = new Customer({
      id: Id.generate(),
      name: Name.create(input.name),
      tenantId: Id.create(input.tenantId),
      authIdentityId: Id.create(input.authIdentityId),
      defaultPhoneNumberId: input.defaultPhoneNumberId
        ? Id.create(input.defaultPhoneNumberId)
        : undefined,
      defaultShippingAddressId: input.defaultShippingAddressId
        ? Id.create(input.defaultShippingAddressId)
        : undefined,
      defaultBillingAddressId: input.defaultBillingAddressId
        ? Id.create(input.defaultBillingAddressId)
        : undefined,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    // Apply domain event
    customer.apply(new CustomerCreatedEvent(customer));

    return customer;
  }
}
