/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AddItemToCartHandler } from '../add-item-to-cart.handler';
import { AddItemToCartDto } from '../add-item-to-cart.dto';
import { ICartRepository } from '../../../../../aggregates/repositories/cart.interface';
import { CartMapper, CartDTO } from '../../../../mappers';
import { Cart } from '../../../../../aggregates/entities/cart.entity';
import { CartItem } from '../../../../../aggregates/value-objects/cart-item.vo';

interface MockCart {
  commit: jest.Mock;
  apply: jest.Mock;
  getId: jest.Mock;
  getCustomerId: jest.Mock;
  getCartItems: jest.Mock;
}

describe('AddItemToCartHandler', () => {
  let handler: AddItemToCartHandler;
  let cartRepository: jest.Mocked<ICartRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCart: MockCart;

  let findCartByCustomerIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let cartAddItemToCartMock: jest.SpyInstance;
  let cartItemCreateMock: jest.SpyInstance;
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
        getValue: () => '019a039e-fe32-747d-aba6-6f3d25bb2864',
      }),
      getCustomerId: jest.fn().mockReturnValue({
        getValue: () => '019a039e-fe36-765d-96f1-fe92af9ab188',
      }),
      getCartItems: jest.fn().mockReturnValue(new Map()),
    };

    mergeObjectContextMock.mockReturnValue(mockCart);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    cartAddItemToCartMock = jest
      .spyOn(Cart, 'addItemToCart')
      .mockReturnValue(mockCart as unknown as Cart);

    cartItemCreateMock = jest
      .spyOn(CartItem, 'create')
      .mockReturnValue({} as CartItem);

    toDtoMock = jest.spyOn(CartMapper, 'toDto').mockReturnValue({
      id: '019a039e-fe32-747d-aba6-6f3d25bb2864',
      customerId: '019a039e-fe36-765d-96f1-fe92af9ab188',
      cartItems: [],
    } as CartDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddItemToCartHandler,
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

    handler = module.get<AddItemToCartHandler>(AddItemToCartHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseItemData = {
      variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179',
      promotionId: '019a039e-fe37-7516-ab6d-b9950da58d38',
    };

    const baseCommand: AddItemToCartDto = new AddItemToCartDto(
      baseItemData,
      '019a039e-fe37-7516-ab6d-c16428949f9f',
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

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new AddItemToCartDto(
          baseItemData,
          '019a039e-fe37-7516-ab6d-c79f752bad91',
        );
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(validCommand);

        expect(findCartByCustomerIdMock).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );
      });
    });

    describe('Cart item creation and processing', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should create cart item with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(cartItemCreateMock).toHaveBeenCalledWith({
          qty: 1,
          variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179',
          promotionId: '019a039e-fe37-7516-ab6d-b9950da58d38',
        });
      });

      it('should create cart item with null promotion when not provided', async () => {
        const commandWithoutPromotion = new AddItemToCartDto(
          { variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179' },
          '019a039e-fe37-7516-ab6d-c16428949f9f',
        );

        await handler.execute(commandWithoutPromotion);

        expect(cartItemCreateMock).toHaveBeenCalledWith({
          qty: 1,
          variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179',
          promotionId: null,
        });
      });

      it('should call Cart.addItemToCart with correct parameters', async () => {
        const mockCartItem = {} as CartItem;
        cartItemCreateMock.mockReturnValue(mockCartItem);

        await handler.execute(baseCommand);

        expect(cartAddItemToCartMock).toHaveBeenCalledWith(
          mockCart,
          mockCartItem,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });

      it('should handle different variant IDs correctly', async () => {
        const differentVariantCommand = new AddItemToCartDto(
          {
            variantId: '019a039e-fe37-7516-ab6d-cb2c14f5688f',
            promotionId: '019a039e-fe37-7516-ab6d-cdd89150cf72',
          },
          '019a039e-fe37-7516-ab6d-d15dfec44424',
        );

        await handler.execute(differentVariantCommand);

        expect(cartItemCreateMock).toHaveBeenCalledWith({
          qty: 1,
          variantId: '019a039e-fe37-7516-ab6d-cb2c14f5688f',
          promotionId: '019a039e-fe37-7516-ab6d-cdd89150cf72',
        });
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

      it('should update after adding item and before committing events', async () => {
        await handler.execute(baseCommand);

        const addItemOrder = cartAddItemToCartMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];

        expect(addItemOrder).toBeLessThan(mergeOrder);
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

      it('should apply domain events during item addition', async () => {
        await handler.execute(baseCommand);

        expect(cartAddItemToCartMock).toHaveBeenCalledTimes(1);
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
          id: '019a039e-fe32-747d-aba6-6f3d25bb2864',
          customerId: '019a039e-fe36-765d-96f1-fe92af9ab188',
          cartItems: [
            {
              id: 'item-1',
              variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179',
              qty: 1,
              promotionId: '019a039e-fe37-7516-ab6d-b9950da58d38',
            },
          ],
          totalCart: 100,
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
        expect(result.customerId).toBe('019a039e-fe36-765d-96f1-fe92af9ab188');
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle cart item creation errors', async () => {
        const itemCreationError = new Error('Failed to create cart item');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        cartItemCreateMock.mockImplementation(() => {
          throw itemCreationError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          itemCreationError,
        );
      });

      it('should handle Cart.addItemToCart errors', async () => {
        const addItemError = new Error('Failed to add item to cart');
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        cartAddItemToCartMock.mockImplementation(() => {
          throw addItemError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          addItemError,
        );

        expect(cartItemCreateMock).toHaveBeenCalledTimes(1);
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
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
      });

      it('should add item with default quantity of 1', async () => {
        await handler.execute(baseCommand);

        expect(cartItemCreateMock).toHaveBeenCalledWith(
          expect.objectContaining({ qty: 1 }),
        );
      });

      it('should handle items with promotions correctly', async () => {
        const promotionCommand = new AddItemToCartDto(
          {
            variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179',
            promotionId: '019a039e-fe38-7759-b843-f284e2d531d3',
          },
          '019a039e-fe38-7759-b843-f4d778645a78',
        );

        await handler.execute(promotionCommand);

        expect(cartItemCreateMock).toHaveBeenCalledWith({
          qty: 1,
          variantId: '019a039e-fe37-7516-ab6d-b44cd5c58179',
          promotionId: '019a039e-fe38-7759-b843-f284e2d531d3',
        });
      });

      it('should handle items without promotions correctly', async () => {
        const noPromotionCommand = new AddItemToCartDto(
          { variantId: '019a039e-fe38-7759-b843-f9246dfb0a41' },
          '019a039e-fe37-7516-ab6d-c16428949f9f',
        );

        await handler.execute(noPromotionCommand);

        expect(cartItemCreateMock).toHaveBeenCalledWith({
          qty: 1,
          variantId: '019a039e-fe38-7759-b843-f9246dfb0a41',
          promotionId: null,
        });
      });

      it('should handle multiple different items sequentially', async () => {
        const command1 = new AddItemToCartDto(
          {
            variantId: '019a039e-fe38-7759-b843-fd3b5e1dd881',
            promotionId: '019a039e-fe38-7759-b844-03a2ddffb4c8',
          },
          '019a039e-fe38-7759-b844-0531f5ee8423',
        );
        const command2 = new AddItemToCartDto(
          { variantId: '019a039e-fe38-7759-b844-0b0695769397' },
          '019a039e-fe38-7759-b844-0531f5ee8423',
        );

        await handler.execute(command1);
        await handler.execute(command2);

        expect(cartItemCreateMock).toHaveBeenCalledTimes(2);
        expect(cartAddItemToCartMock).toHaveBeenCalledTimes(2);
        expect(updateMock).toHaveBeenCalledTimes(2);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete add item to cart flow', async () => {
        const completeCommand = new AddItemToCartDto(
          {
            variantId: '019a039e-fe38-7759-b844-0c2e5c91a9a5',
            promotionId: '019a039e-fe39-7a1c-8d2f-1e4b7c9a5f3d',
          },
          '019a039e-fe39-7a1c-8d2f-2f5c8d0b6e4a',
        );

        const expectedDto: CartDTO = {
          id: '019a039e-fe39-7a1c-8d2f-3a6d9e1c7f5b',
          customerId: '019a039e-fe39-7a1c-8d2f-2f5c8d0b6e4a',
          cartItems: [
            {
              id: 'item-1',
              variantId: '019a039e-fe38-7759-b844-0c2e5c91a9a5',
              qty: 1,
              promotionId: '019a039e-fe39-7a1c-8d2f-1e4b7c9a5f3d',
            },
          ],
          totalCart: 150,
        } as CartDTO;

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(findCartByCustomerIdMock).toHaveBeenCalledTimes(1);
        expect(cartItemCreateMock).toHaveBeenCalledTimes(1);
        expect(cartAddItemToCartMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const itemData = {
          variantId: '019a039e-fe39-7a1c-8d2f-4a7e0f2d8a6c',
          promotionId: '019a039e-fe39-7a1c-8d2f-5b8f1a3e9a7d',
        };
        const customerId = '019a039e-fe39-7a1c-8d2f-6c9a2b4f0b8e';
        const command = new AddItemToCartDto(itemData, customerId);

        findCartByCustomerIdMock.mockResolvedValue(mockCart);
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        updateMock.mockResolvedValue(mockCart);

        await handler.execute(command);

        // Verify that the same data flows through all operations
        expect(cartItemCreateMock).toHaveBeenCalledWith({
          qty: 1,
          variantId: itemData.variantId,
          promotionId: itemData.promotionId,
        });
        expect(updateMock).toHaveBeenCalledWith(mockCart);
        expect(toDtoMock).toHaveBeenCalledWith(mockCart);
      });
    });
  });
});
