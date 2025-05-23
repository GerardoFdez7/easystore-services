import { IWarrantyBase, IWarrantySystem } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Warranty entity
 * Follows the same structure as IWarrantyType
 */
export interface WarrantyDTO extends IWarrantyBase, IWarrantySystem {}
