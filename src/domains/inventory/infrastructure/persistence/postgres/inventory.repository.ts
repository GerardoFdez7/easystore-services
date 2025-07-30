import { Injectable } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { Warehouse, StockPerWarehouse } from '../../../aggregates/entities';
import { PostgreService } from 'src/infrastructure/database/postgres.service';
import {
  WarehouseMapper,
  StockPerWarehouseMapper,
  WarehouseDTO,
} from '../../../application/mappers';
import { IStockPerWarehouseBase } from '../../../aggregates/entities/stockPerWarehouse/stock-per-warehouse.attributes';
import { v4 as uuidv4 } from 'uuid';
import { Id } from '@domains/value-objects';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PostgreService) {}

  async createWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    const warehouseDto = WarehouseMapper.toDto(warehouse) as WarehouseDTO;
    const { id, name, addressId, tenantId, createdAt, updatedAt } =
      warehouseDto;

    const createdWarehouse = await this.prisma.$transaction(async (tx) => {
      const created = await tx.warehouse.create({
        data: {
          id,
          name,
          addressId,
          tenantId,
          createdAt,
          updatedAt,
        },
      });
      return created;
    });

    return WarehouseMapper.fromPersistence(createdWarehouse);
  }

  async getWarehouseById(id: Id): Promise<Warehouse | null> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: id.getValue() },
    });

    if (!warehouse) {
      return null;
    }

    return WarehouseMapper.fromPersistence(warehouse);
  }

  async updateWarehouse(
    id: Id,
    tenantId: Id,
    warehouse: Warehouse,
  ): Promise<Warehouse> {
    const warehouseDto = WarehouseMapper.toDto(warehouse) as WarehouseDTO;
    const { name, addressId, tenantId: tenantIdDto, updatedAt } = warehouseDto;

    const updatedWarehouse = await this.prisma.$transaction(async (tx) => {
      const existingWarehouse = await tx.warehouse.findUnique({
        where: { id: id.getValue(), tenantId: tenantId.getValue() },
      });
      if (!existingWarehouse) {
        throw new Error(
          `Warehouse with id ${id.getValue()} and tenantId ${tenantId.getValue()} not found`,
        );
      }
      const updated = await tx.warehouse.update({
        where: { id: id.getValue(), tenantId: tenantId.getValue() },
        data: {
          name,
          addressId,
          tenantId: tenantIdDto,
          updatedAt,
        },
      });
      return updated;
    });

    return WarehouseMapper.fromPersistence(updatedWarehouse);
  }

  async deleteWarehouse(id: Id, tenantId: Id): Promise<Warehouse> {
    const warehouse = await this.prisma.$transaction(async (tx) => {
      const found = await tx.warehouse.findUnique({
        where: { id: id.getValue(), tenantId: tenantId.getValue() },
      });
      if (!found) {
        throw new Error(
          `Warehouse with id ${id.getValue()} and tenantId ${tenantId.getValue()} not found`,
        );
      }
      await tx.warehouse.delete({
        where: { id: id.getValue(), tenantId: tenantId.getValue() },
      });
      return found;
    });
    return WarehouseMapper.fromPersistence(warehouse);
  }

  async createStockPerWarehouse(
    stockPerWarehouse: StockPerWarehouse,
  ): Promise<StockPerWarehouse> {
    const stockPerWarehouseDto =
      StockPerWarehouseMapper.toDto(stockPerWarehouse);
    const {
      id,
      qtyAvailable,
      qtyReserved,
      productLocation,
      estimatedReplenishmentDate,
      lotNumber,
      serialNumbers,
      variantId,
      warehouseId,
    } = stockPerWarehouseDto;

    const createdStockPerWarehouse = await this.prisma.$transaction(
      async (tx) => {
        const created = await tx.stockPerWarehouse.create({
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
        return created;
      },
    );

    return StockPerWarehouseMapper.fromPersistence(createdStockPerWarehouse);
  }

  async deleteStockPerWarehouse(
    id: Id,
    warehouseId: Id,
  ): Promise<StockPerWarehouse> {
    const stock = await this.prisma.$transaction(async (tx) => {
      const found = await tx.stockPerWarehouse.findUnique({
        where: { id: id.getValue(), warehouseId: warehouseId.getValue() },
      });
      if (!found)
        throw new Error(
          `StockPerWarehouse with id ${id.getValue()} and warehouseId ${warehouseId.getValue()} not found`,
        );
      await tx.stockMovement.deleteMany({
        where: { stockPerWarehouseId: id.getValue() },
      });
      await tx.stockPerWarehouse.delete({
        where: { id: id.getValue(), warehouseId: warehouseId.getValue() },
      });
      return found;
    });
    return StockPerWarehouseMapper.fromPersistence(stock);
  }

  async getStockPerWarehouseById(
    id: Id,
    warehouseId: Id,
  ): Promise<StockPerWarehouse | null> {
    const stock = await this.prisma.stockPerWarehouse.findUnique({
      where: { id: id.getValue(), warehouseId: warehouseId.getValue() },
    });
    if (!stock) return null;
    return StockPerWarehouseMapper.fromPersistence(stock);
  }

  async getAllStockPerWarehouseByWarehouseId(
    warehouseId: string,
  ): Promise<StockPerWarehouse[]> {
    const stocks = await this.prisma.stockPerWarehouse.findMany({
      where: { warehouseId },
    });
    return stocks.map((stock) =>
      StockPerWarehouseMapper.fromPersistence(stock),
    );
  }

  async updateStockPerWarehouse(
    id: Id,
    warehouseId: Id,
    updates: Partial<IStockPerWarehouseBase>,
  ): Promise<StockPerWarehouse> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const current = await tx.stockPerWarehouse.findUnique({
        where: { id: id.getValue(), warehouseId: warehouseId.getValue() },
      });
      if (!current)
        throw new Error(
          `StockPerWarehouse with id ${id.getValue()} and warehouseId ${warehouseId.getValue()} not found`,
        );
      const newQtyAvailable = updates.qtyAvailable ?? current.qtyAvailable;
      const deltaQty = newQtyAvailable - current.qtyAvailable;
      const updatedStock = await tx.stockPerWarehouse.update({
        where: { id: id.getValue(), warehouseId: warehouseId.getValue() },
        data: {
          ...updates,
        },
      });
      if (deltaQty !== 0) {
        await tx.stockMovement.create({
          data: {
            id: uuidv4(),
            deltaQty,
            reason: 'StockPerWarehouse updated',
            warehouseId: updatedStock.warehouseId,
            stockPerWarehouseId: updatedStock.id,
            ocurredAt: new Date(),
          },
        });
      }
      return updatedStock;
    });
    return StockPerWarehouseMapper.fromPersistence(updated);
  }

  async findAllWarehouses(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      addressId?: Id;
      sortBy?: 'createdAt' | 'name' | 'addressId';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ warehouses: Warehouse[]; total: number; hasMore: boolean }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: {
      tenantId: string;
      name?: { contains: string; mode: 'insensitive' };
      addressId?: string;
    } = { tenantId: tenantId.getValue() };
    if (options?.name) {
      where.name = { contains: options.name, mode: 'insensitive' };
    }
    if (options?.addressId) {
      where.addressId = options.addressId.getValue();
    }
    const sortOrder = options?.sortOrder ?? 'desc';
    const orderBy = options?.sortBy
      ? { [options.sortBy]: sortOrder }
      : { createdAt: sortOrder };
    const [warehouses, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    const hasMore = skip + warehouses.length < total;
    return {
      warehouses: warehouses.map((w) => WarehouseMapper.fromPersistence(w)),
      total,
      hasMore,
    };
  }
}
