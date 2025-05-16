import { Entity, EntityProps } from '@domains/entity.base';
import { ITenantType } from '..';
import {
  Id,
  OwnerName,
  BusinessName,
  Domain,
  Logo,
  Description,
} from '../../value-objects';
import { TenantCreatedEvent } from '../../events/tenant-created.event';

export interface ITenantProps extends EntityProps {
  id: Id;
  businessName: BusinessName;
  ownerName: OwnerName;
  domain?: Domain | null;
  logo?: Logo | null;
  description?: Description | null;
  authIdentityId: Id;
  defaultPhoneNumberId?: Id | null;
  defaultShippingAddressId?: Id | null;
  defaultBillingAddressId?: Id | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends Entity<ITenantProps> {
  constructor(props: ITenantProps) {
    super(props);
  }

  // Factory method to create a new Tenant
  static create(props: ITenantType): Tenant {
    const transformedProps = {
      businessName: BusinessName.create(props.businessName),
      ownerName: OwnerName.create(props.ownerName),
      domain: props.domain
        ? Domain.create(props.domain)
        : Domain.createDefault(props.businessName),
      logo: props.logo ? Logo.create(props.logo) : null,
      description: props.description
        ? Description.create(props.description)
        : null,
      authIdentityId: Id.create(props.authIdentityId),
    };

    const tenant = new Tenant({
      id: null,
      ...transformedProps,
      defaultPhoneNumberId: null,
      defaultShippingAddressId: null,
      defaultBillingAddressId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Apply domain event
    tenant.apply(new TenantCreatedEvent(tenant));

    return tenant;
  }

  // Domain logic methods would go here (CUD operations)
}
