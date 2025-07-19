import { Injectable } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { Warehouse, StockPerWarehouse } from '../../../aggregates/entities';
import { PostgreService } from 'src/infrastructure/database/postgres.service';
import { WarehouseMapper, StockPerWarehouseMapper } from '../../../application/mappers';
import { IStockPerWarehouseBase } from '../../../aggregates/entities/stockPerWarehouse/stock-per-warehouse.attributes';
import { v4 as uuidv4 } from 'uuid';

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

  async saveStockPerWarehouse(stockPerWarehouse: StockPerWarehouse): Promise<StockPerWarehouse> {
    const stockPerWarehouseDto = StockPerWarehouseMapper.toDto(stockPerWarehouse) as any;
    const { 
      id, 
      qtyAvailable, 
      qtyReserved, 
      productLocation, 
      estimatedReplenishmentDate, 
      lotNumber, 
      serialNumbers, 
      variantId, 
      warehouseId 
    } = stockPerWarehouseDto;

    // Guardar el stock per warehouse
    const createdStockPerWarehouse = await this.prisma.stockPerWarehouse.create({
      data: {
        id,
        qtyAvailable,
        qtyReserved,
        productLocation,
        estimatedReplenishmentDate,
        lotNumber,
        serialNumbers,
        variantId,
        warehouseId,
      },
    });

    // Mapear de vuelta a entidad de dominio
    return StockPerWarehouseMapper.fromPersistence(createdStockPerWarehouse);
  }

  async deleteStockPerWarehouse(id: string): Promise<StockPerWarehouse> {
    const stock = await this.prisma.stockPerWarehouse.findUnique({ where: { id } });
    if (!stock) throw new Error(`StockPerWarehouse with id ${id} not found`);
    await this.prisma.stockMovement.deleteMany({
      where: { stockPerWarehouseId: id },
    });
    await this.prisma.stockPerWarehouse.delete({ where: { id } });
    return StockPerWarehouseMapper.fromPersistence(stock);
  }

  async getStockPerWarehouseById(id: string): Promise<StockPerWarehouse | null> {
    const stock = await this.prisma.stockPerWarehouse.findUnique({ where: { id } });
    if (!stock) return null;
    return StockPerWarehouseMapper.fromPersistence(stock);
  }

  async getAllStockPerWarehouseByWarehouseId(warehouseId: string): Promise<StockPerWarehouse[]> {
    const stocks = await this.prisma.stockPerWarehouse.findMany({ where: { warehouseId } });
    return stocks.map(stock => StockPerWarehouseMapper.fromPersistence(stock));
  }

  async updateStockPerWarehouse(id: string, updates: Partial<IStockPerWarehouseBase>): Promise<StockPerWarehouse> {
    // Obtener el registro actual
    const current = await this.prisma.stockPerWarehouse.findUnique({ where: { id } });
    if (!current) throw new Error(`StockPerWarehouse with id ${id} not found`);

    // Calcular el delta de qtyAvailable
    const newQtyAvailable = updates.qtyAvailable ?? current.qtyAvailable;
    const deltaQty = newQtyAvailable - current.qtyAvailable;

    // Actualizar el registro
    const updated = await this.prisma.stockPerWarehouse.update({
      where: { id },
      data: {
        ...updates,
      },
    });

    // Crear un nuevo StockMovement solo si hay cambio en qtyAvailable
    if (deltaQty !== 0) {
      await this.prisma.stockMovement.create({
        data: {
          id: uuidv4(),
          deltaQty,
          reason: 'StockPerWarehouse updated',
          warehouseId: updated.warehouseId,
          stockPerWarehouseId: updated.id,
          ocurredAt: new Date(),
        },
      });
    }

    return StockPerWarehouseMapper.fromPersistence(updated);
  }

}
