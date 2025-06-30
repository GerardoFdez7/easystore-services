import { Id } from '../value-objects';
import { Address } from '../entities';

type Owner = { tenantId: Id } | { customerId: Id };
export default interface IAddressRepository {
  /**
   * Creates a new address in the repository.
   * @param address - The address entity to be created.
   * @returns A promise that resolves to the created address entity.
   * @throws {Error} When address creation fails.
   */
  create(address: Address): Promise<Address>;

  update(id: Id, updates: Address): Promise<Address>;

  delete(id: Id, owner: Owner): Promise<void>;

  /**
   * Finds a address by its unique identifier.
   * @param id - The unique identifier of the address
   * @returns Promise that resolves to the Address entity if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id): Promise<Address | null>;

  // findAll(tenatId: Id, customer: Id): Promise<Address[]>;
}
