import { z } from 'zod';
import { Id } from '@shared/value-objects';
import { Qty } from './qty.vo';

const cartItemSchema = z.object({
  id: z.string().uuid(),
  qty: z.number().int().positive(),
  variantId: z.string().uuid(),
  promotionId: z.string().uuid().nullable().optional(),
});

export interface CartItemProps {
  id: string;
  qty: number;
  variantId: string;
  promotionId?: string | null;
  updatedAt?: Date;
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
}
