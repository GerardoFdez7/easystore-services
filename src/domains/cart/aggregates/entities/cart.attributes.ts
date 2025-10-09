export interface ICartBaseType {
  customerId: string;
}

export interface ICartItemBaseType {
  cartId: string;
  qty: number;
  variantId: string;
  promotionId?: string | null;
}
