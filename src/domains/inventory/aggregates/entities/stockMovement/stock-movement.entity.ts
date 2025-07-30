import { DeltaQty } from '../../value-objects/stockMovement/delta-qty.vo';
import { LongDescription } from '@domains/value-objects';
import { Id } from '@domains/value-objects';
import { Entity, EntityProps } from '@domains/entity.base';
import { StockMovementCreatedEvent } from '../../events';
import { IStockMovementBase } from './stock-movement.attributes';

export interface IStockMovementProps extends EntityProps {
  id: Id;
  deltaQty: DeltaQty;
  reason: LongDescription;
  createdById: string | null;
  warehouseId: Id;
  stockPerWarehouseId: Id;
  ocurredAt: Date;
}

export class StockMovement extends Entity<IStockMovementProps> {
  private constructor(props: IStockMovementProps) {
    super(props);
  }

  /**
   * Factory method to reconstitute a StockMovement from persistence or other sources.
   * Assumes all props are already in domain format.
   * @param props The complete properties of the stock movement.
   * @returns The reconstituted StockMovement domain entity.
   */
  static reconstitute(props: IStockMovementProps): StockMovement {
    return new StockMovement(props);
  }

  /**
   * Factory method to create a new StockMovement
   * @param props The base properties for creating a stock movement
   * @returns The created StockMovement domain entity
   */
  static create(props: IStockMovementBase): StockMovement {
    const transformedProps = {
      id: Id.generate(),
      deltaQty: DeltaQty.create(props.deltaQty),
      reason: LongDescription.create(props.reason),
      createdById: props.createdById || null,
      warehouseId: Id.create(props.warehouseId),
      stockPerWarehouseId: Id.create(props.stockPerWarehouseId),
      ocurredAt: props.ocurredAt || new Date(),
    };

    const stockMovement = new StockMovement(transformedProps);

    // Apply domain event
    stockMovement.apply(new StockMovementCreatedEvent(stockMovement));

    return stockMovement;
  }
}
