import { Entity, EntityProps } from '@shared/entity.base';
import { Id, Name } from '@shared/value-objects';
import {
  CustomerCreatedEvent,
  CustomerReviewProductCreatedEvent,
  CustomerReviewProductUpdatedEvent,
  CustomerReviewProductDeletedEvent,
  CustomerUpdatedEvent,
  WishlistItemCreatedEvent,
  WishlistItemDeletedEvent,
  WishlistManyItemsDeletedEvent,
} from '../events';
import {
  ICustomerCreate,
  ICustomerReviewCreated,
  IWishListCreated,
} from './customer.attributes';
import { WishListItem } from '../value-objects';
import {
  CustomerReviewProduct,
  CustomerReviewProductProps,
} from '../value-objects/customer-review-product.vo';

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

/**
 * @class Customer
 * @classdesc Represents a customer entity within the domain. This aggregate root
 * manages customer-related data and orchestrates operations such as updating profile
 * information, managing wish lists, and handling product reviews. It is a central
 * part of the customer domain, ensuring data consistency and applying relevant
 * domain events for state changes.
 */
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

  static addCustomerReviewProduct(
    customerReviewProduct: ICustomerReviewCreated,
    customer: Customer,
  ): CustomerReviewProduct {
    const review = CustomerReviewProduct.create({
      ratingCount: customerReviewProduct.ratingCount,
      comment: customerReviewProduct.comment,
      customerId: customer.get('id').getValue(),
      variantId: customerReviewProduct.variantId,
    });

    customer.apply(new CustomerReviewProductCreatedEvent(review, customer));

    return review;
  }

  static updateCustomerReviewProduct(
    existingReview: CustomerReviewProduct,
    updates: Partial<
      Pick<CustomerReviewProductProps, 'ratingCount' | 'comment'>
    >,
    customer: Customer,
  ): CustomerReviewProduct {
    const updatedReview = CustomerReviewProduct.update(existingReview, updates);

    customer.apply(
      new CustomerReviewProductUpdatedEvent(updatedReview, customer),
    );

    return updatedReview;
  }

  static removeCustomerReviewProduct(
    review: CustomerReviewProduct,
    customer: Customer,
  ): void {
    customer.apply(new CustomerReviewProductDeletedEvent(review, customer));
  }
}
