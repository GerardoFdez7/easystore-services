import { Entity, EntityProps } from '@shared/aggregates/entities/entity.base';
import { Id, Name } from '../../value-objects';
import { ITenantBase, ITenantType } from '..';
import { TenantCreatedEvent, TenantUpdatedEvent } from '../../events';

export interface ITenantProps extends EntityProps {
  id: Id;
  name: Name;
  authIdentityId: Id;
  defaultStoreId?: Id;
  defaultPhoneNumberId?: Id;
  defaultShippingAddressId?: Id;
  defaultBillingAddressId?: Id;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends Entity<ITenantProps> {
  private constructor(props: ITenantProps) {
    super(props);
  }

  static reconstitute(props: ITenantProps): Tenant {
    return new Tenant(props);
  }

  static create(props: ITenantBase): Tenant {
    const tenant = new Tenant({
      id: Id.generate(),
      name: Name.create(props.name),
      authIdentityId: Id.create(props.authIdentityId),
      defaultStoreId: null,
      defaultPhoneNumberId: null,
      defaultShippingAddressId: null,
      defaultBillingAddressId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tenant.apply(new TenantCreatedEvent(tenant));

    return tenant;
  }

  update(props: Partial<Omit<ITenantType, 'defaultStoreId'>>): Tenant {
    if (props.name) {
      this.props.name = Name.create(props.name);
    }
    if (props.defaultPhoneNumberId) {
      this.props.defaultPhoneNumberId = Id.create(props.defaultPhoneNumberId);
    }
    if (props.defaultShippingAddressId) {
      this.props.defaultShippingAddressId = Id.create(
        props.defaultShippingAddressId,
      );
    }
    if (props.defaultBillingAddressId) {
      this.props.defaultBillingAddressId = Id.create(
        props.defaultBillingAddressId,
      );
    }

    this.props.updatedAt = new Date();

    this.apply(new TenantUpdatedEvent(this));

    return this;
  }

  /** Records a store already verified by the store ownership capability. */
  setDefaultStore(storeId: string): Tenant {
    this.props.defaultStoreId = Id.create(storeId);
    this.props.updatedAt = new Date();
    return this;
  }
}
