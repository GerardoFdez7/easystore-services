import { Id, LongDescription } from '@shared/value-objects';
import { z } from 'zod';

const customerReviewProductSchema = z.object({
  ratingCount: z.number().min(1).max(5),
  comment: z.string().min(1),
  customerId: z.string().uuid(),
  variantId: z.string().uuid(),
});

export interface CustomerReviewProductProps {
  ratingCount: number;
  comment: string;
  customerId: string;
  variantId: string;
}

export interface CustomerReviewProductPropsWithId
  extends CustomerReviewProductProps {
  id: string;
  updatedAt: Date;
}

export class CustomerReviewProduct {
  private readonly id: Id;
  private readonly ratingCount: number;
  private readonly comment: LongDescription;
  private readonly customerId: Id;
  private readonly variantId: Id;
  private readonly updatedAt: Date;

  constructor(
    props: CustomerReviewProductProps,
    existingId?: string,
    existingUpdatedAt?: Date,
  ) {
    this.id = existingId ? Id.create(existingId) : Id.generate();
    this.ratingCount = props.ratingCount;
    this.comment = LongDescription.create(props.comment);
    this.customerId = Id.create(props.customerId);
    this.variantId = Id.create(props.variantId);
    this.updatedAt = existingUpdatedAt || new Date();
  }

  static create(props: CustomerReviewProductProps): CustomerReviewProduct {
    customerReviewProductSchema.parse(props);
    return new CustomerReviewProduct(props);
  }

  static fromPersistence(
    props: CustomerReviewProductPropsWithId,
  ): CustomerReviewProduct {
    customerReviewProductSchema.parse(props);
    return new CustomerReviewProduct(props, props.id, props.updatedAt);
  }

  // Getter methods
  public getId(): Id {
    return this.id;
  }

  public getRatingCount(): number {
    return this.ratingCount;
  }

  public getComment(): LongDescription {
    return this.comment;
  }

  public getCustomerId(): Id {
    return this.customerId;
  }

  public getVariantId(): Id {
    return this.variantId;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Convenience methods for getting string values
  public getIdValue(): string {
    return this.id.getValue();
  }

  public getCommentValue(): string {
    return this.comment.getValue();
  }

  public getCustomerIdValue(): string {
    return this.customerId.getValue();
  }

  public getVariantIdValue(): string {
    return this.variantId.getValue();
  }
}
