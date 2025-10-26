import { Entity, EntityProps } from '@shared/entity.base';
import { Id, Name } from '@shared/value-objects';
import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  WishlistItemCreatedEvent,
  WishlistItemDeletedEvent,
  WishlistManyItemsDeletedEvent,
} from '../events';
import { ICustomerCreate, IWishListCreated } from './customer.attributes';
import { WishListItem } from '../value-objects';

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

  static update(
    customer: Customer,
    input: Partial<Omit<ICustomerCreate, 'tenantId' | 'authIdentityId'>>,
  ): Customer {
    const customerUpdated = new Customer({
      id: customer.get('id'),
      name: input.name ? Name.create(input.name) : customer.get('name'),
      tenantId: customer.get('tenantId'),
      authIdentityId: customer.get('authIdentityId'),
      defaultPhoneNumberId: input.defaultPhoneNumberId
        ? Id.create(input.defaultPhoneNumberId)
        : customer.get('defaultPhoneNumberId'),
      defaultShippingAddressId: input.defaultShippingAddressId
        ? Id.create(input.defaultShippingAddressId)
        : customer.get('defaultShippingAddressId'),
      defaultBillingAddressId: input.defaultBillingAddressId
        ? Id.create(input.defaultBillingAddressId)
        : customer.get('defaultBillingAddressId'),
      updatedAt: new Date(),
      createdAt: customer.get('createdAt'),
    });

    customerUpdated.apply(new CustomerUpdatedEvent(customerUpdated));

    return customerUpdated;
  }

  static addVariantToWishList(
    wishlistItem: IWishListCreated,
    customer: Customer,
  ): WishListItem {
    const item = WishListItem.create({
      variantId: wishlistItem.variantId,
      customerId: wishlistItem.customerId,
    });

    customer.apply(new WishlistItemCreatedEvent(item, customer));

    return item;
  }

  static removeVariantFromWishList(
    wishListItem: WishListItem,
    customer: Customer,
  ): void {
    customer.apply(new WishlistItemDeletedEvent(wishListItem, customer));
  }

  static removeManyVariantsFromWishList(
    wishListItems: WishListItem[],
    customer: Customer,
  ): void {
    customer.apply(new WishlistManyItemsDeletedEvent(wishListItems, customer));
  }
}
