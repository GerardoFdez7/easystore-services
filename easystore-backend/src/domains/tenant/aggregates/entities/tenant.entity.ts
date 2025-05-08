import { Entity, EntityProps } from '@shared/domains/entity.base';
import { BusinessName, Email, Id, OwnerName, Password } from '../value-objects';
import { TenantCreatedEvent } from '../events/tenant-created.event';

export interface TenantProps extends EntityProps {
  id: Id;
  businessName: BusinessName;
  ownerName: OwnerName;
  email: Email;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends Entity<TenantProps> {
  constructor(props: TenantProps) {
    super(props);
  }

  // Factory method to create a new Tenant
  static create(
    businessNameStr: string,
    ownerNameStr: string,
    emailStr: string,
    passwordStr: string,
  ): Tenant {
    const businessName = BusinessName.create(businessNameStr);
    const ownerName = OwnerName.create(ownerNameStr);
    const email = Email.create(emailStr);
    const password = Password.create(passwordStr);

    const tenant = new Tenant({
      id: null,
      businessName,
      ownerName,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Apply domain event
    tenant.apply(new TenantCreatedEvent(tenant));

    return tenant;
  }

  // Domain logic methods would go here (CUD operations)
}
