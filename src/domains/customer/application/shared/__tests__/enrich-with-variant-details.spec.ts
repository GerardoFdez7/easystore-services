import { enrichWithVariantDetails } from '../enrich-with-variant-details';

describe('enrichWithVariantDetails', () => {
  it('adds matching details and safe defaults for missing variants', () => {
    const result = enrichWithVariantDetails(
      [{ variantId: 'variant-1' }, { variantId: 'variant-2' }],
      [
        {
          variantId: 'variant-1',
          sku: 'SKU-1',
          productName: 'Product 1',
          firstAttribute: { key: 'Color', value: 'Blue' },
          price: '10',
          currency: 'USD',
          isArchived: false,
        },
      ],
    );

    expect(result).toEqual([
      {
        variantId: 'variant-1',
        sku: 'SKU-1',
        productName: 'Product 1',
        firstAttribute: { key: 'Color', value: 'Blue' },
        price: '10',
        currency: 'USD',
        isArchived: false,
      },
      {
        variantId: 'variant-2',
        sku: '',
        productName: '',
        firstAttribute: { key: '', value: '' },
        price: null,
        currency: null,
        isArchived: true,
      },
    ]);
  });
});
