import { IVariantType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Variant entity
 * Follows the same structure as IVariantType
 */
export type VariantDTO = IVariantType;

/**
 * Read model for Variant: the price is exposed as a Money value in the currency of the
 * variant's product, matching the GraphQL contract. VariantDTO keeps the plain amount.
 */
export type VariantReadDTO = Omit<VariantDTO, 'price'> & {
  price: { amount: string; currency: string };
};
