export interface ICartBaseType {
  customerId: string;
}

export interface ICartItemBaseType {
  variantId: string;
  promotionId?: string | null;
}

export interface IRemoveItemFromCartData {
  variantId: string;
}

export interface IUpdateItemQuantityData {
  variantId: string;
  quantity: number;
}
