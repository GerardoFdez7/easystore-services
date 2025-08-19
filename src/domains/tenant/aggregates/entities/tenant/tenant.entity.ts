import { Entity, EntityProps } from '@domains/entity.base';
import { Id, Name, LongDescription, Currency } from '../../value-objects';
import { ITenantType } from '..';
import { Domain, Media } from '../../value-objects';
import { TenantCreatedEvent, TenantUpdatedEvent } from '../../events';

export interface ITenantProps extends EntityProps {
  id: Id;
  businessName: Name;
  ownerName: Name;
  domain?: Domain;
  logo?: Media;
  description?: LongDescription;
  currency: Currency;
  authIdentityId: Id;
  defaultPhoneNumberId?: Id;
  defaultShippingAddressId?: Id;
  defaultBillingAddressId?: Id;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends Entity<ITenantProps> {
  constructor(props: ITenantProps) {
    super(props);
  }

  // Factory method to create a new Tenant
  static create(props: ITenantType): Tenant {
    const businessName = Name.generate();
    const transformedProps = {
      businessName: businessName,
      ownerName: Name.create(props.ownerName),
      domain: props.domain
        ? Domain.create(props.domain)
        : Domain.createDefault(businessName.getValue()),
      logo: props.logo ? Media.create(props.logo) : null,
      description: props.description
        ? LongDescription.create(props.description)
        : null,
      currency: props.currency
        ? Currency.create(props.currency)
        : Currency.create(process.env.DEFAULT_CURRENCY || 'GTQ'),
      authIdentityId: Id.create(props.authIdentityId),
    };

    const tenant = new Tenant({
      id: Id.generate(),
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

  update(props: Partial<ITenantType>): Tenant {
    if (props.ownerName) {
      this.props.ownerName = Name.create(props.ownerName);
    }
    if (props.businessName) {
      this.props.businessName = Name.create(props.businessName);
    }
    if (props.domain) {
      this.props.domain = Domain.create(props.domain);
    }
    if (props.logo) {
      this.props.logo = Media.create(props.logo);
    }
    if (props.description) {
      this.props.description = LongDescription.create(props.description);
    }
    if (props.currency) {
      this.props.currency = Currency.create(props.currency);
    }

    this.props.updatedAt = new Date();

    // Apply domain event
    this.apply(new TenantUpdatedEvent(this));

    return this;
  }
}
