export interface ICartBaseType {
  customerId: string;
  tenantId: string;
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

export interface RemoveManyItemsFromCartData {
  variantIds: string[];
}
