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

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      return null;
    }

    // Mapear de vuelta a entidad de dominio
    return WarehouseMapper.fromPersistence(warehouse);
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    const warehouses = await this.prisma.warehouse.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Mapear de vuelta a entidades de dominio
    return warehouses.map(warehouse => WarehouseMapper.fromPersistence(warehouse));
  }

  async updateWarehouse(id: string, warehouse: Warehouse): Promise<Warehouse> {
    const warehouseDto = WarehouseMapper.toDto(warehouse) as any;
    const { name, addressId, tenantId, updatedAt } = warehouseDto;

    // Verificar que el warehouse existe
    const existingWarehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      throw new Error(`Warehouse with id ${id} not found`);
    }

    // Actualizar el warehouse
    const updatedWarehouse = await this.prisma.warehouse.update({
      where: { id },
      data: {
        name,
        addressId,
        tenantId,
        updatedAt,
      },
    });

    // Mapear de vuelta a entidad de dominio
    return WarehouseMapper.fromPersistence(updatedWarehouse);
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
