import {
  StockPerWarehouse,
  IStockPerWarehouseProps,
  IStockPerWarehouseType,
  IStockPerWarehouseBase,
} from '../../../aggregates/entities';
import {
  QtyAvailable,
  QtyReserved,
  ProductLocation,
  EstimatedReplenishmentDate,
  LotNumber,
  SerialNumbers,
} from '../../../aggregates/value-objects';
import {
  StockPerWarehouseDTO,
  PaginatedStockPerWarehousesDTO,
} from './stock-per-warehouse.dto';
import { Id } from '@domains/value-objects';

/**
 * Centralized mapper for StockPerWarehouse domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class StockPerWarehouseMapper {
  /**
   * Maps a persistence StockPerWarehouse model to a domain StockPerWarehouse entity
   * @param persistenceStockPerWarehouse The Persistence StockPerWarehouse model
   * @returns The mapped StockPerWarehouse domain entity
   */
  static fromPersistence(
    persistenceStockPerWarehouse: IStockPerWarehouseType,
  ): StockPerWarehouse {
    const stockPerWarehouseProps: IStockPerWarehouseProps = {
      id: Id.create(persistenceStockPerWarehouse.id),
      qtyAvailable: QtyAvailable.create(
        persistenceStockPerWarehouse.qtyAvailable,
      ),
      qtyReserved: QtyReserved.create(persistenceStockPerWarehouse.qtyReserved),
      productLocation: ProductLocation.create(
        persistenceStockPerWarehouse.productLocation || null,
      ),
      estimatedReplenishmentDate: EstimatedReplenishmentDate.create(
        persistenceStockPerWarehouse.estimatedReplenishmentDate || null,
      ),
      lotNumber: LotNumber.create(
        persistenceStockPerWarehouse.lotNumber || null,
      ),
      serialNumbers: SerialNumbers.create(
        persistenceStockPerWarehouse.serialNumbers || [],
      ),
      variantId: Id.create(persistenceStockPerWarehouse.variantId),
      warehouseId: Id.create(persistenceStockPerWarehouse.warehouseId),
    };
    return StockPerWarehouse.reconstitute(stockPerWarehouseProps);
  }

  /**
   * Maps a StockPerWarehouse domain entity to a StockPerWarehouseDTO
   * @param stockPerWarehouse The stock per warehouse domain entity
   * @param fields Optional array of fields to include in the DTO
   * @returns The stock per warehouse DTO
   */
  static toDto(
    data:
      | StockPerWarehouse
      | PaginatedStockPerWarehousesDTO
      | StockPerWarehouseDTO,
    fields?: string[],
  ): StockPerWarehouseDTO | PaginatedStockPerWarehousesDTO {
    // If data is already a StockPerWarehouseDTO, return it directly
    if (!('stockPerWarehouses' in data) && !('props' in data)) {
      return data;
    }

    // Handle pagination result
    if ('stockPerWarehouses' in data && 'total' in data) {
      const paginatedData = data as PaginatedStockPerWarehousesDTO;
      return {
        stockPerWarehouses: paginatedData.stockPerWarehouses.map(
          (stockPerWarehouse) =>
            this.toDto(stockPerWarehouse, fields) as StockPerWarehouseDTO,
        ),
        total: paginatedData.total,
        hasMore: paginatedData.hasMore,
      } as PaginatedStockPerWarehousesDTO;
    }

    // Handle single stock per warehouse
    const stockPerWarehouse = data as StockPerWarehouse;

    // If no fields specified, return all fields
    if (!fields || fields.length === 0) {
      return stockPerWarehouse.toDTO<StockPerWarehouseDTO>((entity) => ({
        id: entity.get('id')?.getValue(),
        qtyAvailable: entity.get('qtyAvailable')?.getValue(),
        qtyReserved: entity.get('qtyReserved')?.getValue(),
        productLocation: entity.get('productLocation')?.getValue(),
        estimatedReplenishmentDate: entity
          .get('estimatedReplenishmentDate')
          ?.getValue(),
        lotNumber: entity.get('lotNumber')?.getValue(),
        serialNumbers: entity.get('serialNumbers')?.getValue(),
        variantId: entity.get('variantId')?.getValue(),
        warehouseId: entity.get('warehouseId')?.getValue(),
      }));
    }

    // Return only requested fields
    const dto: Partial<StockPerWarehouseDTO> = {};

    // Always include ID
    dto.id = stockPerWarehouse.get('id')?.getValue();

    // Map only requested fields
    fields.forEach((field) => {
      switch (field) {
        case 'qtyAvailable':
          dto.qtyAvailable = stockPerWarehouse.get('qtyAvailable')?.getValue();
          break;
        case 'qtyReserved':
          dto.qtyReserved = stockPerWarehouse.get('qtyReserved')?.getValue();
          break;
        case 'productLocation':
          dto.productLocation = stockPerWarehouse
            .get('productLocation')
            ?.getValue();
          break;
        case 'estimatedReplenishmentDate':
          dto.estimatedReplenishmentDate = stockPerWarehouse
            .get('estimatedReplenishmentDate')
            ?.getValue();
          break;
        case 'lotNumber':
          dto.lotNumber = stockPerWarehouse.get('lotNumber')?.getValue();
          break;
        case 'serialNumbers':
          dto.serialNumbers = stockPerWarehouse
            .get('serialNumbers')
            ?.getValue();
          break;
        case 'variantId':
          dto.variantId = stockPerWarehouse.get('variantId')?.getValue();
          break;
        case 'warehouseId':
          dto.warehouseId = stockPerWarehouse.get('warehouseId')?.getValue();
          break;
      }
    });

    return dto as StockPerWarehouseDTO;
  }

  /**
   * Maps an array of StockPerWarehouse domain entities to an array of StockPerWarehouseDTOs
   * @param stockPerWarehouses The array of stock per warehouse domain entities
   * @param fields Optional array of fields to include in the DTOs
   * @returns Array of stock per warehouse DTOs
   */
  static toDtoArray(
    stockPerWarehouses: StockPerWarehouse[],
    fields?: string[],
  ): StockPerWarehouseDTO[] {
    return stockPerWarehouses.map(
      (stockPerWarehouse) =>
        this.toDto(stockPerWarehouse, fields) as StockPerWarehouseDTO,
    );
  }

  /**
   * Maps a create DTO to a StockPerWarehouse domain entity
   * @param dto The create DTO
   * @returns The stock per warehouse domain entity
   */
  static fromCreateDto(dto: IStockPerWarehouseBase): StockPerWarehouse {
    return StockPerWarehouse.create(dto);
  }

  /**
   * Maps an update DTO to update an existing StockPerWarehouse domain entity
   * @param existingStockPerWarehouse The existing stock per warehouse domain entity
   * @param dto The update DTO
   * @returns The updated stock per warehouse domain entity
   */
  static fromUpdateDto(
    existingStockPerWarehouse: StockPerWarehouse,
    dto: Partial<IStockPerWarehouseBase>,
  ): StockPerWarehouse {
    return StockPerWarehouse.update(existingStockPerWarehouse, dto);
  }
}
