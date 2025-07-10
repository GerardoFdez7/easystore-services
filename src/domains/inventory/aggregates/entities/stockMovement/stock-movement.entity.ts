import { BadRequestException } from '@nestjs/common';
import {
  DeltaQty,
  Reason,
  CreatedById,
  WarehouseId,
  StockPerWarehouseId,
  OcurredAt,
} from '../../value-objects/stockMovement';
import { Id } from '@domains/value-objects';
import { Entity, EntityProps } from '@domains/entity.base';
import {
  StockMovementCreatedEvent,
} from '../../events';
import { IStockMovementBase } from './stock-movement.attributes';

export interface IStockMovementProps extends EntityProps {
  id: Id;
  deltaQty: DeltaQty;
  reason: Reason;
  createdById: CreatedById;
  warehouseId: WarehouseId;
  stockPerWarehouseId: StockPerWarehouseId;
  ocurredAt: OcurredAt;
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
      reason: Reason.create(props.reason),
      createdById: CreatedById.create(props.createdById || null),
      warehouseId: WarehouseId.create(props.warehouseId),
      stockPerWarehouseId: StockPerWarehouseId.create(props.stockPerWarehouseId),
      ocurredAt: OcurredAt.create(props.ocurredAt || new Date()),
    };

    const stockMovement = new StockMovement(transformedProps);

    // Apply domain event
    stockMovement.apply(new StockMovementCreatedEvent(stockMovement));

    return stockMovement;
  }

  // Getters
  public getId(): Id {
    return this.props.id;
  }

  public getDeltaQty(): DeltaQty {
    return this.props.deltaQty;
  }

  public getReason(): Reason {
    return this.props.reason;
  }

  public getCreatedById(): CreatedById {
    return this.props.createdById;
  }

  public getWarehouseId(): WarehouseId {
    return this.props.warehouseId;
  }

  public getStockPerWarehouseId(): StockPerWarehouseId {
    return this.props.stockPerWarehouseId;
  }

  public getOcurredAt(): OcurredAt {
    return this.props.ocurredAt;
  }

  // Business logic methods
  public isEntry(): boolean {
    return this.props.deltaQty.isPositive();
  }

  public isExit(): boolean {
    return this.props.deltaQty.isNegative();
  }

  public isAdjustment(): boolean {
    return this.props.deltaQty.isZero();
  }

  public getAbsoluteQuantity(): number {
    return this.props.deltaQty.getAbsoluteValue();
  }

  public wasCreatedByEmployee(): boolean {
    return this.props.createdById.hasValue();
  }

  public wasCreatedBySystem(): boolean {
    return this.props.createdById.isNull();
  }

  public isRecent(hours: number = 24): boolean {
    const now = new Date();
    const ocurredAt = this.props.ocurredAt.getValue();
    const diffInHours = (now.getTime() - ocurredAt.getTime()) / (1000 * 60 * 60);
    return diffInHours <= hours;
  }

  public isToday(): boolean {
    return this.props.ocurredAt.isToday();
  }

  public isThisWeek(): boolean {
    return this.props.ocurredAt.isThisWeek();
  }

  public isThisMonth(): boolean {
    return this.props.ocurredAt.isThisMonth();
  }

  public getTimeAgo(): string {
    return this.props.ocurredAt.getTimeAgo();
  }

  public getMovementType(): string {
    if (this.isEntry()) return 'ENTRY';
    if (this.isExit()) return 'EXIT';
    return 'ADJUSTMENT';
  }

  public getMovementDescription(): string {
    const type = this.getMovementType();
    const quantity = this.getAbsoluteQuantity();
    const reason = this.props.reason.getValue();
    
    switch (type) {
      case 'ENTRY':
        return `Entry of ${quantity} units - ${reason}`;
      case 'EXIT':
        return `Exit of ${quantity} units - ${reason}`;
      case 'ADJUSTMENT':
        return `Stock adjustment - ${reason}`;
      default:
        return reason;
    }
  }

  public isSignificant(threshold: number = 100): boolean {
    return this.getAbsoluteQuantity() >= threshold;
  }

  public isAutomatic(): boolean {
    return this.wasCreatedBySystem();
  }

  public isManual(): boolean {
    return this.wasCreatedByEmployee();
  }
} 