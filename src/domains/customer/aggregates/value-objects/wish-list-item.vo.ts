import { Id } from '@shared/value-objects';
import { z } from 'zod';

const wishListItemSchema = z.object({
  variantId: z.string().uuid(),
  customerId: z.string().uuid(),
});

export interface WishListProps {
  variantId: string;
  customerId: string;
}

export interface WishListPropsWithId extends WishListProps {
  id: string;
  updatedAt: Date;
}

export class WishListItem {
  private readonly id: Id;
  private readonly variantId: Id;
  private readonly customerId: Id;
  private readonly updatedAt: Date;

  constructor(
    props: WishListProps,
    existingId?: string,
    existingUpdatedAt?: Date,
  ) {
    this.id = existingId ? Id.create(existingId) : Id.generate();
    this.variantId = Id.create(props.variantId);
    this.customerId = Id.create(props.customerId);
    this.updatedAt = existingUpdatedAt || new Date();
  }

  static create(props: WishListProps): WishListItem {
    wishListItemSchema.parse(props);
    return new WishListItem(props);
  }

  static fromPersistence(props: WishListPropsWithId): WishListItem {
    wishListItemSchema.parse(props);
    return new WishListItem(props, props.id, props.updatedAt);
  }

  // getValue method for mapper compatibility
  public getValue(): { id: string; variantId: string; customerId: string } {
    return {
      id: this.id.getValue(),
      variantId: this.variantId.getValue(),
      customerId: this.customerId.getValue(),
    };
  }

  // Getter methods
  public getId(): Id {
    return this.id;
  }

  public getVariantId(): Id {
    return this.variantId;
  }

  public getCustomerId(): Id {
    return this.customerId;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Convenience methods for getting string values
  public getIdValue(): string {
    return this.id.getValue();
  }

  public getVariantIdValue(): string {
    return this.variantId.getValue();
  }

  public getCustomerIdValue(): string {
    return this.customerId.getValue();
  }

  // Equals method for comparison
  public equals(other: WishListItem): boolean {
    return (
      this.id.equals(other.id) &&
      this.variantId.equals(other.variantId) &&
      this.customerId.equals(other.customerId)
    );
  }
}
