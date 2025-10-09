export interface ICartBaseType {
  customerId: string;
}

export interface ICartItemBaseType {
  cartId: string;
  qty: number;
  variantId: string;
  promotionId?: string | null;
}

export interface IRemoveItemFromCartData {
  cartId: string;
  variantId: string;
}
