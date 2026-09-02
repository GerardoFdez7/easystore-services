import { Id } from '@shared/aggregates/value-objects';
import { z } from 'zod/v4';

const wishListItemSchema = z.object({
  variantId: z.uuid({ message: 'Id must be a valid UUID' }),
  customerId: z.uuid({ message: 'Id must be a valid UUID' }),
  tenantId: z.uuid({ message: 'Id must be a valid UUID' }),
});

const wishListItemWithIdSchema = wishListItemSchema.extend({
  id: z.uuid(),
  updatedAt: z.coerce.date(),
});

export interface WishListProps {
  variantId: string;
  customerId: string;
  tenantId: string;
}

export interface WishListPropsWithId extends WishListProps {
  id: string;
  updatedAt: Date;
}

export class WishListItem {
  private readonly id: Id;
  private readonly variantId: Id;
  private readonly customerId: Id;
  private readonly tenantId: Id;
  private readonly updatedAt: Date;

  private constructor(
    props: WishListProps,
    existingId?: string,
    existingUpdatedAt?: Date,
  ) {
    this.id = existingId ? Id.create(existingId) : Id.generate();
    this.variantId = Id.create(props.variantId);
    this.customerId = Id.create(props.customerId);
    this.tenantId = Id.create(props.tenantId);
    this.updatedAt = existingUpdatedAt || new Date();
  }

  static create(props: WishListProps): WishListItem {
    wishListItemSchema.parse(props);
    return new WishListItem(props);
  }

  static fromPersistence(props: WishListPropsWithId): WishListItem {
    wishListItemWithIdSchema.parse(props);
    return new WishListItem(props, props.id, props.updatedAt);
  }

  // getValue method for mapper compatibility
  public getValue(): {
    id: string;
    variantId: string;
    customerId: string;
    tenantId: string;
  } {
    return {
      id: this.id.getValue(),
      variantId: this.variantId.getValue(),
      customerId: this.customerId.getValue(),
      tenantId: this.tenantId.getValue(),
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

  public getVariantIdValue(): string {
    return this.variantId.getValue();
  }

  public getCustomerIdValue(): string {
    return this.customerId.getValue();
  }

  public getTenantIdValue(): string {
    return this.tenantId.getValue();
  }

  // Equals method for comparison
  public equals(other: WishListItem): boolean {
    return (
      this.id.equals(other.id) &&
      this.variantId.equals(other.variantId) &&
      this.customerId.equals(other.customerId) &&
      this.tenantId.equals(other.tenantId) &&
      this.updatedAt.getTime() === other.updatedAt.getTime()
    );
  }
}
