import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CartCreateHandler } from '../create-cart.handler';
import { CreateCartDto } from '../create-cart.dto';
import { ICartRepository } from '../../../../../aggregates/repositories/cart.interface';
import { CartMapper, CartDTO } from '../../../../mappers';
import { Cart } from '../../../../../aggregates/entities/cart.entity';

interface MockCart {
  commit: jest.Mock;
  apply: jest.Mock;
  getId: jest.Mock;
  getCustomerId: jest.Mock;
  getCartItems: jest.Mock;
}

describe('CartCreateHandler', () => {
  let handler: CartCreateHandler;
  let cartRepository: jest.Mocked<ICartRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCart: MockCart;

  let createMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let cartCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    createMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    cartRepository = {
      create: createMock,
      findCartByCustomerId: jest.fn(),
      update: jest.fn(),
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

    cartCreateMock = jest
      .spyOn(Cart, 'create')
      .mockReturnValue(mockCart as unknown as Cart);

    toDtoMock = jest.spyOn(CartMapper, 'toDto').mockReturnValue({
      id: 'cart-id-123',
      customerId: 'customer-id-456',
      cartItems: [],
    } as CartDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartCreateHandler,
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

    handler = module.get<CartCreateHandler>(CartCreateHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseCartData = {
      customerId: 'customer-456',
    };

    const baseCommand: CreateCartDto = new CreateCartDto(baseCartData);

    describe('Cart creation and processing', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);
      });

      it('should call Cart.create with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(cartCreateMock).toHaveBeenCalledWith(baseCartData);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });

      it('should create cart with valid customer ID', async () => {
        const validCommand = new CreateCartDto({
          customerId: 'valid-customer-123',
        });

        await handler.execute(validCommand);

        expect(cartCreateMock).toHaveBeenCalledWith({
          customerId: 'valid-customer-123',
        });
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);
      });

      it('should create the cart in repository', async () => {
        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledWith(mockCart);
      });

      it('should create after domain creation and before committing events', async () => {
        await handler.execute(baseCommand);

        const cartCreateOrder = cartCreateMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const createOrder = createMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];

        expect(cartCreateOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(createOrder);
        expect(createOrder).toBeLessThan(commitOrder);
      });

      it('should handle repository creation successfully', async () => {
        const savedCart = { ...mockCart, id: 'saved-cart-id' };
        createMock.mockResolvedValue(savedCart);

        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(savedCart);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);
      });

      it('should commit events after creating', async () => {
        await handler.execute(baseCommand);

        expect(mockCart.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after all operations', async () => {
        await handler.execute(baseCommand);

        const createOrder = createMock.mock.invocationCallOrder[0];
        const commitOrder = mockCart.commit.mock.invocationCallOrder[0];
        expect(createOrder).toBeLessThan(commitOrder);
      });

      it('should apply domain events during cart creation', async () => {
        await handler.execute(baseCommand);

        // Verify that the cart creation process includes event application
        expect(cartCreateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCart);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);
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
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle cart creation with valid customer ID', async () => {
        const validCommand = new CreateCartDto({
          customerId: 'valid-customer-789',
        });

        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);

        const result = await handler.execute(validCommand);

        expect(cartCreateMock).toHaveBeenCalledWith({
          customerId: 'valid-customer-789',
        });
        expect(result).toEqual({
          id: 'cart-id-123',
          customerId: 'customer-id-456',
          cartItems: [],
        });
      });

      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should propagate cart creation errors', async () => {
        const createError = new Error('Failed to create cart');
        cartCreateMock.mockImplementation(() => {
          throw createError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(createError);
      });

      it('should handle mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete cart creation flow', async () => {
        const completeCommand = new CreateCartDto({
          customerId: 'complete-customer-123',
        });

        const expectedDto: CartDTO = {
          id: 'cart-id-123',
          customerId: 'customer-id-456',
          cartItems: [],
          totalCart: 0,
        } as CartDTO;

        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(cartCreateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const customerData = { customerId: 'consistency-test-456' };
        const command = new CreateCartDto(customerData);

        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);

        await handler.execute(command);

        // Verify that the same customer data flows through all operations
        expect(cartCreateMock).toHaveBeenCalledWith(customerData);
        expect(createMock).toHaveBeenCalledWith(mockCart);
        expect(toDtoMock).toHaveBeenCalledWith(mockCart);
      });
    });

    describe('Business logic validation', () => {
      it('should create empty cart for new customer', async () => {
        const newCustomerCommand = new CreateCartDto({
          customerId: 'new-customer-999',
        });

        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);

        await handler.execute(newCustomerCommand);

        expect(cartCreateMock).toHaveBeenCalledWith({
          customerId: 'new-customer-999',
        });
        expect(mockCart.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent cart creation requests', async () => {
        const command1 = new CreateCartDto({ customerId: 'customer-1' });
        const command2 = new CreateCartDto({ customerId: 'customer-2' });

        mergeObjectContextMock.mockReturnValue(mockCart as never);
        createMock.mockResolvedValue(mockCart);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(cartCreateMock).toHaveBeenCalledTimes(2);
        expect(createMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });
  });
});
