export interface IProductCategoriesBase {
  productId: string;
  categoryId: string;
  tenantId: string;
}

export interface IProductCategoriesSystem {
  id: string;
}

export interface IProductCategoriesType
  extends IProductCategoriesBase,
    IProductCategoriesSystem {}
