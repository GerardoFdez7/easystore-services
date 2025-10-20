import { Id } from '@shared/value-objects';
import { Cart } from '../entities/cart.entity';

/**
 * Repository interface for Cart domain operations.
 * Provides methods for CUD operations and querying carts.
 */
export interface ICartRepository {
  /**
   * Creates a new cart in the repository.
   * @param cart - The cart entity to create
   * @returns Promise that resolves to the created Cart entity
   * @throws {Error} When cart creation fails
   */
  create(cart: Cart): Promise<Cart>;

  /**
   * Updates an existing cart in the repository.
   * @param cart - The cart entity with updated data
   * @returns Promise that resolves to the updated Cart entity
   * @throws {Error} When cart is not found or update fails
   */
  update(cart: Cart): Promise<Cart>;

  /**
   * Finds a cart by its customer's unique identifier with pagination support.
   * @param id - The unique identifier of the customer
   * @param page - Page number for pagination (starts from 1)
   * @param limit - Number of items per page
   * @returns Promise that resolves to the Cart entity if found
   * @throws {Error} When cart is not found or repository operation fails
   */
  findCartByCustomerId(id: Id, page?: number, limit?: number): Promise<Cart>;

  /**
   * Gets the total count of cart items for a customer.
   * @param id - The unique identifier of the customer
   * @returns Promise that resolves to the total count of cart items
   * @throws {Error} When cart is not found or repository operation fails
   */
  getCartItemsCount(id: Id): Promise<number>;
}
