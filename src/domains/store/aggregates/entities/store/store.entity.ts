import { Entity, EntityProps } from '@shared/aggregates/entities/entity.base';
import {
  Currency,
  Domain,
  Id,
  LongDescription,
  Media,
  Name,
} from '../../value-objects';
import { StoreCreatedEvent, StoreUpdatedEvent } from '../../events';
import { IStoreBase, IStoreType } from './store.attributes';

export interface IStoreProps extends EntityProps {
  id: Id;
  tenantId: Id;
  name?: Name | null;
  domain?: Domain | null;
  logo?: Media | null;
  description?: LongDescription | null;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export class Store extends Entity<IStoreProps> {
  private constructor(props: IStoreProps) {
    super(props);
  }

  static create(props: IStoreBase): Store {
    const store = new Store({
      id: Id.generate(),
      tenantId: Id.create(props.tenantId),
      name: props.name ? Name.create(props.name) : null,
      domain: props.domain ? Domain.create(props.domain) : null,
      logo: props.logo ? Media.create(props.logo) : null,
      description: props.description
        ? LongDescription.create(props.description)
        : null,
      currency: Currency.create(
        props.currency ?? process.env.DEFAULT_CURRENCY ?? 'USD',
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.apply(new StoreCreatedEvent(store));
    return store;
  }

  static reconstitute(props: IStoreProps): Store {
    return new Store(props);
  }

  update(
    props: Partial<
      Omit<IStoreType, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
    >,
  ): Store {
    if (props.name !== undefined)
      this.props.name = props.name ? Name.create(props.name) : null;
    if (props.domain !== undefined)
      this.props.domain = props.domain ? Domain.create(props.domain) : null;
    if (props.logo !== undefined)
      this.props.logo = props.logo ? Media.create(props.logo) : null;
    if (props.description !== undefined)
      this.props.description = props.description
        ? LongDescription.create(props.description)
        : null;
    if (props.currency !== undefined)
      this.props.currency = Currency.create(props.currency);
    this.props.updatedAt = new Date();
    this.apply(new StoreUpdatedEvent(this));
    return this;
  }
}
