export interface VariantDetailsDTO {
  variantId: string;
  sku: string;
  firstAttribute: { key: string; value: string };
  productName: string;
  isArchived: boolean;
}
