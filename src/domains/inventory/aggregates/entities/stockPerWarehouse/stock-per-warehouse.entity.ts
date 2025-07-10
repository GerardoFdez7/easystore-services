import { BadRequestException } from '@nestjs/common';
import {
  QtyAvailable,
  QtyReserved,
  ProductLocation,
  EstimatedReplenishmentDate,
  LotNumber,
  SerialNumbers,
  VariantId,
} from '../../value-objects/stockPerWarehouse';
import { Id } from '@domains/value-objects';
import { Entity, EntityProps } from '@domains/entity.base';
import {
  StockPerWarehouseCreatedEvent,
  StockPerWarehouseUpdatedEvent,
} from '../../events';
import { IStockPerWarehouseBase } from './stock-per-warehouse.attributes';

export interface IStockPerWarehouseProps extends EntityProps {
  id: Id;
  qtyAvailable: QtyAvailable;
  qtyReserved: QtyReserved;
  productLocation: ProductLocation;
  estimatedReplenishmentDate: EstimatedReplenishmentDate;
  lotNumber: LotNumber;
  serialNumbers: SerialNumbers;
  variantId: VariantId;
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
      qtyAvailable: QtyAvailable.create(props.qtyAvailable || 0),
      qtyReserved: QtyReserved.create(props.qtyReserved || 0),
      productLocation: ProductLocation.create(props.productLocation || null),
      estimatedReplenishmentDate: EstimatedReplenishmentDate.create(
        props.estimatedReplenishmentDate || null,
      ),
      lotNumber: LotNumber.create(props.lotNumber || null),
      serialNumbers: SerialNumbers.create(props.serialNumbers || []),
      variantId: VariantId.create(props.variantId),
      warehouseId: Id.create(props.warehouseId),
    };

    const stockPerWarehouse = new StockPerWarehouse(transformedProps);

    // Apply domain event
    stockPerWarehouse.apply(new StockPerWarehouseCreatedEvent(stockPerWarehouse));

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
      props.productLocation = ProductLocation.create(updates.productLocation);
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

    // Apply domain event
    updatedStockPerWarehouse.apply(new StockPerWarehouseUpdatedEvent(updatedStockPerWarehouse));

    return updatedStockPerWarehouse;
  }

  // Getters
  public getId(): Id {
    return this.props.id;
  }

  public getQtyAvailable(): QtyAvailable {
    return this.props.qtyAvailable;
  }

  public getQtyReserved(): QtyReserved {
    return this.props.qtyReserved;
  }

  public getProductLocation(): ProductLocation {
    return this.props.productLocation;
  }

  public getEstimatedReplenishmentDate(): EstimatedReplenishmentDate {
    return this.props.estimatedReplenishmentDate;
  }

  public getLotNumber(): LotNumber {
    return this.props.lotNumber;
  }

  public getSerialNumbers(): SerialNumbers {
    return this.props.serialNumbers;
  }

  public getVariantId(): VariantId {
    return this.props.variantId;
  }

  public getWarehouseId(): Id {
    return this.props.warehouseId;
  }

  // Business logic methods
  public getTotalStock(): number {
    return this.props.qtyAvailable.getValue() + this.props.qtyReserved.getValue();
  }

  public getAvailableStock(): number {
    return this.props.qtyAvailable.getValue();
  }

  public getReservedStock(): number {
    return this.props.qtyReserved.getValue();
  }

  public hasStock(): boolean {
    return this.props.qtyAvailable.isPositive();
  }

  public hasReservedStock(): boolean {
    return this.props.qtyReserved.isPositive();
  }

  public canReserve(quantity: number): boolean {
    return this.props.qtyAvailable.getValue() >= quantity;
  }

  public reserveStock(quantity: number): StockPerWarehouse {
    if (!this.canReserve(quantity)) {
      throw new BadRequestException('Insufficient stock to reserve');
    }

    return StockPerWarehouse.update(this, {
      qtyAvailable: this.props.qtyAvailable.getValue() - quantity,
      qtyReserved: this.props.qtyReserved.getValue() + quantity,
    });
  }

  public releaseReservedStock(quantity: number): StockPerWarehouse {
    if (this.props.qtyReserved.getValue() < quantity) {
      throw new BadRequestException('Insufficient reserved stock to release');
    }

    return StockPerWarehouse.update(this, {
      qtyAvailable: this.props.qtyAvailable.getValue() + quantity,
      qtyReserved: this.props.qtyReserved.getValue() - quantity,
    });
  }

  public addStock(quantity: number): StockPerWarehouse {
    return StockPerWarehouse.update(this, {
      qtyAvailable: this.props.qtyAvailable.getValue() + quantity,
    });
  }

  public removeStock(quantity: number): StockPerWarehouse {
    if (this.props.qtyAvailable.getValue() < quantity) {
      throw new BadRequestException('Insufficient stock to remove');
    }

    return StockPerWarehouse.update(this, {
      qtyAvailable: this.props.qtyAvailable.getValue() - quantity,
    });
  }

  public updateLocation(location: string): StockPerWarehouse {
    return StockPerWarehouse.update(this, { productLocation: location });
  }

  public updateReplenishmentDate(date: Date): StockPerWarehouse {
    return StockPerWarehouse.update(this, { estimatedReplenishmentDate: date });
  }

  public addSerialNumber(serialNumber: string): StockPerWarehouse {
    const currentSerialNumbers = this.props.serialNumbers.getValue();
    return StockPerWarehouse.update(this, {
      serialNumbers: [...currentSerialNumbers, serialNumber],
    });
  }

  public removeSerialNumber(serialNumber: string): StockPerWarehouse {
    const currentSerialNumbers = this.props.serialNumbers.getValue();
    return StockPerWarehouse.update(this, {
      serialNumbers: currentSerialNumbers.filter(sn => sn !== serialNumber),
    });
  }

  public isLowStock(threshold: number = 10): boolean {
    return this.props.qtyAvailable.getValue() <= threshold;
  }

  public isOutOfStock(): boolean {
    return this.props.qtyAvailable.isZero();
  }

  public needsReplenishment(): boolean {
    return this.isLowStock() && this.props.estimatedReplenishmentDate.hasValue();
  }
} 