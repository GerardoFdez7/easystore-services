import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { ICustomerRepository } from '../../../aggregates/repositories/customer.interface';
import { Customer } from '../../../aggregates/entities/customer.entity';
import { CustomerMapper } from '../../../application/mappers/customer/customer.mapper';
import { Id } from '@shared/value-objects';
import {
  DatabaseOperationError,
  UniqueConstraintViolationError,
  ResourceNotFoundError,
} from '@shared/errors';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'find customer by auth identity ID',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
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

      const createdCustomer = await this.postgresService.customer.create({
        data: customerData,
      });

      return CustomerMapper.fromPersistence(createdCustomer);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          throw new UniqueConstraintViolationError(
            field,
            'Customer with this auth identity already exists',
          );
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'create customer',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  async update(customer: Customer): Promise<Customer> {
    try {
      const customerData = CustomerMapper.toDto(customer);
      const customerId = customer.get('id').getValue();

      const updatedCustomer = await this.postgresService.customer.update({
        where: { id: customerId },
        data: {
          name: customerData.name,
          defaultPhoneNumberId: customerData.defaultPhoneNumberId,
          defaultShippingAddressId: customerData.defaultShippingAddressId,
          defaultBillingAddressId: customerData.defaultBillingAddressId,
          updatedAt: new Date(),
        },
      });

      return CustomerMapper.fromPersistence(updatedCustomer);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError('Customer');
        }
        if (error.code === 'P2002') {
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          throw new UniqueConstraintViolationError(
            field,
            'Customer with this data already exists',
          );
        }
      }

      return this.handleDatabaseError(error, 'update customer');
    }
  }

  async findCustomerById(id: Id, tenantId: Id): Promise<Customer> {
    try {
      const customerFound = await this.postgresService.customer.findFirst({
        where: { id: id.getValue(), tenantId: tenantId.getValue() },
      });

      if (!customerFound) {
        throw new ResourceNotFoundError('Customer');
      }

      return CustomerMapper.fromPersistence(customerFound);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'find customer by id',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
