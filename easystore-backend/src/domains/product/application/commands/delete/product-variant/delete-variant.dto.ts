export class DeleteVariantDTO {
  productId: string;
  identifier: string;
  identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute';
  attributeKey?: string;
}
