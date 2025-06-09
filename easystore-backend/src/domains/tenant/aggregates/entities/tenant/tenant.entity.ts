import { Entity, EntityProps } from '@domains/entity.base';
import { Id, Name, LongDescription, Currency } from '../../value-objects';
import { ITenantType } from '..';
import { Domain, Logo } from '../../value-objects';
import { TenantCreatedEvent } from '../../events/tenant-created.event';

export interface ITenantProps extends EntityProps {
  id: Id;
  businessName: Name;
  ownerName: Name;
  domain?: Domain | null;
  logo?: Logo | null;
  description?: LongDescription | null;
  currency: Currency;
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
      businessName: Name.create(props.businessName),
      ownerName: Name.create(props.ownerName),
      domain: props.domain
        ? Domain.create(props.domain)
        : Domain.createDefault(props.businessName),
      logo: props.logo ? Logo.create(props.logo) : null,
      description: props.description
        ? LongDescription.create(props.description)
        : null,
      currency: props.currency
        ? Currency.create(props.currency)
        : Currency.create(process.env.DEFAULT_CURRENCY || 'GTQ'),
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
