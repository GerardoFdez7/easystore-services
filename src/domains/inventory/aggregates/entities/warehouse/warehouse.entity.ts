import {
  Entity,
  EntityProps,
  IWarehouseBase,
  StockPerWarehouse,
  IStockPerWarehouseBase,
} from '../';
import { Id, Name, StockMovement } from '../../value-objects';
import {
  WarehouseCreatedEvent,
  WarehouseUpdatedEvent,
  WarehouseDeletedEvent,
  StockPerWarehouseAddedEvent,
  StockPerWarehouseUpdatedEvent,
  StockPerWarehouseRemovedEvent,
} from '../../events';

export interface IWarehouseProps extends EntityProps {
  id: Id;
  name: Name;
  addressId: Id;
  tenantId: Id;
  createdAt: Date;
  updatedAt: Date;
}

export class Warehouse extends Entity<IWarehouseProps> {
  private constructor(props: IWarehouseProps) {
    super(props);
  }

  /**
   * Factory method to reconstitute a Warehouse from persistence or other sources.
   * Assumes all props are already in domain format.
   * @param props The complete properties of the warehouse.
   * @returns The reconstituted Warehouse domain entity.
   */
  static reconstitute(props: IWarehouseProps): Warehouse {
    return new Warehouse(props);
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
      addressId: Id.create(props.addressId),
      tenantId: Id.create(props.tenantId),
      createdAt: new Date(),
      updatedAt: new Date(),
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
  static delete(warehouse: Warehouse): void {
    // Apply domain event
    warehouse.apply(new WarehouseDeletedEvent(warehouse));
  }

  // Stock management methods for the aggregate root
  public addStockToWarehouse(stockData: IStockPerWarehouseBase): Warehouse {
    const stock = StockPerWarehouse.create({
      ...stockData,
      warehouseId: this.props.id.getValue(),
    });

    // Apply domain event
    this.apply(new StockPerWarehouseAddedEvent(stock, this));

    return this;
  }

  /**
   * Updates an existing stock in the warehouse and automatically creates movement history.
   * @param stock The stock to update.
   * @param updateData The data to update the stock with, conforming to Partial<IStockPerWarehouseBase>.
   */
  public updateStockInWarehouse(
    stock: StockPerWarehouse,
    updateData: Partial<
      Omit<IStockPerWarehouseBase, 'variantId' | 'warehouseId'>
    >,
    reason: string,
    createdById: string,
  ): { updatedWarehouse: Warehouse; movements: StockMovement[] } {
    const movements: StockMovement[] = [];

    // Auto-calculate deltaQty for available quantity changes
    if (updateData.qtyAvailable !== undefined) {
      const oldQty = stock.getQtyAvailable();
      const newQty = updateData.qtyAvailable;
      const deltaQty = newQty - oldQty; // Positive = increase, Negative = decrease

      if (deltaQty !== 0) {
        movements.push(StockMovement.create(deltaQty, reason, createdById));
      }
    }

    // Auto-calculate deltaQty for reserved quantity changes
    if (updateData.qtyReserved !== undefined) {
      const oldReserved = stock.getQtyReserved();
      const newReserved = updateData.qtyReserved;
      const deltaReserved = newReserved - oldReserved;

      if (deltaReserved !== 0) {
        movements.push(
          StockMovement.create(
            -deltaReserved, // Negative because reserving reduces available
            `Reserved stock: ${reason}`,
            createdById,
          ),
        );
      }
    }

    // Update the stock using existing logic
    const updatedStock = StockPerWarehouse.update(stock, updateData);

    // Apply domain event
    this.apply(new StockPerWarehouseUpdatedEvent(updatedStock, this));

    return { updatedWarehouse: this, movements };
  }

  public removeStockFromWarehouse(stock: StockPerWarehouse): Warehouse {
    // Apply domain event
    this.apply(new StockPerWarehouseRemovedEvent(stock, this));

    return this;
  }
}
