import { Entity, EntityProps, IStockPerWarehouseBase } from '../';
import {
  QtyAvailable,
  QtyReserved,
  ShortDescription,
  EstimatedReplenishmentDate,
  LotNumber,
  SerialNumbers,
  Id,
} from '../../value-objects';

export interface IStockPerWarehouseProps extends EntityProps {
  id: Id;
  qtyAvailable: QtyAvailable;
  qtyReserved: QtyReserved;
  productLocation: ShortDescription;
  estimatedReplenishmentDate: EstimatedReplenishmentDate;
  lotNumber: LotNumber;
  serialNumbers: SerialNumbers;
  variantId: Id;
  warehouseId: Id;
}

export class StockPerWarehouse extends Entity<IStockPerWarehouseProps> {
  private constructor(props: IStockPerWarehouseProps) {
    super(props);
  }

  /**
   * Factory method to reconstitute a StockPerWarehouse from persistence or other sources.
   * Assumes all props are already in domain format.
   * @param props The complete properties of the stock per warehouse.
   * @returns The reconstituted StockPerWarehouse domain entity.
   */
  static reconstitute(props: IStockPerWarehouseProps): StockPerWarehouse {
    return new StockPerWarehouse(props);
  }

  /**
   * Factory method to create a new StockPerWarehouse
   * @param props The base properties for creating stock per warehouse
   * @returns The created StockPerWarehouse domain entity
   */
  static create(props: IStockPerWarehouseBase): StockPerWarehouse {
    const transformedProps = {
      id: Id.generate(),
      qtyAvailable: QtyAvailable.create(props.qtyAvailable),
      qtyReserved: QtyReserved.create(props.qtyReserved || 0),
      productLocation: props.productLocation
        ? ShortDescription.create(props.productLocation)
        : null,
      estimatedReplenishmentDate: EstimatedReplenishmentDate.create(
        props.estimatedReplenishmentDate || null,
      ),
      lotNumber: LotNumber.create(props.lotNumber || null),
      serialNumbers: SerialNumbers.create(props.serialNumbers || []),
      variantId: Id.create(props.variantId),
      warehouseId: Id.create(props.warehouseId),
    };

    const stockPerWarehouse = new StockPerWarehouse(transformedProps);

    return stockPerWarehouse;
  }

  /**
   * Updates an existing StockPerWarehouse with new values
   * @param stockPerWarehouse The existing StockPerWarehouse to update
   * @param updates The properties to update
   * @returns The updated StockPerWarehouse domain entity
   */
  static update(
    stockPerWarehouse: StockPerWarehouse,
    updates: Partial<Omit<IStockPerWarehouseBase, 'variantId' | 'warehouseId'>>,
  ): StockPerWarehouse {
    const props = { ...stockPerWarehouse.props };

    if (updates.qtyAvailable !== undefined) {
      props.qtyAvailable = QtyAvailable.create(updates.qtyAvailable);
    }

    if (updates.qtyReserved !== undefined) {
      props.qtyReserved = QtyReserved.create(updates.qtyReserved);
    }

    if (updates.productLocation !== undefined) {
      props.productLocation = ShortDescription.create(updates.productLocation);
    }

    if (updates.estimatedReplenishmentDate !== undefined) {
      props.estimatedReplenishmentDate = EstimatedReplenishmentDate.create(
        updates.estimatedReplenishmentDate,
      );
    }

    if (updates.lotNumber !== undefined) {
      props.lotNumber = LotNumber.create(updates.lotNumber);
    }

    if (updates.serialNumbers !== undefined) {
      props.serialNumbers = SerialNumbers.create(updates.serialNumbers);
    }

    const updatedStockPerWarehouse = new StockPerWarehouse(props);

    return updatedStockPerWarehouse;
  }

  /**
   * Gets the available quantity
   */
  public getQtyAvailable(): number {
    return this.props.qtyAvailable.getValue();
  }

  /**
   * Gets the reserved quantity
   */
  public getQtyReserved(): number {
    return this.props.qtyReserved.getValue();
  }
}
