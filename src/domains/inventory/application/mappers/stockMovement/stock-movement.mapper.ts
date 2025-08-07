import { StockMovement } from '../../../aggregates/value-objects';
import {
  StockMovementDTO,
  PaginatedStockMovementsDTO,
} from './stock-movement.dto';

interface PersistenceStockMovement {
  id: string;
  deltaQty: number;
  reason: string;
  createdById: string;
  warehouseId: string;
  stockPerWarehouseId: string;
  occurredAt: Date;
}

/**
 * Centralized mapper for StockMovement value object to DTO conversion for queries.
 * Handles mapping between persistence layer models to domain value objects.
 * Note: StockMovement is read-only, so only includes query-related mappings.
 */
export class StockMovementMapper {
  /**
   * Maps a persistence StockMovement model to a domain StockMovement value object
   * @param persistenceStockMovement The persistence StockMovement model
   * @returns The mapped StockMovement domain value object
   */
  static fromPersistence(
    persistenceStockMovement: PersistenceStockMovement,
  ): StockMovement {
    return StockMovement.create(
      persistenceStockMovement.deltaQty,
      persistenceStockMovement.reason,
      persistenceStockMovement.createdById,
      persistenceStockMovement.occurredAt,
    );
  }

  /**
   * Maps a StockMovement domain value object to a StockMovementDTO
   * @param stockMovement The StockMovement domain value object
   * @returns The StockMovement DTO
   */
  static toDto(
    stockMovement: StockMovement,
    warehouseId?: string,
  ): StockMovementDTO {
    return {
      id: stockMovement.getId().getValue(),
      deltaQty: stockMovement.getDeltaQty(),
      reason: stockMovement.getReason().getValue(),
      warehouseId: warehouseId,
      occurredAt: stockMovement.getOccurredAt(),
      createdById: stockMovement.getCreatedById(),
    };
  }

  /**
   * Maps paginated StockMovement results from repository to PaginatedStockMovementsDTO
   * @param paginatedResult The paginated result from repository
   * @param movementsWithMetadata Array of movements with additional metadata
   * @returns The paginated StockMovements DTO
   */
  static toPaginatedDto(
    paginatedResult: {
      movements: StockMovement[];
      total: number;
      hasMore: boolean;
    },
    movementsWithMetadata?: Array<{
      movement: StockMovement;
      warehouseId: string;
      stockPerWarehouseId: string | null;
    }>,
  ): PaginatedStockMovementsDTO {
    return {
      stockMovements: movementsWithMetadata
        ? movementsWithMetadata.map((item) =>
            this.toDto(item.movement, item.warehouseId),
          )
        : paginatedResult.movements.map((movement) => this.toDto(movement)),
      total: paginatedResult.total,
      hasMore: paginatedResult.hasMore,
    };
  }

  /**
   * Maps an array of StockMovement domain value objects to an array of DTOs
   * @param stockMovements Array of StockMovement domain value objects
   * @returns Array of StockMovement DTOs
   */
  static toDtoArray(stockMovements: StockMovement[]): StockMovementDTO[] {
    return stockMovements.map((movement) => this.toDto(movement));
  }

  /**
   * Creates a StockMovementDTO directly from persistence data
   * @param persistenceData The persistence data
   * @returns The StockMovement DTO
   */
  static toDtoFromPersistence(
    persistenceData: PersistenceStockMovement,
  ): StockMovementDTO {
    const domainMovement = this.fromPersistence(persistenceData);
    return this.toDto(domainMovement, persistenceData.warehouseId);
  }
}
