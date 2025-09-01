import { Id, AddressType } from '../value-objects';
import { Address } from '../entities';
import { AddressDetailsDTO } from '@domains/dtos';

export type Owner = { tenantId: Id } | { customerId: Id };
export interface IAddressRepository {
  /**
   * Creates a new address in the repository.
   * @param address - The address entity to be created.
   * @returns A promise that resolves to the created address entity.
   * @throws {Error} When address creation fails.
   */
  create(address: Address): Promise<Address>;

  /**
   * Updates an existing address in the repository.
   * @param id - The unique identifier of the address to update.
   * @param owner - The owner object, containing either tenantId or customerId.
   * @param updates - The address entity with updated data.
   * @returns A promise that resolves to the updated address entity.
   * @throws {Error} When the address does not exist or the update fails.
   */
  update(id: Id, owner: Owner, updates: Address): Promise<Address>;

  /**
   * Deletes an address from the repository.
   * @param id - The unique identifier of the address to delete.
   * @param owner - The owner object, containing either tenantId or customerId.
   * @returns A promise that resolves when the address is deleted.
   * @throws {Error} When the address does not exist or the deletion fails.
   */
  delete(id: Id, owner: Owner): Promise<void>;

  /**
   * Finds a address by its unique identifier.
   * @param id - The unique identifier of the address
   * @returns Promise that resolves to the Address entity if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id, owner: Owner): Promise<Address | null>;

  /**
   * Finds all addresses for a given owner and address type
   * @param owner - The owner(tenant or customer) of the addresses
   * @param addressType - The type of address to find (BILLING, SHIPPING, WAREHOUSE)
   * @returns The found addresses
   */
  findAll(
    owner: Owner,
    options?: { addressType?: AddressType },
  ): Promise<Address[]>;

  /**
   * Finds address details by their unique identifiers.
   * @param ids - Array of unique identifiers of the addresses
   * @returns Promise that resolves to an array of AddressDetailsDTO
   * @throws {Error} When repository operation fails
   */
  findDetailsByIds(ids: Id[]): Promise<AddressDetailsDTO[]>;
}
