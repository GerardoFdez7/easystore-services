import { IAuthIdentityType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Authentication entity
 * Follows the same structure as IAuthIdentityType
 */
export type AuthenticationDTO = IAuthIdentityType;

/**
 * Interface for authentication response
 */
export interface ResponseDTO {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
}
