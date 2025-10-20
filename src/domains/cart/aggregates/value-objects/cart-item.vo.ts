import { z } from 'zod';
import { Id } from '@shared/value-objects';
import { Qty } from './qty.vo';

const cartItemSchema = z.object({
  qty: z.number().int().positive(),
  variantId: z.string().uuid(),
  promotionId: z.string().uuid().nullable().optional(),
});

export interface CartItemProps {
  qty: number;
  variantId: string;
  promotionId?: string | null;
}

export interface CartItemReconstituteProps {
  id: string;
  qty: number;
  variantId: string;
  promotionId?: string | null;
  updatedAt: Date;
}

export class CartItem {
  private readonly id: Id;
  private readonly qty: Qty;
  private readonly variantId: Id;
  private readonly promotionId?: Id | null;
  private readonly updatedAt: Date;

  private constructor(props: CartItemProps, id?: Id, updatedAt?: Date) {
    this.id = id || Id.generate();
    this.qty = Qty.create(props.qty);
    this.variantId = Id.create(props.variantId);
    this.promotionId = props.promotionId ? Id.create(props.promotionId) : null;
    this.updatedAt = updatedAt || new Date();
  }

  public static create(props: CartItemProps): CartItem {
    cartItemSchema.parse(props);
    return new CartItem(props);
  }

  /**
   * Factory method to reconstitute a CartItem from persistence or other sources.
   * Preserves original identifiers and timestamps without modification.
   * @param props The complete properties of the cart item including id and updatedAt.
   * @returns The reconstituted CartItem value object.
   */
  public static reconstitute(props: CartItemReconstituteProps): CartItem {
    const baseProps: CartItemProps = {
      qty: props.qty,
      variantId: props.variantId,
      promotionId: props.promotionId,
    };

    return new CartItem(baseProps, Id.create(props.id), props.updatedAt);
  }

  // Getter methods for mapper
  public getId(): Id {
    return this.id;
  }

  public getQty(): Qty {
    return this.qty;
  }

  public getVariantId(): Id {
    return this.variantId;
  }

  public getPromotionId(): Id | null {
    return this.promotionId || null;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getVariantIdValue(): string {
    return this.variantId.getValue();
  }

  public equals(other: CartItem): boolean {
    return this.id.equals(other.getId());
  }
}
