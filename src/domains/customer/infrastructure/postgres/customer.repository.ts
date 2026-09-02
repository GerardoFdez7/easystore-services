import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { UniqueConstraintViolationError } from '@shared/infrastructure/postgres/errors';
import { Id } from '@shared/aggregates/value-objects';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { ICustomerRepository } from '../../aggregates/repositories';
import { Customer } from '../../aggregates/entities/';
import { CustomerMapper } from '../../application/mappers/';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly postgresService: PostgreService) {}
  /**
   * Finds a customer by its auth identity ID.
   * @param authIdentityId The auth identity ID to search for.
   * @returns Promise that resolves to customer data or null if not found.
   */
  async findByAuthIdentityId(
    authIdentityId: Id,
  ): Promise<{ id: string; tenantId: string } | null> {
    try {
      const customer = await this.postgresService.customer.findUnique({
        where: { authIdentityId: authIdentityId.getValue() },
        select: {
          id: true,
          tenantId: true,
        },
      });

      return customer;
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'find customer by auth identity ID',
      );
    }
  }

  /**
   * Creates a new customer in the repository.
   * @param customer The customer entity to create.
   * @returns Promise that resolves to the created Customer entity.
   */
  async create(customer: Customer): Promise<Customer> {
    try {
      const customerData = CustomerMapper.toDto(customer);

      const createdCustomer = await this.postgresService.$transaction(
        async (tx) =>
          tx.customer.create({
            data: customerData,
          }),
      );

      return CustomerMapper.fromPersistence(createdCustomer);
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'create customer',
        'Customer with this auth identity already exists',
      );
    }
  }

  async update(customer: Customer, tenantId: Id): Promise<Customer> {
    try {
      const customerData = CustomerMapper.toDto(customer);
      const customerId = customer.get('id').getValue();
      const tenantIdValue = tenantId.getValue();

      const updatedCustomer = await this.postgresService.$transaction(
        async (tx) =>
          tx.customer.update({
            where: { id: customerId, tenantId: tenantIdValue },
            data: {
              name: customerData.name,
              defaultPhoneNumberId: customerData.defaultPhoneNumberId,
              defaultShippingAddressId: customerData.defaultShippingAddressId,
              defaultBillingAddressId: customerData.defaultBillingAddressId,
              updatedAt: new Date(),
            },
          }),
      );

      return CustomerMapper.fromPersistence(updatedCustomer);
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'update customer',
        'Customer with this data already exists',
      );
    }
  }

  async findById(id: Id, tenantId: Id): Promise<Customer | null> {
    try {
      const customerFound = await this.postgresService.customer.findFirst({
        where: { id: id.getValue(), tenantId: tenantId.getValue() },
      });

      return customerFound
        ? CustomerMapper.fromPersistence(customerFound)
        : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'find customer by id');
    }
  }

  private handleDatabaseError(
    error: unknown,
    operation: string,
    uniqueMessage?: string,
  ): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Customer',
      foreignKeyEntities: {
        authIdentityId: 'Auth Identity',
        defaultPhoneNumberId: 'Phone Number',
        defaultShippingAddressId: 'Address',
        defaultBillingAddressId: 'Address',
        tenantId: 'Tenant',
      },
      uniqueConstraintError: uniqueMessage
        ? (_prismaError, field) =>
            new UniqueConstraintViolationError(field, uniqueMessage)
        : undefined,
    });
  }
}
