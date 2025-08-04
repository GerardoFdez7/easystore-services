import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { Prisma, Warehouse as PrismaWarehouse } from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@domains/errors';
import { Warehouse } from '../../../aggregates/entities';
import { WarehouseMapper } from '../../../application/mappers';
import { Id, SortBy, SortOrder } from '@domains/value-objects';
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
        // Create the warehouse with its stock records
        const createdWarehouse = await tx.warehouse.create({
          data: {
            id: warehouseDto.id,
            name: warehouseDto.name,
            addressId: warehouseDto.addressId,
            tenantId: warehouseDto.tenantId,
            createdAt: warehouseDto.createdAt,
            updatedAt: warehouseDto.updatedAt,
          },
          include: {
            stockPerWarehouses: true,
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
   * Updates an existing warehouse with transaction support
   */
  async update(id: Id, tenantId: Id, updates: Warehouse): Promise<Warehouse> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();
    const updatesDto = WarehouseMapper.toDto(updates);

    try {
      const prismaWarehouse = await this.prisma.$transaction(async (tx) => {
        // Check if warehouse exists
        const existingWarehouse = await tx.warehouse.findUnique({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
        });

        if (!existingWarehouse) {
          throw new ResourceNotFoundError('Warehouse', idValue);
        }

        // Update the warehouse
        const updatedWarehouse = await tx.warehouse.update({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          data: {
            name: updatesDto.name,
            addressId: updatesDto.addressId,
            updatedAt: updatesDto.updatedAt,
          },
          include: {
            stockPerWarehouses: true,
          },
        });

        return updatedWarehouse;
      });

      return this.mapToDomain(prismaWarehouse);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
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
            stockPerWarehouses: true,
          },
        });

        if (!existingWarehouse) {
          throw new ResourceNotFoundError('Warehouse', idValue);
        }

        // Delete stock records first (cascade)
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

      // Build order by clause
      const orderBy: Prisma.WarehouseOrderByWithRelationInput = {};
      orderBy[sortBy] = sortOrder;

      // Execute queries in parallel
      const [warehouses, total] = await Promise.all([
        this.prisma.warehouse.findMany({
          where: whereClause,
          include: {
            stockPerWarehouses: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.warehouse.count({
          where: whereClause,
        }),
      ]);

      const mappedWarehouses = warehouses.map((warehouse) =>
        this.mapToDomain(warehouse),
      );

      const hasMore = skip + warehouses.length < total;

      return {
        warehouses: mappedWarehouses,
        total,
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
