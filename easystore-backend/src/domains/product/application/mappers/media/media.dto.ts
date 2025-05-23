import { IMediaBase, IMediaSystem } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Media entity
 * Follows the same structure as IMediaType
 */
export interface MediaDTO extends IMediaBase, IMediaSystem {}
