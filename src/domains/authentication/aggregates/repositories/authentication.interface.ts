import { AuthIdentity } from '../entities';
import { Email, AccountType } from '../value-objects';

/**
 * Interface for the authentication repository.
 * Defines the contract for data operations related to AuthIdentity.
 */
export interface IAuthRepository {
  /**
   * Creates a new authIdentity in the repository.
   * @param authIdentity - The base authIdentity data to create
   * @returns Promise that resolves to the created AuthIdentity entity
   * @throws {Error} When authIdentity creation fails
   
  create(authIdentity: AuthIdentity): Promise<AuthIdentity>;
  */

  /**
   * Updates an existing authIdentity in the repository.
   * @param id - The unique identifier of the authIdentity to update
   * @param updates - Partial authIdentity data containing fields to update
   * @returns Promise that resolves to the updated AuthIdentity entity
   * @throws {Error} When authIdentity is not found or update fails
   
  update(id: Id, updates: AuthIdentity): Promise<AuthIdentity>;
  */

  /**
   * Saves an authentication entity (create or update).
   * @param authIdentity The AuthIdentity entity to save.
   * @returns The saved AuthIdentity entity.
   */
  save(authIdentity: AuthIdentity): Promise<AuthIdentity>;

  /**
   * Validates the user's credentials.
   * @param email The provided email.
   * @param password The provided password.
   * @returns True if credentials are valid, otherwise false.
   * @throws {Error} When authIdentity is not found or update fails
   */
  validateCredentials(email: Email, password: string): Promise<boolean>;

  /**
   * Finds an authIdentity by email.
   * @param email - The email to search for
   * @returns Promise that resolves to the found AuthIdentity entity or null
   * @throws {Error} When authIdentity is not found or update fails
   */
  findByEmail(email: Email): Promise<AuthIdentity | null>;

  /**
   * Finds an authIdentity by email and accountType.
   * @param email - The email to search for
   * @param accountType - The accountType to search for
   * @returns Promise that resolves to the found AuthIdentity entity or null
   * @throws {Error} When authIdentity is not found or update fails
   */
  findByEmailAndAccountType(
    email: Email,
    accountType: AccountType,
  ): Promise<AuthIdentity | null>;

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
