import {
  ISustainabilityBase,
  ISustainabilitySystem,
} from '../../../aggregates/entities';

/**
 * Data Transfer Object for Sustainability entity
 * Follows the same structure as ISustainabilityType
 */
export interface SustainabilityDTO
  extends ISustainabilityBase,
    ISustainabilitySystem {}
