import { NotFoundException } from '@nestjs/common';
import { Address } from '../aggregates/entities';
import {
  IAddressRepository,
  Owner,
} from '../aggregates/repositories/address.interface';
import { Id } from '../aggregates/value-objects';

export function resolveAddressOwner(
  tenantId?: string,
  customerId?: string,
): Owner {
  if ((!tenantId && !customerId) || (tenantId && customerId)) {
    throw new Error('You must provide either tenantId or customerId');
  }

  return tenantId
    ? { tenantId: Id.create(tenantId) }
    : { customerId: Id.create(customerId) };
}

export async function findAddressOrThrow(
  repository: IAddressRepository,
  id: string,
  tenantId?: string,
  customerId?: string,
): Promise<{ address: Address; addressId: Id; owner: Owner }> {
  const addressId = Id.create(id);
  const owner = resolveAddressOwner(tenantId, customerId);
  const address = await repository.findById(addressId, owner);

  if (!address) {
    throw new NotFoundException(`Address with ID ${id} not found`);
  }

  return { address, addressId, owner };
}
