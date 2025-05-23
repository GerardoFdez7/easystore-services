import { IVariantBase, IVariantSystem } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Variant entity
 * Follows the same structure as IVariantType
 */
export interface VariantDTO extends IVariantBase, IVariantSystem {}
