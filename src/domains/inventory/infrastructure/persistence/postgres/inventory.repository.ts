import { Injectable } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { Warehouse } from '../../../aggregates/entities';
import { PostgreService } from 'src/infrastructure/database/postgres.service';
import { WarehouseMapper } from '../../../application/mappers';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PostgreService) {}

  async saveWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    const warehouseDto = WarehouseMapper.toDto(warehouse);
    // Asumiendo que warehouseDto tiene un array stockPerWarehouse
    const { id, name, addressId, tenantId, createdAt, updatedAt, stockPerWarehouse } = warehouseDto as any;

    // Guardar warehouse y stockPerWarehouse anidados
    const createdWarehouse = await this.prisma.warehouse.create({
      data: {
        id,
        name,
        addressId,
        tenantId,
        createdAt,
        updatedAt,
        stockPerWarehouses: stockPerWarehouse
          ? {
              create: stockPerWarehouse.map((spw: any) => ({
                qtyAvailable: spw.qtyAvailable,
                qtyReserved: spw.qtyReserved,
                productLocation: spw.productLocation,
                estimatedReplenishmentDate: spw.estimatedReplenishmentDate,
                lotNumber: spw.lotNumber,
                serialNumbers: spw.serialNumbers,
                variantId: spw.variantId,
              })),
            }
          : undefined,
      },
      include: { stockPerWarehouses: true },
    });

    // Mapear de vuelta a entidad de dominio
    return WarehouseMapper.fromPersistence(createdWarehouse);
  }

}
