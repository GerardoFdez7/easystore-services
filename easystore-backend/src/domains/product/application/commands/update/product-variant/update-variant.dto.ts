import { VariantDTO } from '../../../mappers/product.dto';

export class UpdateVariantDTO {
  constructor(
    public readonly productId: string,
    public readonly identifier: string,
    public readonly identifierType:
      | 'sku'
      | 'upc'
      | 'ean'
      | 'isbn'
      | 'barcode'
      | 'attribute',
    public readonly variant: VariantDTO,
    public readonly attributeKey?: string,
  ) {}
}
