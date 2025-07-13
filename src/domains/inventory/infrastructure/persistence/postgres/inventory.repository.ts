import { Injectable } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { Warehouse } from '../../../aggregates/entities';
import { PostgreService } from 'src/infrastructure/database/postgres.service';
import { WarehouseMapper } from '../../../application/mappers';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PostgreService) {}

  async saveWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    const warehouseDto = WarehouseMapper.toDto(warehouse) as any;
    const { id, name, addressId, tenantId, createdAt, updatedAt } = warehouseDto;

    // Guardar solo el warehouse sin stockPerWarehouse
    const createdWarehouse = await this.prisma.warehouse.create({
      data: {
        id,
        name,
        addressId,
        tenantId,
        createdAt,
        updatedAt,
      },
    });

    // Mapear de vuelta a entidad de dominio
    return WarehouseMapper.fromPersistence(createdWarehouse);
  }

  async deleteWarehouse(id: string): Promise<Warehouse> {
    // Buscar el warehouse antes de eliminarlo
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new Error(`Warehouse with id ${id} not found`);
    }

    // Eliminar el warehouse
    await this.prisma.warehouse.delete({
      where: { id },
    });

    // Mapear de vuelta a entidad de dominio
    return WarehouseMapper.fromPersistence(warehouse);
  }

}
