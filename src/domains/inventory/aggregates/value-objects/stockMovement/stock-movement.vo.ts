import { LongDescription } from '..';

export type StockMovementProps = {
  deltaQty: number;
  reason: LongDescription;
  occurredAt: Date;
  createdById: string;
};

export class StockMovement {
  private readonly props: StockMovementProps;

  private constructor(props: StockMovementProps) {
    this.props = props;
  }

  public static create(
    deltaQty: number,
    reason: string,
    createdById: string,
    occurredAt?: Date,
  ): StockMovement {
    return new StockMovement({
      deltaQty,
      reason: LongDescription.create(reason),
      occurredAt: occurredAt || new Date(),
      createdById,
    });
  }

  public getDeltaQty(): number {
    return this.props.deltaQty;
  }

  public getReason(): string {
    return this.props.reason.getValue();
  }

  public getOccurredAt(): Date {
    return this.props.occurredAt;
  }

  public getCreatedById(): string {
    return this.props.createdById;
  }

  public getMovement(): {
    deltaQty: number;
    reason: string;
    occurredAt: Date;
    createdById: string;
  } {
    return {
      deltaQty: this.props.deltaQty,
      reason: this.props.reason.getValue(),
      occurredAt: this.props.occurredAt,
      createdById: this.props.createdById,
    };
  }

  public equals(movement: StockMovement): boolean {
    return (
      this.props.deltaQty === movement.props.deltaQty &&
      this.props.reason.equals(movement.props.reason) &&
      this.props.occurredAt.getTime() === movement.props.occurredAt.getTime() &&
      this.props.createdById === movement.props.createdById
    );
  }
}
