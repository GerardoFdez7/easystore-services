import {
  Customer,
  ICustomerProps,
} from '../../../aggregates/entities/customer.entity';
import {
  ICustomerCreate,
  ICustomerEntity,
} from '../../../aggregates/entities/customer.attributes';
import { Id, Name } from '@shared/value-objects';
import { CustomerDTO, PaginatedCustomersDTO } from './customer.dto';

/**
 * Centralized mapper for Customer domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class CustomerMapper {
  /**
   * Maps a persistence Customer model to a domain Customer entity
   * @param persistenceCustomer The Persistence Customer model
   * @returns The mapped Customer domain entity
   */
  static fromPersistence(persistenceCustomer: ICustomerEntity): Customer {
    const customerProps: ICustomerProps = {
      id: Id.create(persistenceCustomer.id),
      name: Name.create(persistenceCustomer.name),
      tenantId: Id.create(persistenceCustomer.tenantId),
      authIdentityId: Id.create(persistenceCustomer.authIdentityId),
      defaultPhoneNumberId: persistenceCustomer.defaultPhoneNumberId
        ? Id.create(persistenceCustomer.defaultPhoneNumberId)
        : undefined,
      defaultShippingAddressId: persistenceCustomer.defaultShippingAddressId
        ? Id.create(persistenceCustomer.defaultShippingAddressId)
        : undefined,
      defaultBillingAddressId: persistenceCustomer.defaultBillingAddressId
        ? Id.create(persistenceCustomer.defaultBillingAddressId)
        : undefined,
      updatedAt: persistenceCustomer.updatedAt,
      createdAt: persistenceCustomer.createdAt,
    };

    return Customer.reconstitute(customerProps);
  }

  /**
   * Maps a Customer domain entity to a CustomerDTO
   * @param customer The Customer domain entity
   * @returns The mapped CustomerDTO
   */
  static toDto(customer: Customer): CustomerDTO {
    return {
      id: customer.get('id').getValue(),
      name: customer.get('name').getValue(),
      tenantId: customer.get('tenantId').getValue(),
      authIdentityId: customer.get('authIdentityId').getValue(),
      defaultPhoneNumberId:
        customer.get('defaultPhoneNumberId')?.getValue() || null,
      defaultShippingAddressId:
        customer.get('defaultShippingAddressId')?.getValue() || null,
      defaultBillingAddressId:
        customer.get('defaultBillingAddressId')?.getValue() || null,
      updatedAt: customer.get('updatedAt'),
      createdAt: customer.get('createdAt'),
    };
  }

  /**
   * Maps an array of Customer domain entities to an array of CustomerDTOs
   * @param customers The array of customer domain entities
   * @returns Array of customer DTOs
   */
  static toDtoArray(customers: Customer[]): CustomerDTO[] {
    return customers.map((customer) => this.toDto(customer));
  }

  /**
   * Maps a CustomerDTO to a domain entity
   * @param dto The customer DTO
   * @returns The mapped Customer domain entity
   */
  static fromCreateDto(dto: ICustomerCreate): Customer {
    return Customer.create({ ...dto });
  }

  /**
   * Maps paginated customers data to PaginatedCustomersDTO
   * @param customers Array of customer entities
   * @param total Total count of customers
   * @param hasMore Whether there are more customers available
   * @returns Paginated customers DTO
   */
  static toPaginatedDto(
    customers: Customer[],
    total: number,
    hasMore: boolean,
  ): PaginatedCustomersDTO {
    return {
      customers: this.toDtoArray(customers),
      total,
      hasMore,
    };
  }
}
