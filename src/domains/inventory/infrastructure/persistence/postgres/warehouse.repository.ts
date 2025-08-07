import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { Prisma, Warehouse as PrismaWarehouse } from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
  DomainError,
} from '@domains/errors';
import {
  Warehouse,
  IStockPerWarehouseBase,
} from '../../../aggregates/entities';
import { WarehouseMapper } from '../../../application/mappers';
import { Id, SortBy, SortOrder } from '@domains/value-objects';
import { StockMovement } from '../../../aggregates/value-objects/stockMovement/stock-movement.vo';
import IWarehouseRepository from '../../../aggregates/repositories/warehouse.interface';

@Injectable()
export default class WarehouseRepository implements IWarehouseRepository {
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Creates a new warehouse with transaction support and proper error handling
   */
  async create(warehouse: Warehouse): Promise<Warehouse> {
    const warehouseDto = WarehouseMapper.toDto(warehouse);

    try {
      const prismaWarehouse = await this.prisma.$transaction(async (tx) => {
        // Create the warehouse
        const createdWarehouse = await tx.warehouse.create({
          data: {
            id: warehouseDto.id,
            name: warehouseDto.name,
            address: { connect: { id: warehouseDto.addressId } },
            tenant: { connect: { id: warehouseDto.tenantId } },
            createdAt: warehouseDto.createdAt,
            updatedAt: warehouseDto.updatedAt,
          },
        });

        return createdWarehouse;
      });

      return this.mapToDomain(prismaWarehouse);
    } catch (error) {
      return this.handleDatabaseError(error, 'create warehouse');
    }
  }

  /**
   * Updates an existing warehouse with transaction support and stock per warehouse creation
   */
  async update(
    id: Id,
    tenantId: Id,
    updates: Warehouse,
    stockMovementContext?: {
      reason?: string;
      createdById?: string;
    },
  ): Promise<Warehouse> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();
    const updatesDto = WarehouseMapper.toDto(updates);

