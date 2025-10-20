/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateItemQuantityHandler } from '../update-item-quantity.handler';
import { UpdateItemQuantityDto } from '../update-item-quantity.dto';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { CartMapper, CartDTO } from '../../../mappers';
import { Cart } from '../../../../aggregates/entities/cart.entity';
import { Id, Qty } from '../../../../aggregates/value-objects';

interface MockCart {
  commit: jest.Mock;
  apply: jest.Mock;
  getId: jest.Mock;
  getCustomerId: jest.Mock;
  getCartItems: jest.Mock;
}

describe('UpdateItemQuantityHandler', () => {
  let handler: UpdateItemQuantityHandler;
  let cartRepository: jest.Mocked<ICartRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCart: MockCart;

  let findCartByCustomerIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let cartUpdateItemQuantityMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;
  let qtyCreateMock: jest.SpyInstance;
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
      getId: jest.fn().mockReturnValue({
        getValue: () => '550e8400-e29b-41d4-a716-446655440000',
      }),
      getCustomerId: jest.fn().mockReturnValue({
        getValue: () => '550e8400-e29b-41d4-a716-446655440001',
      }),
      getCartItems: jest.fn().mockReturnValue(new Map()),
    };

    mergeObjectContextMock.mockReturnValue(mockCart);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    cartUpdateItemQuantityMock = jest
      .spyOn(Cart, 'updateItemQuantity')
      .mockReturnValue(mockCart as unknown as Cart);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    qtyCreateMock = jest
      .spyOn(Qty, 'create')
      .mockReturnValue({ getValue: () => 2 } as Qty);

    toDtoMock = jest.spyOn(CartMapper, 'toDto').mockReturnValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      customerId: '550e8400-e29b-41d4-a716-446655440001',
      cartItems: [],
    } as CartDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateItemQuantityHandler,
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

    handler = module.get<UpdateItemQuantityHandler>(UpdateItemQuantityHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseItemData = {
      variantId: '550e8400-e29b-41d4-a716-446655440002',
      quantity: 3,
    };

    const baseCommand: UpdateItemQuantityDto = new UpdateItemQuantityDto(
      baseItemData,
      '550e8400-e29b-41d4-a716-446655440001',
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

      it('should create Id object for customerId', async () => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith(
          '550e8400-e29b-41d4-a716-446655440001',
        );
      });

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new UpdateItemQuantityDto(
          { variantId: 'variant-111', quantity: 5 },
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

    describe('Variant ID and quantity processing', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should create Id object for variantId', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith(
          '550e8400-e29b-41d4-a716-446655440002',
        );
      });

      it('should create Qty object for quantity', async () => {
        await handler.execute(baseCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(3);
      });

      it('should handle different variant IDs', async () => {
        const differentVariantCommand = new UpdateItemQuantityDto(
          { variantId: 'different-variant-456', quantity: 2 },
          'customer-456',
        );

        await handler.execute(differentVariantCommand);

        expect(idCreateMock).toHaveBeenCalledWith('different-variant-456');
        expect(qtyCreateMock).toHaveBeenCalledWith(2);
      });

      it('should handle different quantities', async () => {
        const differentQuantityCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 10 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(differentQuantityCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(10);
      });

      it('should handle minimum quantity (1)', async () => {
        const minQuantityCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(minQuantityCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(1);
      });

      it('should handle large quantities', async () => {
        const largeQuantityCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 999 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(largeQuantityCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(999);
      });
    });

    describe('Item quantity update processing', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should call Cart.updateItemQuantity with correct parameters', async () => {
        const mockVariantId = {
          getValue: () => '550e8400-e29b-41d4-a716-446655440002',
        } as Id;
        const mockQuantity = { getValue: () => 3 } as Qty;

        idCreateMock
          .mockReturnValueOnce({
            getValue: () => '550e8400-e29b-41d4-a716-446655440001',
          } as Id)
          .mockReturnValueOnce(mockVariantId);
        qtyCreateMock.mockReturnValueOnce(mockQuantity);

        await handler.execute(baseCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
          mockQuantity,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle quantity update for existing item', async () => {
        const cartWithItems = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(
            new Map([
              [
                '550e8400-e29b-41d4-a716-446655440002',
                {
                  id: 'item-1',
                  variantId: '550e8400-e29b-41d4-a716-446655440002',
                  qty: 2,
                },
              ],
            ]),
          ),
        };
        findCartByCustomerIdMock.mockResolvedValue(cartWithItems);

        await handler.execute(baseCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
      });

      it('should handle quantity update with different values', async () => {
        const updateCommand = new UpdateItemQuantityDto(
          { variantId: 'update-variant-456', quantity: 7 },
          'customer-456',
        );

        const mockVariantId = { getValue: () => 'update-variant-456' } as Id;
        const mockQuantity = { getValue: () => 7 } as Qty;

        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-456' } as Id)
          .mockReturnValueOnce(mockVariantId);
        qtyCreateMock.mockReturnValueOnce(mockQuantity);

        await handler.execute(updateCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
          mockQuantity,
        );
      });

      it('should handle quantity increase', async () => {
        const increaseCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 5 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(increaseCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(5);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
      });

      it('should handle quantity decrease', async () => {
        const decreaseCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(decreaseCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(1);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
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

      it('should update after updating quantity and before committing events', async () => {
        await handler.execute(baseCommand);

        const updateQuantityOrder =
          cartUpdateItemQuantityMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];

        expect(updateQuantityOrder).toBeLessThan(mergeOrder);
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

      it('should apply domain events during quantity update', async () => {
        await handler.execute(baseCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
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
          id: '550e8400-e29b-41d4-a716-446655440000',
          customerId: '550e8400-e29b-41d4-a716-446655440001',
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
        expect(result.customerId).toBe('550e8400-e29b-41d4-a716-446655440001');
      });

      it('should return updated cart with modified quantity', async () => {
        const cartAfterUpdate: CartDTO = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          customerId: '550e8400-e29b-41d4-a716-446655440001',
          cartItems: [
            {
              id: 'updated-item',
              variantId: '550e8400-e29b-41d4-a716-446655440002',
              qty: 3,
            },
          ],
          totalCart: 75,
        } as CartDTO;
        toDtoMock.mockReturnValue(cartAfterUpdate);

        const result = await handler.execute(baseCommand);

        expect(result).toEqual(cartAfterUpdate);
        expect(result.cartItems[0].qty).toBe(3);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle Cart.updateItemQuantity errors', async () => {
        const updateQuantityError = new Error('Failed to update item quantity');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        cartUpdateItemQuantityMock.mockImplementation(() => {
          throw updateQuantityError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          updateQuantityError,
        );
      });

      it('should handle Id.create errors for variant ID', async () => {
        const idCreationError = new Error('Invalid variant ID format');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        idCreateMock
          .mockReturnValueOnce({
            getValue: () => '550e8400-e29b-41d4-a716-446655440001',
          } as Id)
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

      it('should handle Qty.create errors', async () => {
        const qtyCreationError = new Error('Invalid quantity value');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        idCreateMock
          .mockReturnValueOnce({
            getValue: () => '550e8400-e29b-41d4-a716-446655440001',
          } as Id)
          .mockReturnValueOnce({
            getValue: () => '550e8400-e29b-41d4-a716-446655440002',
          } as Id);
        qtyCreateMock.mockImplementationOnce(() => {
          throw qtyCreationError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          qtyCreationError,
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

      it('should handle non-existent item update gracefully', async () => {
        const nonExistentItemCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440003', quantity: 5 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        const itemNotFoundError = new Error('Item not found in cart');
        cartUpdateItemQuantityMock.mockImplementation(() => {
          throw itemNotFoundError;
        });

        await expect(handler.execute(nonExistentItemCommand)).rejects.toThrow(
          itemNotFoundError,
        );
      });

      it('should handle zero quantity update', async () => {
        const zeroQuantityCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 0 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        // Mock cart found to reach quantity validation
        findCartByCustomerIdMock.mockResolvedValue(mockCart);

        const qtyError = new Error('Quantity must be positive');
        qtyCreateMock.mockImplementation(() => {
          throw qtyError;
        });

        await expect(handler.execute(zeroQuantityCommand)).rejects.toThrow(
          qtyError,
        );
      });

      it('should handle negative quantity update', async () => {
        const negativeQuantityCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: -1 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        // Mock cart found to reach quantity validation
        findCartByCustomerIdMock.mockResolvedValue(mockCart);

        const qtyError = new Error('Quantity must be positive');
        qtyCreateMock.mockImplementation(() => {
          throw qtyError;
        });

        await expect(handler.execute(negativeQuantityCommand)).rejects.toThrow(
          qtyError,
        );
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should update quantity for specific item by variant ID', async () => {
        const specificUpdateCommand = new UpdateItemQuantityDto(
          { variantId: 'specific-variant-789', quantity: 4 },
          'customer-456',
        );

        const mockVariantId = { getValue: () => 'specific-variant-789' } as Id;
        const mockQuantity = { getValue: () => 4 } as Qty;

        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-456' } as Id)
          .mockReturnValueOnce(mockVariantId);
        qtyCreateMock.mockReturnValueOnce(mockQuantity);

        await handler.execute(specificUpdateCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
          mockQuantity,
        );
      });

      it('should handle quantity update in cart with multiple items', async () => {
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

        const updateCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440004', quantity: 5 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(updateCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle quantity update from low to high', async () => {
        const lowToHighCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 10 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(lowToHighCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(10);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
      });

      it('should handle quantity update from high to low', async () => {
        const highToLowCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(highToLowCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(1);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
      });

      it('should handle same quantity update (no change)', async () => {
        const sameQuantityCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 2 },
          '550e8400-e29b-41d4-a716-446655440001',
        );

        await handler.execute(sameQuantityCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(2);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle bulk quantity updates', async () => {
        const bulkUpdateCommand = new UpdateItemQuantityDto(
          { variantId: 'bulk-variant', quantity: 100 },
          'customer-bulk',
        );

        await handler.execute(bulkUpdateCommand);

        expect(qtyCreateMock).toHaveBeenCalledWith(100);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle concurrent quantity updates', async () => {
        const command1 = new UpdateItemQuantityDto(
          { variantId: 'variant-1', quantity: 3 },
          'customer-1',
        );
        const command2 = new UpdateItemQuantityDto(
          { variantId: 'variant-2', quantity: 5 },
          'customer-1',
        );

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(2);
        expect(updateMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });

      it('should maintain cart integrity during quantity updates', async () => {
        const integrityCommand = new UpdateItemQuantityDto(
          { variantId: 'integrity-variant', quantity: 7 },
          'integrity-customer',
        );

        const cartWithIntegrity = {
          ...mockCart,
          getCartItems: jest.fn().mockReturnValue(
            new Map([
              [
                'integrity-variant',
                {
                  id: 'integrity-item',
                  variantId: 'integrity-variant',
                  qty: 3,
                },
              ],
            ]),
          ),
        };
        findCartByCustomerIdMock.mockResolvedValue(cartWithIntegrity);

        await handler.execute(integrityCommand);

        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(mockCart);
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete update item quantity flow', async () => {
        const completeCommand = new UpdateItemQuantityDto(
          { variantId: '550e8400-e29b-41d4-a716-446655440005', quantity: 8 },
          '550e8400-e29b-41d4-a716-446655440006',
        );

        const expectedDto: CartDTO = {
          id: '550e8400-e29b-41d4-a716-446655440007',
          customerId: '550e8400-e29b-41d4-a716-446655440006',
          cartItems: [
            {
              id: 'complete-item',
              variantId: '550e8400-e29b-41d4-a716-446655440005',
              qty: 8,
            },
          ],
          totalCart: 200,
        } as CartDTO;

        const mockCustomerId = {
          getValue: () => '550e8400-e29b-41d4-a716-446655440006',
        } as Id;
        const mockVariantId = {
          getValue: () => '550e8400-e29b-41d4-a716-446655440005',
        } as Id;
        const mockQuantity = { getValue: () => 8 } as Qty;

        idCreateMock
          .mockReturnValueOnce(mockCustomerId)
          .mockReturnValueOnce(mockVariantId);
        qtyCreateMock.mockReturnValueOnce(mockQuantity);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(2);
        expect(qtyCreateMock).toHaveBeenCalledTimes(1);
        expect(findCartByCustomerIdMock).toHaveBeenCalledTimes(1);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const variantId = '550e8400-e29b-41d4-a716-446655440008';
        const quantity = 6;
        const customerId = '550e8400-e29b-41d4-a716-446655440009';
        const command = new UpdateItemQuantityDto(
          { variantId, quantity },
          customerId,
        );

        const mockCustomerId = { getValue: () => customerId } as Id;
        const mockVariantId = { getValue: () => variantId } as Id;
        const mockQuantity = { getValue: () => quantity } as Qty;

        idCreateMock
          .mockReturnValueOnce(mockCustomerId)
          .mockReturnValueOnce(mockVariantId);
        qtyCreateMock.mockReturnValueOnce(mockQuantity);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(command);

        // Verify that the same data flows through all operations
        expect(idCreateMock).toHaveBeenCalledWith(customerId);
        expect(idCreateMock).toHaveBeenCalledWith(variantId);
        expect(qtyCreateMock).toHaveBeenCalledWith(quantity);
        expect(cartUpdateItemQuantityMock).toHaveBeenCalledWith(
          mockCart,
          mockVariantId,
          mockQuantity,
        );
        expect(updateMock).toHaveBeenCalledWith(mockCart);
        expect(toDtoMock).toHaveBeenCalledWith(mockCart);
      });
    });
  });
});
