import { VariantDTO } from '../../../mappers/product.dto';

export class UpdateVariantDTO {
  productId: string;
  identifier: string;
  identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute';
  attributeKey?: string;
  variant: VariantDTO;
}
