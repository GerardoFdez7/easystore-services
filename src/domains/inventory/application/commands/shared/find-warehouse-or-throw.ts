import { NotFoundException } from '@nestjs/common';
import { Warehouse } from '../../../aggregates/entities';
import { IWarehouseRepository } from '../../../aggregates/repositories';
import { Id } from '@shared/aggregates/value-objects';

export async function findWarehouseOrThrow(
  repository: IWarehouseRepository,
  warehouseId: string,
  storeId: string,
): Promise<Warehouse> {
  const warehouse = await repository.findById(
    Id.create(warehouseId),
    Id.create(storeId),
  );

  if (!warehouse) {
    throw new NotFoundException(`Warehouse with id ${warehouseId} not found`);
  }

  return warehouse;
}
