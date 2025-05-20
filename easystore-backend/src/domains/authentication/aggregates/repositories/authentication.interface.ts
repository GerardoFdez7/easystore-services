import { AuthIdentity } from '../entities/authentication.entity';
import { Email } from '../value-objects';

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
}
