import { AuthIdentity } from '../entities/auth/authentication.entity';
import { Email } from '../value-objects';
import { AccountType } from '.prisma/postgres';

/**
 * Interface for the authentication repository.
 * Defines the contract for data operations related to AuthIdentity.
 */
export interface IAuthRepository {
  /**
   * Saves an authentication entity (create or update).
   * @param authIdentity The AuthIdentity entity to save.
   * @returns The saved AuthIdentity entity.
   */
  save(authIdentity: AuthIdentity): Promise<AuthIdentity>;

  /**
   * Finds a user by their email.
   * @param email The email of the user.
   * @returns The AuthIdentity entity or null if not found.
   */
  findByEmail(email: Email): Promise<AuthIdentity | null>;

  /**
   * Validates the user's credentials.
   * @param email The provided email.
   * @param password The provided password.
   * @returns True if credentials are valid, otherwise false.
   */
  validateCredentials(email: Email, password: string): Promise<boolean>;

  /**
   * Logs in a user by validating credentials and generating tokens.
   * @param email The user's email.
   * @param password The user's password.
   * @param accountType The type of account (e.g., 'admin', 'user').
   * @returns An object containing access and refresh tokens.
   */
  login(
    email: Email,
    password: string,
    accountType: AccountType,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
