/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { RemoveManyItemsFromCartHandler } from '../remove-many-items-from-cart.handler';
import { RemoveManyItemsFromCartDto } from '../remove-many-items-from-cart.dto';
import { ICartRepository } from '../../../../../aggregates/repositories/cart.interface';
import { CartMapper, CartDTO } from '../../../../mappers';
import { Cart } from '../../../../../aggregates/entities/cart.entity';
import { Id } from '../../../../../aggregates/value-objects';

interface MockCart {
  commit: jest.Mock;
  apply: jest.Mock;
  getId: jest.Mock;
  getCustomerId: jest.Mock;
  getCartItems: jest.Mock;
}

describe('RemoveManyItemsFromCartHandler', () => {
  let handler: RemoveManyItemsFromCartHandler;
  let cartRepository: jest.Mocked<ICartRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCart: MockCart;

  let findCartByCustomerIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let cartRemoveManyItemsMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    findCartByCustomerIdMock = jest.fn();
    updateMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    cartRepository = {
      create: jest.fn(),
      findCartByCustomerId: findCartByCustomerIdMock,
      update: updateMock,
      getCartItemsCount: jest.fn(),
    } as unknown as jest.Mocked<ICartRepository>;

    mockCart = {
      commit: jest.fn(),
      apply: jest.fn(),
      getId: jest.fn().mockReturnValue({ getValue: () => 'cart-id-123' }),
      getCustomerId: jest
        .fn()
        .mockReturnValue({ getValue: () => 'customer-id-456' }),
      getCartItems: jest.fn().mockReturnValue(new Map()),
    };

    mergeObjectContextMock.mockReturnValue(mockCart);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    cartRemoveManyItemsMock = jest
      .spyOn(Cart, 'removeManyItems')
      .mockReturnValue(mockCart as unknown as Cart);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    toDtoMock = jest.spyOn(CartMapper, 'toDto').mockReturnValue({
      id: 'cart-id-123',
      customerId: 'customer-id-456',
      cartItems: [],
    } as CartDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveManyItemsFromCartHandler,
        {
          provide: 'ICartRepository',
          useValue: cartRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<RemoveManyItemsFromCartHandler>(
      RemoveManyItemsFromCartHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseItemsData = {
      variantIds: ['variant-123', 'variant-456', 'variant-789'],
    };

    const baseCommand: RemoveManyItemsFromCartDto =
      new RemoveManyItemsFromCartDto(baseItemsData, 'customer-789');

    describe('Cart retrieval and validation', () => {
      it('should find cart by customer ID', async () => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(baseCommand);

        expect(findCartByCustomerIdMock).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );
      });

      it('should throw NotFoundException when cart is not found', async () => {
        findCartByCustomerIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
        expect(findCartByCustomerIdMock).toHaveBeenCalledTimes(1);
      });

      it('should throw NotFoundException with correct message', async () => {
        findCartByCustomerIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Cart not found',
        );
      });

      it('should create Id object for customerId', async () => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-789');
      });

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['variant-111', 'variant-222'] },
          'valid-customer-999',
        );
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(validCommand);

        expect(idCreateMock).toHaveBeenCalledWith('valid-customer-999');
        expect(findCartByCustomerIdMock).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );
      });
    });

    describe('Variant IDs processing', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should map variant IDs to Id objects', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('variant-123');
        expect(idCreateMock).toHaveBeenCalledWith('variant-456');
        expect(idCreateMock).toHaveBeenCalledWith('variant-789');
        expect(idCreateMock).toHaveBeenCalledTimes(4); // 3 variants + 1 customer
      });

      it('should handle single variant ID', async () => {
        const singleVariantCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['single-variant-123'] },
          'customer-456',
        );

        await handler.execute(singleVariantCommand);

        expect(idCreateMock).toHaveBeenCalledWith('single-variant-123');
        expect(idCreateMock).toHaveBeenCalledWith('customer-456');
        expect(idCreateMock).toHaveBeenCalledTimes(2);
      });

      it('should handle multiple variant IDs correctly', async () => {
        const multipleVariantsCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['var-1', 'var-2', 'var-3', 'var-4', 'var-5'] },
          'customer-multi',
        );

        await handler.execute(multipleVariantsCommand);

        expect(idCreateMock).toHaveBeenCalledWith('var-1');
        expect(idCreateMock).toHaveBeenCalledWith('var-2');
        expect(idCreateMock).toHaveBeenCalledWith('var-3');
        expect(idCreateMock).toHaveBeenCalledWith('var-4');
        expect(idCreateMock).toHaveBeenCalledWith('var-5');
        expect(idCreateMock).toHaveBeenCalledWith('customer-multi');
        expect(idCreateMock).toHaveBeenCalledTimes(6);
      });

      it('should handle empty variant IDs array', async () => {
        const emptyVariantsCommand = new RemoveManyItemsFromCartDto(
          { variantIds: [] },
          'customer-empty',
        );

        await handler.execute(emptyVariantsCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-empty');
        expect(idCreateMock).toHaveBeenCalledTimes(1); // Only customer ID
      });
    });

    describe('Items removal processing', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should call Cart.removeManyItems with correct parameters', async () => {
        const mockVariantIds = [
          { getValue: () => 'variant-123' } as Id,
          { getValue: () => 'variant-456' } as Id,
          { getValue: () => 'variant-789' } as Id,
        ];

        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-789' } as Id)
          .mockReturnValueOnce(mockVariantIds[0])
          .mockReturnValueOnce(mockVariantIds[1])
          .mockReturnValueOnce(mockVariantIds[2]);

        await handler.execute(baseCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantIds,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle removal of different variant combinations', async () => {
        const differentVariantsCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['diff-variant-1', 'diff-variant-2'] },
          'customer-456',
        );

        const mockVariantIds = [
          { getValue: () => 'diff-variant-1' } as Id,
          { getValue: () => 'diff-variant-2' } as Id,
        ];

        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-456' } as Id)
          .mockReturnValueOnce(mockVariantIds[0])
          .mockReturnValueOnce(mockVariantIds[1]);

        await handler.execute(differentVariantsCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantIds,
        );
      });

      it('should handle removal from cart with existing items', async () => {
        const cartWithItems = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(
            new Map([
              ['variant-123', { id: 'item-1', variantId: 'variant-123' }],
              ['variant-456', { id: 'item-2', variantId: 'variant-456' }],
              ['variant-789', { id: 'item-3', variantId: 'variant-789' }],
            ]),
          ),
        };
        findCartByCustomerIdMock.mockResolvedValue(cartWithItems);

        await handler.execute(baseCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should update the cart in repository', async () => {
        await handler.execute(baseCommand);

        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should update after removing items and before committing events', async () => {
        await handler.execute(baseCommand);

        const removeManyItemsOrder =
          cartRemoveManyItemsMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];

        expect(removeManyItemsOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(updateOrder);
        expect(updateOrder).toBeLessThan(commitOrder);
      });

      it('should handle repository update successfully', async () => {
        const updatedCart = { ...mockCart, id: 'updated-cart-id' };
        updateMock.mockResolvedValue(updatedCart);

        await handler.execute(baseCommand);

        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(updatedCart);
      });

      it('should propagate repository update errors', async () => {
        const repositoryError = new Error('Database update failed');
        updateMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should commit events after updating', async () => {
        await handler.execute(baseCommand);

        expect(mockCart.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after all operations', async () => {
        await handler.execute(baseCommand);

        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];
        expect(updateOrder).toBeLessThan(commitOrder);
      });

      it('should apply domain events during items removal', async () => {
        await handler.execute(baseCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should convert cart to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockCart);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: CartDTO = {
          id: 'cart-id-123',
          customerId: 'customer-id-456',
          cartItems: [],
          totalCart: 0,
        } as CartDTO;
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });

      it('should return DTO with correct structure', async () => {
        const result = await handler.execute(baseCommand);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('customerId');
        expect(result).toHaveProperty('cartItems');
        expect(result.customerId).toBe('customer-id-456');
      });

      it('should return updated cart after items removal', async () => {
        const cartAfterRemoval: CartDTO = {
          id: 'cart-id-123',
          customerId: 'customer-id-456',
          cartItems: [
            {
              id: 'remaining-item',
              variantId: 'variant-remaining',
              qty: 1,
            },
          ],
          totalCart: 25,
        } as CartDTO;
        toDtoMock.mockReturnValue(cartAfterRemoval);

        const result = await handler.execute(baseCommand);

        expect(result).toEqual(cartAfterRemoval);
        expect(result.cartItems).toHaveLength(1);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle Cart.removeManyItems errors', async () => {
        const removeManyItemsError = new Error(
          'Failed to remove items from cart',
        );
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        cartRemoveManyItemsMock.mockImplementation(() => {
          throw removeManyItemsError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          removeManyItemsError,
        );
      });

      it('should handle Id.create errors for variant IDs', async () => {
        const idCreationError = new Error('Invalid variant ID format');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-789' } as Id)
          .mockImplementationOnce(() => {
            throw idCreationError;
          });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          idCreationError,
        );
      });

      it('should handle Id.create errors for customerId', async () => {
        const idCreationError = new Error('Invalid customer ID format');
        idCreateMock.mockImplementationOnce(() => {
          throw idCreationError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          idCreationError,
        );
      });

      it('should handle mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });

      it('should handle repository find errors', async () => {
        const findError = new Error('Database find failed');
        findCartByCustomerIdMock.mockRejectedValue(findError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(findError);
      });

      it('should handle non-existent variant IDs removal gracefully', async () => {
        const nonExistentVariantsCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['non-existent-1', 'non-existent-2'] },
          'customer-789',
        );

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        // This should not throw an error, as the domain logic handles it
        const result = await handler.execute(nonExistentVariantsCommand);

        expect(result).toBeDefined();
        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
      });

      it('should handle mixed existing and non-existent variant IDs', async () => {
        const mixedVariantsCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['existing-variant', 'non-existent-variant'] },
          'customer-789',
        );

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        const result = await handler.execute(mixedVariantsCommand);

        expect(result).toBeDefined();
        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should remove multiple specific items by variant IDs', async () => {
        const specificVariantsCommand = new RemoveManyItemsFromCartDto(
          {
            variantIds: [
              'specific-variant-1',
              'specific-variant-2',
              'specific-variant-3',
            ],
          },
          'customer-456',
        );

        const mockVariantIds = [
          { getValue: () => 'specific-variant-1' } as Id,
          { getValue: () => 'specific-variant-2' } as Id,
          { getValue: () => 'specific-variant-3' } as Id,
        ];

        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-456' } as Id)
          .mockReturnValueOnce(mockVariantIds[0])
          .mockReturnValueOnce(mockVariantIds[1])
          .mockReturnValueOnce(mockVariantIds[2]);

        await handler.execute(specificVariantsCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantIds,
        );
      });

      it('should handle removal from cart with many items', async () => {
        const cartWithManyItems = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(
            new Map([
              ['variant-1', { id: 'item-1', variantId: 'variant-1', qty: 2 }],
              ['variant-2', { id: 'item-2', variantId: 'variant-2', qty: 1 }],
              ['variant-3', { id: 'item-3', variantId: 'variant-3', qty: 3 }],
              ['variant-4', { id: 'item-4', variantId: 'variant-4', qty: 1 }],
              ['variant-5', { id: 'item-5', variantId: 'variant-5', qty: 2 }],
            ]),
          ),
        };
        findCartByCustomerIdMock.mockResolvedValue(cartWithManyItems);

        const removeCommand = new RemoveManyItemsFromCartDto(
          { variantIds: ['variant-2', 'variant-4'] },
          'customer-789',
        );

        await handler.execute(removeCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle removal from empty cart', async () => {
        const emptyCart = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(new Map()),
        };
        findCartByCustomerIdMock.mockResolvedValue(emptyCart);

        await handler.execute(baseCommand);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle bulk removal operations', async () => {
        const bulkRemovalCommand = new RemoveManyItemsFromCartDto(
          {
            variantIds: Array.from(
              { length: 10 },
              (_, i) => `bulk-variant-${i + 1}`,
            ),
          },
          'customer-bulk',
        );

        await handler.execute(bulkRemovalCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(11); // 10 variants + 1 customer
        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle concurrent removal requests', async () => {
        const command1 = new RemoveManyItemsFromCartDto(
          { variantIds: ['variant-1', 'variant-2'] },
          'customer-1',
        );
        const command2 = new RemoveManyItemsFromCartDto(
          { variantIds: ['variant-3', 'variant-4'] },
          'customer-1',
        );

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(2);
        expect(updateMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete remove many items from cart flow', async () => {
        const completeCommand = new RemoveManyItemsFromCartDto(
          {
            variantIds: [
              'complete-variant-1',
              'complete-variant-2',
              'complete-variant-3',
            ],
          },
          'complete-customer-789',
        );

        const expectedDto: CartDTO = {
          id: 'complete-cart-id',
          customerId: 'complete-customer-789',
          cartItems: [],
          totalCart: 0,
        } as CartDTO;

        const mockCustomerId = {
          getValue: () => 'complete-customer-789',
        } as Id;
        const mockVariantIds = [
          { getValue: () => 'complete-variant-1' } as Id,
          { getValue: () => 'complete-variant-2' } as Id,
          { getValue: () => 'complete-variant-3' } as Id,
        ];

        idCreateMock
          .mockReturnValueOnce(mockCustomerId)
          .mockReturnValueOnce(mockVariantIds[0])
          .mockReturnValueOnce(mockVariantIds[1])
          .mockReturnValueOnce(mockVariantIds[2]);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(4);
        expect(findCartByCustomerIdMock).toHaveBeenCalledTimes(1);
        expect(cartRemoveManyItemsMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const variantIds = ['consistency-variant-1', 'consistency-variant-2'];
        const customerId = 'consistency-customer';
        const command = new RemoveManyItemsFromCartDto(
          { variantIds },
          customerId,
        );

        const mockCustomerId = { getValue: () => customerId } as Id;
        const mockVariantIds = variantIds.map(
          (id) => ({ getValue: () => id }) as Id,
        );

        idCreateMock
          .mockReturnValueOnce(mockCustomerId)
          .mockReturnValueOnce(mockVariantIds[0])
          .mockReturnValueOnce(mockVariantIds[1]);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(command);

        // Verify that the same data flows through all operations
        expect(idCreateMock).toHaveBeenCalledWith(customerId);
        expect(idCreateMock).toHaveBeenCalledWith(variantIds[0]);
        expect(idCreateMock).toHaveBeenCalledWith(variantIds[1]);
        expect(cartRemoveManyItemsMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantIds,
        );
        expect(updateMock).toHaveBeenCalledWith(mockCart);
        expect(toDtoMock).toHaveBeenCalledWith(mockCart);
      });
    });
  });
});
