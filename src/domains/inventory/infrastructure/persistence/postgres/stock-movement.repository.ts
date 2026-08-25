import { Injectable } from '@nestjs/common';
import { Prisma, StockMovement as PrismaStockMovement } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { handlePrismaDatabaseError } from '@utils/prisma-error-utils';
import { IStockMovementRepository } from '../../../aggregates/repositories';
import {
  Id,
  SortBy,
  SortOrder,
  StockMovement,
} from '../../../aggregates/value-objects';
import { StockMovementMapper } from '../../../application/mappers';

@Injectable()
export default class StockMovementRepository
  implements IStockMovementRepository
{
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Finds all stock movements with pagination and filtering
   */
  async findAll(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      warehouseId?: Id;
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
        warehouse: {
          tenantId: tenantId.getValue(),
          id: options?.warehouseId?.getValue(),
        },
        StockPerWarehouse: {
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
          include: {
            StockPerWarehouse: true,
          },
        }),
        this.prisma.stockMovement.count({
          where: whereClause,
        }),
      ]);

      const mappedMovements = movements.map((movement) =>
        this.mapToDomain(movement, movement.StockPerWarehouse?.variantId),
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

  private handleDatabaseError(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Stock Movement',
    });
  }

  /**
   * Maps Prisma stock movement to domain value object
   */
  private mapToDomain(
    prismaMovement: PrismaStockMovement & {
      StockPerWarehouse?: { variantId: string } | null;
    },
    variantId?: string,
  ): StockMovement {
    return StockMovementMapper.fromPersistence(prismaMovement, variantId);
  }
}
