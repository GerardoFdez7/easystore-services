import { Id, LongDescription } from '..';

export type StockMovementProps = {
  id: Id;
  storeId: Id;
  deltaQty: number;
  reason: LongDescription;
  occurredAt: Date;
  createdById: string;
};

export class StockMovement {
  private readonly props: StockMovementProps;
  private variantId: string;

  private constructor(props: StockMovementProps) {
    this.props = props;
  }

  public static create(
    deltaQty: number,
    reason: string,
    createdById: string,
    occurredAt: Date,
    storeId: string,
  ): StockMovement {
    return new StockMovement({
      id: Id.generate(),
      storeId: Id.create(storeId),
      deltaQty,
      reason: LongDescription.create(reason),
      occurredAt: occurredAt || new Date(),
      createdById,
    });
  }

  public getDeltaQty(): number {
    return this.props.deltaQty;
  }

  public getReason(): LongDescription {
    return this.props.reason;
  }

  public getOccurredAt(): Date {
    return this.props.occurredAt;
  }

  public getId(): Id {
    return this.props.id;
  }

  public getStoreId(): Id {
    return this.props.storeId;
  }

  public getCreatedById(): string {
    return this.props.createdById;
  }

  public getVariantId(): string {
    return this.variantId;
  }

  public setVariantId(variantId: string): void {
    this.variantId = variantId;
  }

  public getMovement(): {
    id: string;
    storeId: string;
    deltaQty: number;
    reason: string;
    occurredAt: Date;
    createdById: string;
  } {
    return {
      id: this.props.id.getValue(),
      storeId: this.props.storeId.getValue(),
      deltaQty: this.props.deltaQty,
      reason: this.props.reason.getValue(),
      occurredAt: this.props.occurredAt,
      createdById: this.props.createdById,
    };
  }

  public equals(movement: StockMovement): boolean {
    return (
      this.props.storeId.equals(movement.props.storeId) &&
      this.props.deltaQty === movement.props.deltaQty &&
      this.props.reason.equals(movement.props.reason) &&
      this.props.occurredAt.getTime() === movement.props.occurredAt.getTime() &&
      this.props.createdById === movement.props.createdById
    );
  }
}
