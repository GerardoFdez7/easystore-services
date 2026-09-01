/**
 * Data Transfer Object for Cart entity
 * Used for API responses when creating or retrieving carts
 */
export interface CartDTO {
  id: string;
  customerId: string;
  tenantId: string;
  cartItems: CartItemDTO[];
  totalCart: number | import('@shared/value-objects').IMoney;
}

/**
 * Data Transfer Object for CartItem value object
 * Used within CartDTO to represent cart items
 */
export interface CartItemDTO {
  id: string;
  qty: number;
  variantId: string;
  firstAttribute: { key: string; value: string };
  promotionId?: string | null;
  updatedAt: Date;
  unitPrice: number;
  productName: string;
  subTotal: number;
}
