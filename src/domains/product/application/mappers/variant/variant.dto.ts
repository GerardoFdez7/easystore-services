import { IVariantType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Variant entity
 * Follows the same structure as IVariantType
 */
export type VariantDTO = IVariantType;

/**
 * Read model for Variant: price and currency are exposed as a single Money
 * value, matching the GraphQL contract. VariantDTO stays flat for persistence.
 */
export type VariantReadDTO = Omit<VariantDTO, 'price' | 'currency'> & {
  price: { amount: string; currency: string };
};
