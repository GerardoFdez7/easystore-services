export interface IProductCategoriesBase {
  productId: string;
  categoryId: string;
  category?: { name: string };
}

export interface IProductCategoriesSystem {
  id: string;
}

export interface IProductCategoriesType
  extends IProductCategoriesBase,
    IProductCategoriesSystem {}
