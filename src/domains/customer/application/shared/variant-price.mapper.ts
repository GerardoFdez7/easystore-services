type WithFlatPrice = { price: string | null; currency: string | null };
type WithMoneyPrice<T> = Omit<T, 'price' | 'currency'> & {
  price: { amount: string; currency: string } | null;
};

/** Nests flat price/currency fields into a { amount, currency } money shape. */
export function nestVariantPrice<T extends WithFlatPrice>(
  item: T,
): WithMoneyPrice<T> {
  const { price, currency, ...rest } = item;
  return {
    ...rest,
    price:
      price !== null && currency !== null ? { amount: price, currency } : null,
  } as WithMoneyPrice<T>;
}
