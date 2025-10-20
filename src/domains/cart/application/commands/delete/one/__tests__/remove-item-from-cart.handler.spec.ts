/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { RemoveItemFromCartHandler } from '../remove-item-from-cart.handler';
import { RemoveItemFromCartDto } from '../remove-item-from-cart.dto';
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

describe('RemoveItemFromCartHandler', () => {
  let handler: RemoveItemFromCartHandler;
  let cartRepository: jest.Mocked<ICartRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCart: MockCart;

  let findCartByCustomerIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let cartRemoveItemMock: jest.SpyInstance;
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

    cartRemoveItemMock = jest
      .spyOn(Cart, 'removeItem')
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
        RemoveItemFromCartHandler,
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

    handler = module.get<RemoveItemFromCartHandler>(RemoveItemFromCartHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseItemData = {
      variantId: 'variant-123',
    };

    const baseCommand: RemoveItemFromCartDto = new RemoveItemFromCartDto(
      baseItemData,
      'customer-789',
    );

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

      it('should create Id objects for variantId and customerId', async () => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('variant-123');
        expect(idCreateMock).toHaveBeenCalledWith('customer-789');
      });

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new RemoveItemFromCartDto(
          { variantId: 'variant-456' },
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

    describe('Item removal processing', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should call Cart.removeItem with correct parameters', async () => {
        const mockVariantId = { getValue: () => 'variant-123' } as Id;
        idCreateMock.mockReturnValueOnce(mockVariantId);

        await handler.execute(baseCommand);

        expect(cartRemoveItemMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle different variant IDs correctly', async () => {
        const differentVariantCommand = new RemoveItemFromCartDto(
          { variantId: 'different-variant-789' },
          'customer-456',
        );

        const mockVariantId = { getValue: () => 'different-variant-789' } as Id;
        idCreateMock.mockReturnValueOnce(mockVariantId);

        await handler.execute(differentVariantCommand);

        expect(idCreateMock).toHaveBeenCalledWith('different-variant-789');
        expect(cartRemoveItemMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
        );
      });

      it('should handle item removal from cart with existing items', async () => {
        const cartWithItems = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(
            new Map([
              ['variant-123', { id: 'item-1', variantId: 'variant-123' }],
              ['variant-456', { id: 'item-2', variantId: 'variant-456' }],
            ]),
          ),
        };
        findCartByCustomerIdMock.mockResolvedValue(cartWithItems);

        await handler.execute(baseCommand);

        expect(cartRemoveItemMock).toHaveBeenCalledTimes(1);
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

      it('should update after removing item and before committing events', async () => {
        await handler.execute(baseCommand);

        const removeItemOrder = cartRemoveItemMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];

        expect(removeItemOrder).toBeLessThan(mergeOrder);
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

      it('should apply domain events during item removal', async () => {
        await handler.execute(baseCommand);

        expect(cartRemoveItemMock).toHaveBeenCalledTimes(1);
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

      it('should return updated cart after item removal', async () => {
        const cartAfterRemoval: CartDTO = {
          id: 'cart-id-123',
          customerId: 'customer-id-456',
          cartItems: [
            {
              id: 'remaining-item',
              variantId: 'variant-456',
              qty: 2,
            },
          ],
          totalCart: 50,
        } as CartDTO;
        toDtoMock.mockReturnValue(cartAfterRemoval);

        const result = await handler.execute(baseCommand);

        expect(result).toEqual(cartAfterRemoval);
        expect(result.cartItems).toHaveLength(1);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle Cart.removeItem errors', async () => {
        const removeItemError = new Error('Failed to remove item from cart');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        cartRemoveItemMock.mockImplementation(() => {
          throw removeItemError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          removeItemError,
        );
      });

      it('should handle Id.create errors for variantId', async () => {
        const idCreationError = new Error('Invalid variant ID format');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        idCreateMock.mockImplementationOnce(() => {
          throw idCreationError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          idCreationError,
        );
      });

      it('should handle Id.create errors for customerId', async () => {
        const idCreationError = new Error('Invalid customer ID format');
        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'variant-123' } as Id)
          .mockImplementationOnce(() => {
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

      it('should handle non-existent variant ID removal gracefully', async () => {
        const nonExistentVariantCommand = new RemoveItemFromCartDto(
          { variantId: 'non-existent-variant' },
          'customer-789',
        );

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        // This should not throw an error, as the domain logic handles it
        const result = await handler.execute(nonExistentVariantCommand);

        expect(result).toBeDefined();
        expect(cartRemoveItemMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should remove specific item by variant ID', async () => {
        const specificVariantCommand = new RemoveItemFromCartDto(
          { variantId: 'specific-variant-123' },
          'customer-456',
        );

        const mockVariantId = { getValue: () => 'specific-variant-123' } as Id;
        idCreateMock.mockReturnValueOnce(mockVariantId);

        await handler.execute(specificVariantCommand);

        expect(idCreateMock).toHaveBeenCalledWith('specific-variant-123');
        expect(cartRemoveItemMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
        );
      });

      it('should handle removal from cart with multiple items', async () => {
        const cartWithMultipleItems = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(
            new Map([
              ['variant-1', { id: 'item-1', variantId: 'variant-1', qty: 2 }],
              ['variant-2', { id: 'item-2', variantId: 'variant-2', qty: 1 }],
              ['variant-3', { id: 'item-3', variantId: 'variant-3', qty: 3 }],
            ]),
          ),
        };
        findCartByCustomerIdMock.mockResolvedValue(cartWithMultipleItems);

        const removeCommand = new RemoveItemFromCartDto(
          { variantId: 'variant-2' },
          'customer-789',
        );

        await handler.execute(removeCommand);

        expect(cartRemoveItemMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle removal from empty cart', async () => {
        const emptyCart = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(new Map()),
        };
        findCartByCustomerIdMock.mockResolvedValue(emptyCart);

        await handler.execute(baseCommand);

        expect(cartRemoveItemMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle concurrent removal requests', async () => {
        const command1 = new RemoveItemFromCartDto(
          { variantId: 'variant-1' },
          'customer-1',
        );
        const command2 = new RemoveItemFromCartDto(
          { variantId: 'variant-2' },
          'customer-1',
        );

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(cartRemoveItemMock).toHaveBeenCalledTimes(2);
        expect(updateMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete remove item from cart flow', async () => {
        const completeCommand = new RemoveItemFromCartDto(
          { variantId: 'complete-variant-123' },
          'complete-customer-789',
        );

        const expectedDto: CartDTO = {
          id: 'cart-id-123',
          customerId: 'customer-id-456',
          cartItems: [],
          totalCart: 0,
        } as CartDTO;

        const mockVariantId = { getValue: () => 'complete-variant-123' } as Id;
        const mockCustomerId = {
          getValue: () => 'complete-customer-789',
        } as Id;

        idCreateMock
          .mockReturnValueOnce(mockVariantId)
          .mockReturnValueOnce(mockCustomerId);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(2);
        expect(findCartByCustomerIdMock).toHaveBeenCalledTimes(1);
        expect(cartRemoveItemMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const variantId = 'consistency-variant';
        const customerId = 'consistency-customer';
        const command = new RemoveItemFromCartDto({ variantId }, customerId);

        const mockVariantId = { getValue: () => variantId } as Id;
        const mockCustomerId = { getValue: () => customerId } as Id;

        idCreateMock
          .mockReturnValueOnce(mockVariantId)
          .mockReturnValueOnce(mockCustomerId);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(command);

        // Verify that the same data flows through all operations
        expect(idCreateMock).toHaveBeenCalledWith(variantId);
        expect(idCreateMock).toHaveBeenCalledWith(customerId);
        expect(cartRemoveItemMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
        );
        expect(updateMock).toHaveBeenCalledWith(mockCart);
        expect(toDtoMock).toHaveBeenCalledWith(mockCart);
      });
    });
  });
});
