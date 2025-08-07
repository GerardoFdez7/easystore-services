import {
  Warehouse,
  IWarehouseProps,
  IWarehouseType,
  IWarehouseBase,
  IStockPerWarehouseBase,
} from '../../../aggregates/entities';
import { Name } from '../../../aggregates/value-objects';
import { WarehouseDTO, PaginatedWarehousesDTO } from './warehouse.dto';
import { StockPerWarehouseMapper } from '../stockPerWarehouse/stock-per-warehouse.mapper';
import { Id } from '@domains/value-objects';

/**
 * Centralized mapper for Warehouse domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class WarehouseMapper {
  /**
   * Maps a persistence Warehouse model to a domain Warehouse entity
   * @param persistenceWarehouse The Persistence Warehouse model
   * @returns The mapped Warehouse domain entity
   */
  static fromPersistence(persistenceWarehouse: IWarehouseType): Warehouse {
    const stocks = persistenceWarehouse.stockPerWarehouses
      ? persistenceWarehouse.stockPerWarehouses.map((stock) =>
          StockPerWarehouseMapper.fromPersistence(stock),
        )
      : [];

    const warehouseProps: IWarehouseProps = {
      id: Id.create(persistenceWarehouse.id),
      name: Name.create(persistenceWarehouse.name),
      addressId: Id.create(persistenceWarehouse.addressId),
      tenantId: Id.create(persistenceWarehouse.tenantId),
      createdAt: persistenceWarehouse.createdAt,
      updatedAt: persistenceWarehouse.updatedAt,
      stocks,
    };
    return Warehouse.reconstitute(warehouseProps);
  }

  /**
   * Maps a Warehouse domain entity to a WarehouseDTO
   * @param warehouse The warehouse domain entity
   * @returns The warehouse DTO
   */
  static toDto(warehouse: Warehouse): WarehouseDTO {
    return warehouse.toDTO<WarehouseDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      name: entity.get('name')?.getValue(),
      addressId: entity.get('addressId')?.getValue(),
      tenantId: entity.get('tenantId')?.getValue(),
      createdAt: entity.get('createdAt'),
      updatedAt: entity.get('updatedAt'),
      stockPerWarehouses: entity
        .get('stocks')
        .map((stock) => StockPerWarehouseMapper.toDto(stock)),
    }));
  }

  /**
   * Maps paginated warehouse results from repository to PaginatedWarehousesDTO
   * @param paginatedResult The paginated result from repository
   * @returns The paginated warehouses DTO
   */
  static toPaginatedDto(paginatedResult: {
    warehouses: Warehouse[];
    total: number;
    hasMore: boolean;
  }): PaginatedWarehousesDTO {
    return {
      warehouses: paginatedResult.warehouses.map((warehouse) =>
        this.toDto(warehouse),
      ),
      total: paginatedResult.total,
      hasMore: paginatedResult.hasMore,
    };
  }

  /**
   * Maps an array of Warehouse domain entities to an array of WarehouseDTOs
   * @param warehouses The array of warehouse domain entities
   * @returns Array of warehouse DTOs
   */
  static toDtoArray(warehouses: Warehouse[]): WarehouseDTO[] {
    return warehouses.map((warehouse) => this.toDto(warehouse));
  }

  /**
   * Maps a create DTO to a Warehouse domain entity
   * @param dto The create DTO
   * @returns The warehouse domain entity
   */
  static fromCreateDto(dto: IWarehouseBase): Warehouse {
    return Warehouse.create(dto);
  }

  /**
   * Maps an update DTO to update an existing Warehouse domain entity
   * @param existingWarehouse The existing warehouse domain entity
   * @param dto The update DTO
   * @returns The updated warehouse domain entity
   */
  static fromUpdateDto(
    existingWarehouse: Warehouse,
    dto: Partial<IWarehouseBase>,
  ): Warehouse {
    return Warehouse.update(existingWarehouse, dto);
  }

  /**
   * Maps a DeleteWarehouseDTO to hard delete a Warehouse
   * @param existingWarehouse The existing warehouse to hard delete
   * @returns The deleted Warehouse domain entity
   */
  static fromDeleteDto(existingWarehouse: Warehouse): Warehouse {
    return Warehouse.delete(existingWarehouse);
  }

  /**
   * Maps data to add stock to warehouse
   * @param warehouse The warehouse to add stock to
   * @param stockData The stock data to add
   * @returns The updated warehouse with added stock
   */
  static fromAddStockToWarehouse(
    warehouse: Warehouse,
    stockData: IStockPerWarehouseBase,
  ): Warehouse {
    return warehouse.addStockToWarehouse(stockData);
  }

  /**
   * Maps data to update stock in warehouse
   * @param warehouse The warehouse containing the stock
   * @param stockId The ID of the stock to update
   * @param updateData The data to update the stock with
   * @returns The updated warehouse
   */
  static fromUpdateStockInWarehouse(
    warehouse: Warehouse,
    stockId: string,
    updateData: Partial<IStockPerWarehouseBase>,
  ): Warehouse {
    return warehouse.updateStockInWarehouse(stockId, updateData);
  }

  /**
   * Maps data to remove stock from warehouse
   * @param warehouse The warehouse to remove stock from
   * @param stockId The ID of the stock to remove
   * @returns The updated warehouse with removed stock
   */
  static fromRemoveStockFromWarehouse(
    warehouse: Warehouse,
    stockId: string,
  ): Warehouse {
    return warehouse.removeStockFromWarehouse(stockId);
  }
}
