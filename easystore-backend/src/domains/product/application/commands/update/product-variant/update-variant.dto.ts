export class UpdateVariantDTO {
  productId: string;
  identifier: string;
  identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute';
  attributeKey?: string;
  variant: {
    attributes: Array<{ key: string; value: string }>;
    stockPerWarehouse: Array<{
      warehouseId: string;
      qtyAvailable: number;
      qtyReserved: number;
      productLocation: string | null;
      estimatedReplenishmentDate: Date | null;
      lotNumber: string | null;
      serialNumbers: string[];
    }>;
    price: number;
    currency: string;
    variantMedia?: string[];
    personalizationOptions?: string[];
    weight?: number;
    dimensions?: { height: number; width: number; depth: number };
    condition: string;
    sku?: string;
    upc?: string;
    ean?: string;
    isbn?: string;
    barcode?: string;
  };
}
