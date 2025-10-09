export interface ICartBaseType {
  customerId: string;
}

export interface ICartItemBaseType {
  cartId: string;
  variantId: string;
  promotionId?: string | null;
}

export interface IRemoveItemFromCartData {
  cartId: string;
  variantId: string;
}
