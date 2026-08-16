import { NotFoundException } from '@nestjs/common';
import { Warehouse } from '../../aggregates/entities';
import { IWarehouseRepository } from '../../aggregates/repositories';
import { Id } from '@shared/value-objects';

export async function findWarehouseOrThrow(
  repository: IWarehouseRepository,
  warehouseId: string,
  tenantId: string,
): Promise<Warehouse> {
  const warehouse = await repository.findById(
    Id.create(warehouseId),
    Id.create(tenantId),
  );

  if (!warehouse) {
    throw new NotFoundException(`Warehouse with id ${warehouseId} not found`);
  }

  return warehouse;
}
