import {
  StockMovement,
  IStockMovementProps,
  IStockMovementType,
  IStockMovementBase,
} from '../../../aggregates/entities';
import { DeltaQty } from '../../../aggregates/value-objects/stockMovement/delta-qty.vo';
import { Reason } from '../../../aggregates/value-objects/stockMovement/reason.vo';
import {
  StockMovementDTO,
  PaginatedStockMovementsDTO,
} from './stock-movement.dto';
import { Id } from '@domains/value-objects';

/**
 * Centralized mapper for StockMovement domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class StockMovementMapper {
  /**
   * Maps a persistence StockMovement model to a domain StockMovement entity
   * @param persistenceStockMovement The Persistence StockMovement model
   * @returns The mapped StockMovement domain entity
   */
  static fromPersistence(
    persistenceStockMovement: IStockMovementType,
  ): StockMovement {
    const stockMovementProps: IStockMovementProps = {
      id: Id.create(persistenceStockMovement.id),
      deltaQty: DeltaQty.create(persistenceStockMovement.deltaQty),
      reason: Reason.create(persistenceStockMovement.reason),
      createdById: persistenceStockMovement.createdById || null,
      warehouseId: Id.create(persistenceStockMovement.warehouseId),
      stockPerWarehouseId: Id.create(
        persistenceStockMovement.stockPerWarehouseId,
      ),
      ocurredAt: persistenceStockMovement.ocurredAt,
    };
    return StockMovement.reconstitute(stockMovementProps);
  }

  /**
   * Maps a StockMovement domain entity to a StockMovementDTO
   * @param stockMovement The stock movement domain entity
   * @param fields Optional array of fields to include in the DTO
   * @returns The stock movement DTO
   */
  static toDto(
    data: StockMovement | PaginatedStockMovementsDTO | StockMovementDTO,
    fields?: string[],
  ): StockMovementDTO | PaginatedStockMovementsDTO {
    // If data is already a StockMovementDTO, return it directly
    if (!('stockMovements' in data) && !('props' in data)) {
      return data;
    }

    // Handle pagination result
    if ('stockMovements' in data && 'total' in data) {
      const paginatedData = data as PaginatedStockMovementsDTO;
      return {
        stockMovements: paginatedData.stockMovements.map(
          (stockMovement) =>
            this.toDto(stockMovement, fields) as StockMovementDTO,
        ),
        total: paginatedData.total,
        hasMore: paginatedData.hasMore,
      } as PaginatedStockMovementsDTO;
    }

    // Handle single stock movement
    const stockMovement = data as StockMovement;

    // If no fields specified, return all fields
    if (!fields || fields.length === 0) {
      return stockMovement.toDTO<StockMovementDTO>((entity) => ({
        id: entity.get('id')?.getValue(),
        deltaQty: entity.get('deltaQty')?.getValue(),
        reason: entity.get('reason')?.getValue(),
        createdById: entity.get('createdById'),
        warehouseId: entity.get('warehouseId')?.getValue(),
        stockPerWarehouseId: entity.get('stockPerWarehouseId')?.getValue(),
        ocurredAt: entity.get('ocurredAt'),
      }));
    }

    // Return only requested fields
    const dto: Partial<StockMovementDTO> = {};

    // Always include ID
    dto.id = stockMovement.get('id')?.getValue();

    // Map only requested fields
    fields.forEach((field) => {
      switch (field) {
        case 'deltaQty':
          dto.deltaQty = stockMovement.get('deltaQty')?.getValue();
          break;
        case 'reason':
          dto.reason = stockMovement.get('reason')?.getValue();
          break;
        case 'createdById':
          dto.createdById = stockMovement.get('createdById');
          break;
        case 'warehouseId':
          dto.warehouseId = stockMovement.get('warehouseId')?.getValue();
          break;
        case 'stockPerWarehouseId':
          dto.stockPerWarehouseId = stockMovement
            .get('stockPerWarehouseId')
            ?.getValue();
          break;
        case 'ocurredAt':
          dto.ocurredAt = stockMovement.get('ocurredAt');
          break;
      }
    });

    return dto as StockMovementDTO;
  }

  /**
   * Maps an array of StockMovement domain entities to an array of StockMovementDTOs
   * @param stockMovements The array of stock movement domain entities
   * @param fields Optional array of fields to include in the DTOs
   * @returns Array of stock movement DTOs
   */
  static toDtoArray(
    stockMovements: StockMovement[],
    fields?: string[],
  ): StockMovementDTO[] {
    return stockMovements.map(
      (stockMovement) => this.toDto(stockMovement, fields) as StockMovementDTO,
    );
  }

  /**
   * Maps a create DTO to a StockMovement domain entity
   * @param dto The create DTO
   * @returns The stock movement domain entity
   */
  static fromCreateDto(dto: IStockMovementBase): StockMovement {
    return StockMovement.create(dto);
  }
}
