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

export class CartItem {
  private readonly id: Id;
  private readonly qty: Qty;
  private readonly variantId: Id;
  private readonly promotionId?: Id | null;
  private readonly updatedAt: Date;

  private constructor(props: CartItemProps) {
    this.id = Id.generate();
    this.qty = Qty.create(props.qty);
    this.variantId = Id.create(props.variantId);
    this.promotionId = props.promotionId ? Id.create(props.promotionId) : null;
    this.updatedAt = new Date();
  }

  public static create(props: CartItemProps): CartItem {
    cartItemSchema.parse(props);
    return new CartItem(props);
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
