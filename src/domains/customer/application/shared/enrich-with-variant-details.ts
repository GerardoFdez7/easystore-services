import { VariantDetailsDTO } from '@shared/dtos';

type VariantEnriched<T> = T & Omit<VariantDetailsDTO, 'variantId'>;

/** Adds product-owned variant details to customer application DTOs. */
export function enrichWithVariantDetails<T extends { variantId: string }>(
  items: T[],
  variantDetails: VariantDetailsDTO[],
): VariantEnriched<T>[] {
  const variantDetailsMap = new Map(
    variantDetails.map((variant) => [variant.variantId, variant]),
  );

  return items.map((item) => {
    const variant = variantDetailsMap.get(item.variantId);

    return {
      ...item,
      sku: variant?.sku ?? '',
      productName: variant?.productName ?? '',
      firstAttribute: variant?.firstAttribute ?? { key: '', value: '' },
      price: variant?.price ?? 0,
      isArchived: variant?.isArchived ?? false,
    };
  });
}
