import { NotFoundException } from '@nestjs/common';
import { Customer } from '../../aggregates/entities';
import { ICustomerRepository } from '../../aggregates/repositories';
import { Id } from '@shared/value-objects';

/** Loads a customer inside its tenant boundary or raises the standard not-found error. */
export async function findCustomerOrThrow(
  customerRepository: ICustomerRepository,
  customerId: Id,
  tenantId: Id,
  customerIdValue: string,
): Promise<Customer> {
  const customer = await customerRepository.findById(customerId, tenantId);
  if (!customer) {
    throw new NotFoundException(
      `Customer with ID ${customerIdValue} not found`,
    );
  }

  return customer;
}
