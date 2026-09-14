interface VariantWithMoneyInput {
  price: { amount: string; currency: string };
}

type VariantWithFlatPrice<T> = Omit<T, 'price'> & {
  price: string;
  currency: string;
};

/** Flattens a nested { amount, currency } price field into the flat price/currency shape domain commands expect. */
export function flattenVariantPrice<T extends VariantWithMoneyInput>(
  variant: T,
): VariantWithFlatPrice<T> {
  const { price, ...rest } = variant;
  return {
    ...rest,
    price: price.amount,
    currency: price.currency,
  } as VariantWithFlatPrice<T>;
}
