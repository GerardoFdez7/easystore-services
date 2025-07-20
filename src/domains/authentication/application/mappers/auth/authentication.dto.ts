import { IAuthIdentityType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Authentication entity
 * Follows the same structure as IAuthIdentityType
 */
export type AuthenticationDTO = IAuthIdentityType;

/**
 * Interface for authentication login response
 */
export interface LoginResponseDTO {
  refreshToken: string;
  accessToken: string;
  userId: string;
}

/**
 * Interface for authentication logout response
 */
export interface LogoutResponseDTO {
  success: boolean;
}
