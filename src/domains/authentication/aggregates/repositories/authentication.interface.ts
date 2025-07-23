import { AuthIdentity } from '../entities';
import { Id, Email, AccountType } from '../value-objects';

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
   */
  create(authIdentity: AuthIdentity): Promise<AuthIdentity>;

  /**
   * Updates an existing authIdentity in the repository.
   * @param id - The unique identifier of the authIdentity to update
   * @param updates - Partial authIdentity data containing fields to update
   * @returns Promise that resolves to the updated AuthIdentity entity
   * @throws {Error} When authIdentity is not found or update fails
   */
  update(id: Id, updates: AuthIdentity): Promise<AuthIdentity>;

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
   * Finds an authIdentity by ID.
   * @param id - The unique identifier to search for
   * @returns Promise that resolves to the found AuthIdentity entity or null
   * @throws {Error} When authIdentity is not found
   */
  findById(id: Id): Promise<AuthIdentity | null>;
}
