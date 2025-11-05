import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateWishListHandler } from '../create-wish-list.handler';
import { CreateWishListDto } from '../create-wish-list.dto';
import { IWishListRepository } from '../../../../../aggregates/repositories/wish-list.interface';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { Customer } from '../../../../../aggregates/entities';
import { WishListDTO, WishListMapper } from '../../../../mappers';
import { Id } from '@shared/value-objects';
import { BadRequestException } from '@nestjs/common';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

interface MockWishListItem {
  getVariantIdValue: jest.Mock;
}

describe('CreateWishListHandler', () => {
  let handler: CreateWishListHandler;
  let wishListRepository: jest.Mocked<IWishListRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;
  let mockWishListItem: MockWishListItem;

  let findCustomerByIdMock: jest.Mock;
  let findWishListItemByVariantIdMock: jest.Mock;
  let createMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let addVariantToWishListMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;
  let defaultDto: WishListDTO;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    findWishListItemByVariantIdMock = jest.fn();
    createMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: jest.fn(),
      findCustomerById: findCustomerByIdMock,
      update: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    wishListRepository = {
      create: createMock,
      findWishListItemByVariantId: findWishListItemByVariantIdMock,
      removeVariantFromWishList: jest.fn(),
      removeManyFromWishList: jest.fn(),
      getManyWishListsByVariantIds: jest.fn(),
    } as unknown as jest.Mocked<IWishListRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mockWishListItem = {
      getVariantIdValue: jest.fn().mockReturnValue('variant-id-123'),
    };

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    addVariantToWishListMock = jest
      .spyOn(Customer, 'addVariantToWishList')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .mockReturnValue(mockWishListItem as any);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    defaultDto = {
      id: 'wishlist-item-123',
      variantId: 'variant-id-123',
      customerId: 'customer-id-123',
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    toDtoMock = jest.spyOn(WishListMapper, 'toDto').mockReturnValue(defaultDto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWishListHandler,
        {
          provide: 'IWishListRepository',
          useValue: wishListRepository,
        },
        {
          provide: 'ICustomerRepository',
          useValue: customerRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<CreateWishListHandler>(CreateWishListHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseWishListItem = {
      customerId: 'customer-123',
      variantId: 'variant-456',
    };

    const baseCommand = new CreateWishListDto(baseWishListItem, 'tenant-789');

    describe('Customer retrieval and validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-123');
        expect(idCreateMock).toHaveBeenCalledWith('tenant-789');
      });

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new CreateWishListDto(
          { customerId: 'valid-customer-999', variantId: 'valid-variant-888' },
          'valid-tenant-777',
        );

        await handler.execute(validCommand);

        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
      });

      it('should find customer before checking duplicate wishlist item', async () => {
        await handler.execute(baseCommand);

        expect(findCustomerByIdMock).toHaveBeenCalled();
        expect(findWishListItemByVariantIdMock).toHaveBeenCalled();
      });
    });

    describe('Duplicate wishlist item validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should check if wishlist item already exists by variant ID', async () => {
        findWishListItemByVariantIdMock.mockResolvedValue(null);

        await handler.execute(baseCommand);

        expect(findWishListItemByVariantIdMock).toHaveBeenCalledTimes(1);
      });

      it('should throw BadRequestException if item already exists', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const existingWishListItem = { id: 'existing-id' } as any;
        findWishListItemByVariantIdMock.mockResolvedValue(existingWishListItem);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          BadRequestException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'This variant already exist in your wishlist!',
        );
      });

      it('should create new wishlist item when no duplicate exists', async () => {
        findWishListItemByVariantIdMock.mockResolvedValue(null);

        await handler.execute(baseCommand);

        expect(addVariantToWishListMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('WishList item creation and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should call Customer.addVariantToWishList with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(addVariantToWishListMock).toHaveBeenCalledTimes(1);
        expect(addVariantToWishListMock).toHaveBeenCalledWith(
          expect.any(Object),
          mockCustomer,
        );
      });

      it('should create wishlist with valid data set', async () => {
        const validCommand = new CreateWishListDto(
          { customerId: 'cust-001', variantId: 'var-001' },
          'tenant-001',
        );

        await handler.execute(validCommand);

        expect(addVariantToWishListMock).toHaveBeenCalledTimes(1);
        expect(addVariantToWishListMock).toHaveBeenCalledWith(
          expect.any(Object),
          mockCustomer,
        );
      });

      it('should handle different variant IDs', async () => {
        const variantCommand = new CreateWishListDto(
          { customerId: 'customer-123', variantId: 'var-xyz' },
          'tenant-789',
        );

        await handler.execute(variantCommand);

        expect(idCreateMock).toHaveBeenCalledWith('var-xyz');
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should persist the wishlist item to repository', async () => {
        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledWith(mockWishListItem);
      });

      it('should handle repository create successfully', async () => {
        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(mockWishListItem);
      });

      it('should propagate repository creation errors', async () => {
        const repositoryError = new Error('Database creation failed');
        createMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should commit events after wishlist creation', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository persistence', async () => {
        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalled();
        expect(mergeObjectContextMock).toHaveBeenCalled();
        expect(mockCustomer.commit).toHaveBeenCalled();
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should convert wishlist item to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockWishListItem);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: WishListDTO = {
          id: 'wishlist-item-new',
          variantId: 'variant-id-123',
          customerId: 'customer-id-123',
          updatedAt: new Date('2024-02-01T00:00:00.000Z'),
        };
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });

      it('should return DTO with correct structure', async () => {
        const result = await handler.execute(baseCommand);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('variantId');
        expect(result).toHaveProperty('customerId');
        expect(result).toHaveProperty('updatedAt');
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should propagate customer retrieval errors', async () => {
        const retrieverError = new Error('Customer database read failed');
        findCustomerByIdMock.mockRejectedValue(retrieverError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          retrieverError,
        );
      });

      it('should propagate wishlist duplicate check errors', async () => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        const duplicateCheckError = new Error('Wishlist read failed');
        findWishListItemByVariantIdMock.mockRejectedValue(duplicateCheckError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          duplicateCheckError,
        );
      });

      it('should propagate Customer.addVariantToWishList errors', async () => {
        const wishListError = new Error('Failed to add variant to wishlist');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        addVariantToWishListMock.mockImplementation(() => {
          throw wishListError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          wishListError,
        );
      });

      it('should propagate mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete wishlist creation flow', async () => {
        const completeCommand = new CreateWishListDto(
          { customerId: 'complete-customer', variantId: 'complete-variant' },
          'complete-tenant',
        );

        const expectedDto: WishListDTO = {
          id: 'wishlist-id-complete',
          variantId: 'complete-variant',
          customerId: 'complete-customer',
          updatedAt: new Date('2024-03-01T00:00:00.000Z'),
        };

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(3);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(findWishListItemByVariantIdMock).toHaveBeenCalledTimes(1);
        expect(addVariantToWishListMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);
      });

      it('should create a wishlist item and commit events once', async () => {
        await handler.execute(baseCommand);

        expect(addVariantToWishListMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent wishlist creations', async () => {
        const command1 = new CreateWishListDto(
          { customerId: 'customer-1', variantId: 'variant-1' },
          'tenant-1',
        );
        const command2 = new CreateWishListDto(
          { customerId: 'customer-2', variantId: 'variant-2' },
          'tenant-2',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findWishListItemByVariantIdMock.mockResolvedValue(null);
        createMock.mockResolvedValue(mockWishListItem as any);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(6);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(findWishListItemByVariantIdMock).toHaveBeenCalledTimes(2);
        expect(addVariantToWishListMock).toHaveBeenCalledTimes(2);
        expect(createMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });
  });
});
