import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { Prisma, StockMovement as PrismaStockMovement } from '.prisma/postgres';
import { DatabaseOperationError } from '@domains/errors';
import { StockMovement, Id } from '../../../aggregates/value-objects';
import { SortBy, SortOrder } from '../../../aggregates/value-objects';
import { StockMovementMapper } from '../../../application/mappers';
import IStockMovementRepository from '../../../aggregates/repositories/stock-movement.interface';

@Injectable()
export default class StockMovementRepository
  implements IStockMovementRepository
{
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Finds all stock movements with pagination and filtering
   */
  async findAll(
    warehouseId?: Id,
    options?: {
      page?: number;
      limit?: number;
      variantId?: Id;
      createdById?: Id;
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      includeDeleted?: boolean;
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }> {
    const page = options?.page || 1;
    const limit = options?.limit || 25;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || SortBy.CREATED_AT;
    const sortOrder = options?.sortOrder || SortOrder.DESC;

    try {
      // Build where clause
      const whereClause: Prisma.StockMovementWhereInput = {
        StockPerWarehouse: {
          warehouse: {
            id: warehouseId.getValue(),
          },
          // Filter by soft delete status
          deletedAt: options?.includeDeleted ? undefined : null,
        },
      };

      if (options?.variantId) {
        if (!whereClause.StockPerWarehouse) {
          whereClause.StockPerWarehouse = {};
        }
        whereClause.StockPerWarehouse.variantId = options.variantId.getValue();
      }

      if (options?.createdById) {
        whereClause.createdById = options.createdById.getValue();
      }

      if (options?.dateFrom || options?.dateTo) {
        const dateFilter: Prisma.DateTimeFilter = {};
        if (options.dateFrom) {
          dateFilter.gte = options.dateFrom;
        }
        if (options.dateTo) {
          dateFilter.lte = options.dateTo;
        }
        whereClause.occurredAt = dateFilter;
      }

      // Build order by clause
      const orderBy: Prisma.StockMovementOrderByWithRelationInput = {};
      if (sortBy === SortBy.CREATED_AT) {
        orderBy.occurredAt = sortOrder;
      }

      // Execute queries in parallel
      const [movements, total] = await Promise.all([
        this.prisma.stockMovement.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.stockMovement.count({
          where: whereClause,
        }),
      ]);

      const mappedMovements = movements.map((movement) =>
        this.mapToDomain(movement),
      );

      const hasMore = skip + movements.length < total;

      return {
        movements: mappedMovements,
        total,
        hasMore,
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'find all stock movements');
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }

  /**
   * Maps Prisma stock movement to domain value object
   */
  private mapToDomain(prismaMovement: PrismaStockMovement): StockMovement {
    return StockMovementMapper.fromPersistence(prismaMovement);
  }
}
