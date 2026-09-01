import { Id, LongDescription } from '..';

export type StockMovementProps = {
  id: Id;
  tenantId: Id;
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
    tenantId: string,
  ): StockMovement {
    return new StockMovement({
      id: Id.generate(),
      tenantId: Id.create(tenantId),
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

  public getTenantId(): Id {
    return this.props.tenantId;
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
    tenantId: string;
    deltaQty: number;
    reason: string;
    occurredAt: Date;
    createdById: string;
  } {
    return {
      id: this.props.id.getValue(),
      tenantId: this.props.tenantId.getValue(),
      deltaQty: this.props.deltaQty,
      reason: this.props.reason.getValue(),
      occurredAt: this.props.occurredAt,
      createdById: this.props.createdById,
    };
  }

  public equals(movement: StockMovement): boolean {
    return (
      this.props.tenantId.equals(movement.props.tenantId) &&
      this.props.deltaQty === movement.props.deltaQty &&
      this.props.reason.equals(movement.props.reason) &&
      this.props.occurredAt.getTime() === movement.props.occurredAt.getTime() &&
      this.props.createdById === movement.props.createdById
    );
  }
}
