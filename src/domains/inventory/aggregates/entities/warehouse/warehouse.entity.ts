import {
  Entity,
  EntityProps,
  IWarehouseBase,
  StockPerWarehouse,
  IStockPerWarehouseBase,
} from '../';
import { Id, Name } from '../../value-objects';
import {
  WarehouseCreatedEvent,
  WarehouseUpdatedEvent,
  WarehouseDeletedEvent,
  StockPerWarehouseAddedEvent,
  StockPerWarehouseUpdatedEvent,
  StockPerWarehouseRemovedEvent,
} from '../../events';
import { NotFoundException } from '@nestjs/common';

export interface IWarehouseProps extends EntityProps {
  id: Id;
  name: Name;
  addressId: Id;
  tenantId: Id;
  createdAt: Date;
  updatedAt: Date;
  stocks: StockPerWarehouse[];
}

export class Warehouse extends Entity<IWarehouseProps> {
  private stocksMap: Map<string, StockPerWarehouse>;

  private constructor(props: IWarehouseProps) {
    super(props);
    this.stocksMap = new Map();
    props.stocks.forEach((stock) => {
      const stockId = stock.get('id');
      if (stockId && stockId.getValue() !== undefined) {
        this.stocksMap.set(stockId.getValue(), stock);
      }
    });
  }

  /**
   * Factory method to reconstitute a Warehouse from persistence or other sources.
   * Assumes all props are already in domain format.
   * @param props The complete properties of the warehouse.
   * @returns The reconstituted Warehouse domain entity.
   */
  static reconstitute(props: IWarehouseProps): Warehouse {
    const warehouse = new Warehouse(props);
    warehouse.stocksMap = new Map();
    props.stocks.forEach((stock) => {
      const stockId = stock.get('id');
      if (
        stockId &&
        stockId.getValue() !== null &&
        stockId.getValue() !== undefined
      ) {
        warehouse.stocksMap.set(stockId.getValue(), stock);
      }
    });
    return warehouse;
  }

  /**
   * Factory method to create a new Warehouse
   * @param props The base properties for creating a warehouse
   * @returns The created Warehouse domain entity
   */
  static create(props: IWarehouseBase): Warehouse {
    const transformedProps = {
      id: Id.generate(),
      name: Name.create(props.name),
      addressId: props.addressId ? Id.create(props.addressId) : null,
      tenantId: Id.create(props.tenantId),
      createdAt: new Date(),
      updatedAt: new Date(),
      stocks: [],
    };

    const warehouse = new Warehouse(transformedProps);

    // Apply domain event
    warehouse.apply(new WarehouseCreatedEvent(warehouse));

    return warehouse;
  }

  /**
   * Updates an existing Warehouse with new values
   * @param warehouse The existing Warehouse to update
   * @param updates The properties to update
   * @returns The updated Warehouse domain entity
   */
  static update(
    warehouse: Warehouse,
    updates: Partial<Omit<IWarehouseBase, 'tenantId'>>,
  ): Warehouse {
    const props = { ...warehouse.props };

    if (updates.name !== undefined) {
      props.name = Name.create(updates.name);
    }

    if (updates.addressId !== undefined) {
      props.addressId = Id.create(updates.addressId);
    }

    props.updatedAt = new Date();

    const updatedWarehouse = new Warehouse(props);

    // Apply domain event
    updatedWarehouse.apply(new WarehouseUpdatedEvent(updatedWarehouse));

    return updatedWarehouse;
  }

  /**
   * Deletes a warehouse.
   * @param warehouse The warehouse to delete.
   */
  static delete(warehouse: Warehouse): Warehouse {
    // Apply domain event
    warehouse.apply(new WarehouseDeletedEvent(warehouse));

    return warehouse;
  }

  private getStockOrThrow(stockId: string): StockPerWarehouse {
    const stock = this.stocksMap.get(stockId);
    if (!stock) {
      throw new NotFoundException(
        `Stock with ID ${stockId} not found in warehouse ${this.props.id.getValue()}.`,
      );
    }
    return stock;
  }

  // Stock management methods for the aggregate root
  public addStockToWarehouse(stockData: IStockPerWarehouseBase): Warehouse {
    const stock = StockPerWarehouse.create({
      ...stockData,
      warehouseId: this.props.id.getValue(),
    });

    const newStocks = [...this.props.stocks, stock];
    const newProps = {
      ...this.props,
      stocks: newStocks,
      updatedAt: new Date(),
    };

    const updatedWarehouse = new Warehouse(newProps);
    updatedWarehouse.apply(
      new StockPerWarehouseAddedEvent(stock, updatedWarehouse),
    );
    return updatedWarehouse;
  }

  public updateStockInWarehouse(
    stockId: string,
    updateData: Partial<IStockPerWarehouseBase>,
  ): Warehouse {
    const existingStock = this.getStockOrThrow(stockId);

    const updatedStock = StockPerWarehouse.update(existingStock, updateData);

    const newStocks = this.props.stocks.map((stock) => {
      const currentStockId = stock.get('id');
      if (currentStockId && currentStockId.getValue() === stockId) {
        return updatedStock;
      }
      return stock;
    });

    const newProps = {
      ...this.props,
      stocks: newStocks,
      updatedAt: new Date(),
    };

    const updatedWarehouse = new Warehouse(newProps);
    updatedWarehouse.apply(
      new StockPerWarehouseUpdatedEvent(updatedStock, updatedWarehouse),
    );
    return updatedWarehouse;
  }

  public removeStockFromWarehouse(stockId: string): Warehouse {
    const stockToRemove = this.getStockOrThrow(stockId);

    const newStocks = this.props.stocks.filter((stock) => {
      const currentStockId = stock.get('id');
      return currentStockId && currentStockId.getValue() !== stockId;
    });

    const newProps = {
      ...this.props,
      stocks: newStocks,
      updatedAt: new Date(),
    };

    const updatedWarehouse = new Warehouse(newProps);
    updatedWarehouse.apply(
      new StockPerWarehouseRemovedEvent(stockToRemove, updatedWarehouse),
    );
    return updatedWarehouse;
  }
}
