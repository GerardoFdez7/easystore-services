export interface IProductCategoriesBase {
  productId: number;
  categoryId: number;
}

export interface IProductCategoriesSystem {
  id: number;
}

export interface IProductCategoriesType
  extends IProductCategoriesBase,
    IProductCategoriesSystem {}