    try {
      const prismaWarehouse = await this.prisma.$transaction(async (tx) => {
        // Check if warehouse exists and get current state (excluding soft-deleted stocks)
        const existingWarehouse = await tx.warehouse.findUnique({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          include: {
            stockPerWarehouses: {
              where: {
                deletedAt: null,
              },
            },
          },
        });

        if (!existingWarehouse) {
          throw new ResourceNotFoundError('Warehouse', idValue);
        }

        // Update the warehouse basic info
        await tx.warehouse.update({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          data: {
            name: updatesDto.name,
            addressId: updatesDto.addressId,
            updatedAt: updatesDto.updatedAt,
          },
        });

        // Handle stock operations for each stock in the updated warehouse
        for (const updatedStock of updatesDto.stockPerWarehouses) {
          // Check if stock already exists for this variant (including soft-deleted)
          const existingStock = await tx.stockPerWarehouse.findFirst({
            where: {
              warehouseId: idValue,
              variantId: updatedStock.variantId,
            },
          });

          let actualStockId: string;

          if (existingStock) {
            if (existingStock.deletedAt !== null) {
              // Reactivate soft-deleted stock
              await tx.stockPerWarehouse.update({
                where: { id: existingStock.id },
                data: {
                  qtyAvailable: updatedStock.qtyAvailable,
                  qtyReserved: updatedStock.qtyReserved,
                  productLocation: updatedStock.productLocation,
                  estimatedReplenishmentDate:
                    updatedStock.estimatedReplenishmentDate,
                  lotNumber: updatedStock.lotNumber,
                  serialNumbers: updatedStock.serialNumbers,
                  deletedAt: null, // Reactivate
                },
              });
              actualStockId = existingStock.id;

              // Create stock movement for reactivated stock (only if quantity changes)
              const deltaQty =
                updatedStock.qtyAvailable - existingStock.qtyAvailable;
              if (deltaQty !== 0) {
                const stockMovement = StockMovement.create(
                  deltaQty,
                  stockMovementContext?.reason,
                  stockMovementContext?.createdById,
                  new Date(),
                );

                const movementData = stockMovement.getMovement();
                await tx.stockMovement.create({
                  data: {
                    id: movementData.id,
                    deltaQty: movementData.deltaQty,
                    reason: movementData.reason,
                    createdById: movementData.createdById,
                    warehouseId: idValue,
                    stockPerWarehouseId: actualStockId,
                    occurredAt: movementData.occurredAt,
                  },
                });
              }
            } else {
              // Stock already exists and is active - update it
              await tx.stockPerWarehouse.update({
                where: { id: existingStock.id },
                data: {
                  qtyAvailable: updatedStock.qtyAvailable,
                  qtyReserved: updatedStock.qtyReserved,
                  productLocation: updatedStock.productLocation,
                  estimatedReplenishmentDate:
                    updatedStock.estimatedReplenishmentDate,
                  lotNumber: updatedStock.lotNumber,
                  serialNumbers: updatedStock.serialNumbers,
                },
              });
              actualStockId = existingStock.id;

              // Create stock movement for updated stock
              const deltaQty =
                updatedStock.qtyAvailable - existingStock.qtyAvailable;
              if (deltaQty !== 0) {
                const stockMovement = StockMovement.create(
                  deltaQty,
                  stockMovementContext?.reason,
                  stockMovementContext?.createdById,
                  new Date(),
                );

                const movementData = stockMovement.getMovement();
                await tx.stockMovement.create({
                  data: {
                    id: movementData.id,
                    deltaQty: movementData.deltaQty,
                    reason: movementData.reason,
                    createdById: movementData.createdById,
                    warehouseId: idValue,
                    stockPerWarehouseId: actualStockId,
                    occurredAt: movementData.occurredAt,
                  },
                });
              }
            }
          } else {
            // Create new stock
            const newStock = await tx.stockPerWarehouse.create({
              data: {
                id: updatedStock.id,
                qtyAvailable: updatedStock.qtyAvailable,
                qtyReserved: updatedStock.qtyReserved,
                productLocation: updatedStock.productLocation,
                estimatedReplenishmentDate:
                  updatedStock.estimatedReplenishmentDate,
                lotNumber: updatedStock.lotNumber,
                serialNumbers: updatedStock.serialNumbers,
                variantId: updatedStock.variantId,
                warehouseId: idValue,
                deletedAt: null,
              },
            });
            actualStockId = newStock.id;

            // Create stock movement for new stock
            const stockMovement = StockMovement.create(
              updatedStock.qtyAvailable,
              stockMovementContext?.reason,
              stockMovementContext?.createdById,
              new Date(),
            );

            const movementData = stockMovement.getMovement();
            await tx.stockMovement.create({
              data: {
                id: movementData.id,
                deltaQty: movementData.deltaQty,
                reason: movementData.reason,
                createdById: movementData.createdById,
                warehouseId: idValue,
                stockPerWarehouseId: actualStockId,
                occurredAt: movementData.occurredAt,
              },
            });
          }
        }

        // Fetch the updated warehouse with all stocks (excluding soft-deleted)
        const finalWarehouse = await tx.warehouse.findUnique({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          include: {
            stockPerWarehouses: {
              where: {
                deletedAt: null,
              },
            },
          },
        });

        return finalWarehouse;
      });

      return this.mapToDomain(prismaWarehouse);
    } catch (error) {
      // Check if it's a DomainError (which includes UniqueConstraintViolationError)
      if (error instanceof DomainError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update warehouse');
    }
  }

  /**
   * Deletes a warehouse with transaction support
   */
  async delete(id: Id, tenantId: Id): Promise<void> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();

