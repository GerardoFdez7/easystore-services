import { BadRequestException } from '@nestjs/common';
import { WarehouseName } from '../../value-objects';
import { Id } from '@domains/value-objects';
import { Entity, EntityProps } from '@domains/entity.base';
import { WarehouseCreatedEvent, WarehouseUpdatedEvent } from '../../events';
import { IWarehouseBase } from './warehouse.attributes';
import { StockPerWarehouse } from '../stockPerWarehouse/stock-per-warehouse.entity';

export interface IWarehouseProps extends EntityProps {
  id: Id;
  name: WarehouseName;
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
      name: WarehouseName.create(props.name),
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
      props.name = WarehouseName.create(updates.name);
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

  // Stock management methods for the aggregate root
  public addStockToWarehouse(stock: StockPerWarehouse) {
    this.apply({ type: 'StockPerWarehouseAdded', stock, warehouse: this });
  }

  public updateStockInWarehouse(stock: StockPerWarehouse) {
    this.apply({ type: 'StockPerWarehouseUpdated', stock, warehouse: this });
  }

  public removeStockFromWarehouse(stock: StockPerWarehouse) {
    this.apply({
      type: 'StockPerWarehouseRemoved',
      stockId: stock.getId(),
      warehouse: this,
    });
  }
}
