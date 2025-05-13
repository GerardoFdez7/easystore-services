export class DeleteVariantDTO {
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
    public readonly attributeKey?: string,
  ) {}
}
