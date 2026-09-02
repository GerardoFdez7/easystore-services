import { Id, LongDescription } from '@shared/aggregates/value-objects';
import { z } from 'zod/v4';

const customerReviewProductSchema = z.object({
  ratingCount: z.number().min(1).max(5),
  comment: z.string(),
  customerId: z.uuid({ message: 'Id must be a valid UUID' }),
  variantId: z.uuid({ message: 'Id must be a valid UUID' }),
  tenantId: z.uuid({ message: 'Id must be a valid UUID' }),
});

export interface CustomerReviewProductProps {
  ratingCount: number;
  comment: string;
  customerId: string;
  variantId: string;
  tenantId: string;
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
  private readonly tenantId: Id;
  private readonly updatedAt: Date;

  private constructor(
    props: CustomerReviewProductProps,
    existingId?: string,
    existingUpdatedAt?: Date,
  ) {
    this.id = existingId ? Id.create(existingId) : Id.generate();
    this.ratingCount = props.ratingCount;
    this.comment = LongDescription.create(props.comment);
    this.customerId = Id.create(props.customerId);
    this.variantId = Id.create(props.variantId);
    this.tenantId = Id.create(props.tenantId);
    this.updatedAt = existingUpdatedAt || new Date();
  }

  static create(props: CustomerReviewProductProps): CustomerReviewProduct {
    customerReviewProductSchema.parse(props);
    return new CustomerReviewProduct(props);
  }

  static fromPersistence(
    props: CustomerReviewProductPropsWithId,
  ): CustomerReviewProduct {
    customerReviewProductSchema.parse({
      ratingCount: props.ratingCount,
      comment: props.comment,
      customerId: props.customerId,
      variantId: props.variantId,
      tenantId: props.tenantId,
    });
    return new CustomerReviewProduct(props, props.id, props.updatedAt);
  }

  static update(
    existingReview: CustomerReviewProduct,
    updates: Partial<
      Pick<CustomerReviewProductProps, 'ratingCount' | 'comment'>
    >,
  ): CustomerReviewProduct {
    const updatedProps: CustomerReviewProductProps = {
      ratingCount: updates.ratingCount ?? existingReview.ratingCount,
      comment: updates.comment ?? existingReview.getCommentValue(),
      customerId: existingReview.getCustomerIdValue(),
      variantId: existingReview.getVariantIdValue(),
      tenantId: existingReview.getTenantIdValue(),
    };

    customerReviewProductSchema.parse({
      ratingCount: updatedProps.ratingCount,
      comment: updatedProps.comment,
      customerId: updatedProps.customerId,
      variantId: updatedProps.variantId,
      tenantId: updatedProps.tenantId,
    });
    return new CustomerReviewProduct(
      updatedProps,
      existingReview.getIdValue(),
      new Date(), // Updated timestamp
    );
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

  public getTenantId(): Id {
    return this.tenantId;
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

  public getTenantIdValue(): string {
    return this.tenantId.getValue();
  }
}
