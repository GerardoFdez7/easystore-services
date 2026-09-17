export interface IProductCategoriesBase {
  productId: string;
  categoryId: string;
  storeId: string;
}

export interface IProductCategoriesSystem {
  id: string;
}

export interface IProductCategoriesType
  extends IProductCategoriesBase,
    IProductCategoriesSystem {}