    try {
      await this.prisma.$transaction(async (tx) => {
        // Check if warehouse exists
        const existingWarehouse = await tx.warehouse.findUnique({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          include: {
            stockPerWarehouses: {
              include: {
                stockMovements: true,
              },
            },
          },
        });

        if (!existingWarehouse) {
          throw new ResourceNotFoundError('Warehouse', idValue);
        }

        // Delete stock movements first to avoid foreign key constraint violations
        // StockMovement has a RESTRICT constraint on StockPerWarehouse
        for (const stock of existingWarehouse.stockPerWarehouses) {
          if (stock.stockMovements.length > 0) {
            await tx.stockMovement.deleteMany({
              where: {
                stockPerWarehouseId: stock.id,
              },
            });
          }
        }

        // Delete stock records (cascade)
        await tx.stockPerWarehouse.deleteMany({
          where: {
            warehouseId: idValue,
          },
        });

        // Delete the warehouse
        await tx.warehouse.delete({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
        });
      });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'delete warehouse');
    }
  }

  /**
   * Updates a single stock item in a warehouse
   */
  async updateSingleStock(
    stockId: Id,
    warehouseId: Id,
    stockUpdate: Partial<
      Omit<IStockPerWarehouseBase, 'variantId' | 'warehouseId'>
    >,
    stockMovementContext?: {
      reason?: string;
      createdById?: string;
    },
  ): Promise<Warehouse> {
    const warehouseIdValue = warehouseId.getValue();
    const stockIdValue = stockId.getValue();

    try {
      const prismaWarehouse = await this.prisma.$transaction(async (tx) => {
        // Find existing stock
        const existingStock = await tx.stockPerWarehouse.findFirst({
          where: {
            id: stockIdValue,
            warehouseId: warehouseIdValue,
            deletedAt: null,
          },
        });

        if (!existingStock) {
          throw new ResourceNotFoundError(
            'StockPerWarehouse',
            `Stock ${stockIdValue} in warehouse ${warehouseIdValue}`,
          );
        }

        // Check if this is a removal operation (quantity set to 0 or negative)
        if (stockUpdate.qtyAvailable <= 0) {
          // Create negative stock movement BEFORE deletion
          const stockMovement = StockMovement.create(
            -existingStock.qtyAvailable,
            stockMovementContext?.reason,
            stockMovementContext?.createdById,
            new Date(),
          );

          const movementData = stockMovement.getMovement();
          await tx.stockMovement.create({
            data: {
              id: movementData.id,
              deltaQty: movementData.deltaQty,
              reason: movementData.reason,
              createdById: movementData.createdById,
              warehouseId: warehouseIdValue,
              stockPerWarehouseId: existingStock.id,
              occurredAt: movementData.occurredAt,
            },
          });

          // Soft delete the stock
          await tx.stockPerWarehouse.update({
            where: { id: existingStock.id },
            data: {
              qtyAvailable: 0,
              qtyReserved: 0,
              productLocation: null,
              estimatedReplenishmentDate: null,
              lotNumber: null,
              serialNumbers: [],
              deletedAt: new Date(),
            },
          });
        } else {
          // This is a regular update operation
          // Only create stock movement if qtyAvailable is provided in the request
          if (
            stockUpdate.qtyAvailable !== undefined &&
            existingStock.qtyAvailable !== stockUpdate.qtyAvailable
          ) {
            // Stock quantity updated - create stock movement
            const deltaQty =
              stockUpdate.qtyAvailable - existingStock.qtyAvailable;

            const stockMovement = StockMovement.create(
              deltaQty,
              stockMovementContext?.reason,
              stockMovementContext?.createdById,
              new Date(),
            );

            const movementData = stockMovement.getMovement();
            await tx.stockMovement.create({
              data: {
                id: movementData.id,
                deltaQty: movementData.deltaQty,
                reason: movementData.reason,
                createdById: movementData.createdById,
                warehouseId: warehouseIdValue,
                stockPerWarehouseId: existingStock.id,
                occurredAt: movementData.occurredAt,
              },
            });
          }

          // Update the stock record
          await tx.stockPerWarehouse.update({
            where: { id: existingStock.id },
            data: {
              qtyAvailable:
                stockUpdate.qtyAvailable ?? existingStock.qtyAvailable,
              qtyReserved: stockUpdate.qtyReserved ?? existingStock.qtyReserved,
              productLocation:
                stockUpdate.productLocation ?? existingStock.productLocation,
              estimatedReplenishmentDate:
                stockUpdate.estimatedReplenishmentDate ??
                existingStock.estimatedReplenishmentDate,
              lotNumber: stockUpdate.lotNumber ?? existingStock.lotNumber,
              serialNumbers:
                stockUpdate.serialNumbers ?? existingStock.serialNumbers,
            },
          });
        }

        // Return updated warehouse with fresh data
        const updatedWarehouse = await tx.warehouse.findUnique({
          where: { id: warehouseIdValue },
          include: {
            stockPerWarehouses: {
              where: { deletedAt: null },
            },
          },
        });

        if (!updatedWarehouse) {
          throw new ResourceNotFoundError('Warehouse', warehouseIdValue);
        }

        return updatedWarehouse;
      });

      return this.mapToDomain(prismaWarehouse);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update single stock');
    }
  }

  /**
   * Finds a warehouse by ID with proper error handling
   */
  async findById(id: Id, tenantId: Id): Promise<Warehouse | null> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();

    try {
      const prismaWarehouse = await this.prisma.warehouse.findUnique({
        where: {
          id: idValue,
          tenantId: tenantIdValue,
        },
        include: {
          stockPerWarehouses: true,
        },
      });

      return prismaWarehouse ? this.mapToDomain(prismaWarehouse) : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'find warehouse by id');
    }
  }

  /**
   * Finds all warehouses with pagination and filtering
   */
  async findAll(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      addressId?: Id;
      variantId?: Id;
      lowStockThreshold?: number;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ warehouses: Warehouse[]; total: number; hasMore: boolean }> {
    const tenantIdValue = tenantId.getValue();
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || SortBy.CREATED_AT;
    const sortOrder = options?.sortOrder || SortOrder.DESC;

    try {
      // Build where clause
      const whereClause: Prisma.WarehouseWhereInput = {
        tenantId: tenantIdValue,
      };

      if (options?.name) {
        whereClause.name = {
          contains: options.name,
          mode: 'insensitive',
        };
      }

      if (options?.addressId) {
        whereClause.addressId = options.addressId.getValue();
      }

      // Only filter at database level for basic stock existence
      // Detailed filtering will be done post-query for better control
      if (options?.variantId || options?.lowStockThreshold !== undefined) {
        // Ensure warehouses have stockPerWarehouses to filter
        whereClause.stockPerWarehouses = {
          some: {}, // Just ensure they have some stock items
        };
      }

      // Build order by clause
      const orderBy: Prisma.WarehouseOrderByWithRelationInput = {};
      orderBy[sortBy] = sortOrder;

      // Execute queries in parallel
      const [warehouses, total] = await Promise.all([
        this.prisma.warehouse.findMany({
          where: whereClause,
          include: {
            stockPerWarehouses: {
              where: {
                deletedAt: null,
              },
              include: {
                variant: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.warehouse.count({
          where: whereClause,
        }),
      ]);

      // Filter stockPerWarehouses based on lowStockThreshold if provided
      let filteredWarehouses = warehouses;
      if (options?.lowStockThreshold !== undefined) {
        filteredWarehouses = warehouses
          .map((warehouse) => ({
            ...warehouse,
            stockPerWarehouses: warehouse.stockPerWarehouses.filter((stock) => {
              const matchesThreshold =
                stock.qtyAvailable <= options.lowStockThreshold;
              let matchesVariant = true;

              // If variantId is specified, also filter by variant
              if (options?.variantId) {
                matchesVariant =
                  stock.variantId === options.variantId.getValue();
              }

              return matchesThreshold && matchesVariant;
            }),
          }))
          .filter((warehouse) => warehouse.stockPerWarehouses.length > 0); // Only keep warehouses with matching stock
      } else if (options?.variantId) {
        // If only variantId is specified, filter by variant only
        filteredWarehouses = warehouses
          .map((warehouse) => ({
            ...warehouse,
            stockPerWarehouses: warehouse.stockPerWarehouses.filter(
              (stock) => stock.variantId === options.variantId.getValue(),
            ),
          }))
          .filter((warehouse) => warehouse.stockPerWarehouses.length > 0);
      }

      const mappedWarehouses = filteredWarehouses.map((warehouse) =>
        this.mapToDomain(warehouse),
      );

      const hasMore = skip + warehouses.length < total;

      return {
        warehouses: mappedWarehouses,
        total: filteredWarehouses.length, // Use filtered count
        hasMore,
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'find all warehouses');
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          // Unique constraint violation
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          const target = error.meta?.target as string[] | undefined;

          // Handle StockPerWarehouse unique constraint specifically
          if (
            target &&
            target.includes('warehouseId') &&
            target.includes('variantId')
          ) {
            throw new UniqueConstraintViolationError(
              'variantId',
              `Stock for this variant already exists in the warehouse`,
            );
          }

          throw new UniqueConstraintViolationError(
            field,
            `Warehouse ${field} already exists`,
          );
        }
        case 'P2003': {
          // Foreign key constraint violation
          const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
          const fieldToEntityMap: Record<string, string> = {
            addressId: 'Address',
            tenantId: 'Tenant',
            stockPerWarehouseId: 'StockPerWarehouse',
            warehouseId: 'Warehouse',
            variantId: 'Variant',
            createdById: 'Employee',
          };
          const relatedEntity = fieldToEntityMap[field] || 'Related Entity';
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        case 'P2025': // Record not found
          throw new ResourceNotFoundError('Warehouse');
        default:
          break;
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }

  /**
   * Maps Prisma warehouse to domain entity
   */
  private mapToDomain(prismaWarehouse: PrismaWarehouse): Warehouse {
    return WarehouseMapper.fromPersistence(prismaWarehouse);
  }
}
