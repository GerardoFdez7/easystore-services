import { Id } from '@domains/value-objects';
import { Address } from '../entities';

export default interface IAddressRepository {
  /**
   * Creates a new address in the repository.
   * @param address - The address entity to be created.
   * @returns A promise that resolves to the created address entity.
   * @throws {Error} When address creation fails.
   */
  create(address: Address): Promise<Address>;

  /**
   * Finds a address by its unique identifier.
   * @param id - The unique identifier of the address
   * @returns Promise that resolves to the Address entity if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id): Promise<Address | null>;

  delete(id: Id): Promise<void>;
}
