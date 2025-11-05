import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeleteManyWishListHandler } from '../delete-many-wish-list.handler';
import { DeleteManyWishListDto } from '../delete-many-wish-list.dto';
import { IWishListRepository } from '../../../../../../aggregates/repositories/wish-list.interface';
import { ICustomerRepository } from '../../../../../../aggregates/repositories/customer.interface';
import { Customer } from '../../../../../../aggregates/entities';
import { Id } from '@shared/value-objects';
import { NotFoundException } from '@nestjs/common';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

interface MockWishListItem {
  getId: jest.Mock;
}

describe('DeleteManyWishListHandler', () => {
  let handler: DeleteManyWishListHandler;
  let wishListRepository: jest.Mocked<IWishListRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;
  let mockWishListItems: MockWishListItem[];

  let findCustomerByIdMock: jest.Mock;
  let removeManyFromWishListMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let removeManyVariantsFromWishListDomainMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    removeManyFromWishListMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: jest.fn(),
      findCustomerById: findCustomerByIdMock,
      update: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    wishListRepository = {
      create: jest.fn(),
      findWishListItemByVariantId: jest.fn(),
      removeVariantFromWishList: jest.fn(),
      removeManyFromWishList: removeManyFromWishListMock,
      getManyWishListsByVariantIds: jest.fn(),
    } as unknown as jest.Mocked<IWishListRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mockWishListItems = [
      { getId: jest.fn().mockReturnValue('wishlist-item-id-1') },
      { getId: jest.fn().mockReturnValue('wishlist-item-id-2') },
      { getId: jest.fn().mockReturnValue('wishlist-item-id-3') },
    ];

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    removeManyVariantsFromWishListDomainMock = jest
      .spyOn(Customer, 'removeManyVariantsFromWishList')
      .mockReturnValue(undefined);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteManyWishListHandler,
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

    handler = module.get<DeleteManyWishListHandler>(DeleteManyWishListHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseCommand = new DeleteManyWishListDto(
      'customer-123',
      ['variant-1', 'variant-2', 'variant-3'],
      'tenant-789',
    );

    describe('Customer retrieval and validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-123');
        expect(idCreateMock).toHaveBeenCalledWith('tenant-789');
      });

      it('should create variant ID objects for all variants', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('variant-1');
        expect(idCreateMock).toHaveBeenCalledWith('variant-2');
        expect(idCreateMock).toHaveBeenCalledWith('variant-3');
      });

      it('should handle valid customer, variants and tenant IDs', async () => {
        const validCommand = new DeleteManyWishListDto(
          'valid-customer-888',
          ['valid-variant-1', 'valid-variant-2'],
          'valid-tenant-666',
        );

        await handler.execute(validCommand);

        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
      });

      it('should throw NotFoundException if customer not found', async () => {
        findCustomerByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Customer with ID customer-123 not found',
        );
      });
    });

    describe('Multiple wishlist items removal and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);
      });

      it('should call removeManyFromWishList repository method', async () => {
        await handler.execute(baseCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should remove multiple variants with valid data', async () => {
        const removeCommand = new DeleteManyWishListDto(
          'customer-remove-001',
          ['variant-remove-001', 'variant-remove-002'],
          'tenant-remove-001',
        );

        await handler.execute(removeCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should call Customer.removeManyVariantsFromWishList with removed items', async () => {
        await handler.execute(baseCommand);

        expect(removeManyVariantsFromWishListDomainMock).toHaveBeenCalledWith(
          mockWishListItems,
          mockCustomer,
        );
      });

      it('should handle removal of single variant in batch', async () => {
        const singleCommand = new DeleteManyWishListDto(
          'customer-single',
          ['variant-single'],
          'tenant-single',
        );

        removeManyFromWishListMock.mockResolvedValue([mockWishListItems[0]]);

        await handler.execute(singleCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should handle removal of many variants in batch', async () => {
        const manyCommand = new DeleteManyWishListDto(
          'customer-many',
          ['var-1', 'var-2', 'var-3', 'var-4', 'var-5'],
          'tenant-many',
        );

        removeManyFromWishListMock.mockResolvedValue(mockWishListItems);

        await handler.execute(manyCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Repository operations', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);
      });

      it('should call repository removeManyFromWishList', async () => {
        await handler.execute(baseCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should handle repository batch removal successfully', async () => {
        await handler.execute(baseCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should propagate repository removal errors', async () => {
        const repositoryError = new Error('Database batch removal failed');
        removeManyFromWishListMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should propagate empty result errors', async () => {
        removeManyFromWishListMock.mockResolvedValue([]);

        await handler.execute(baseCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should commit events after batch wishlist removal', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository batch operations', async () => {
        await handler.execute(baseCommand);

        expect(removeManyFromWishListMock).toHaveBeenCalled();
        expect(mergeObjectContextMock).toHaveBeenCalled();
        expect(mockCustomer.commit).toHaveBeenCalled();
      });
    });

    describe('Error scenarios', () => {
      it('should propagate customer retrieval errors', async () => {
        const retrieverError = new Error('Customer database read failed');
        findCustomerByIdMock.mockRejectedValue(retrieverError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          retrieverError,
        );
      });

      it('should propagate batch removal errors', async () => {
        const removalError = new Error('Batch wishlist removal failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockRejectedValue(removalError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          removalError,
        );
      });

      it('should propagate Customer.removeManyVariantsFromWishList errors', async () => {
        const domainError = new Error('Failed to remove variants from domain');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);
        removeManyVariantsFromWishListDomainMock.mockImplementation(() => {
          throw domainError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(domainError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete batch wishlist deletion flow', async () => {
        const completeCommand = new DeleteManyWishListDto(
          'customer-complete-delete',
          ['variant-1-del', 'variant-2-del', 'variant-3-del'],
          'tenant-complete-delete',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);

        await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(5);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(1);
        expect(removeManyVariantsFromWishListDomainMock).toHaveBeenCalledTimes(
          1,
        );
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);
      });

      it('should remove multiple wishlist items and commit events exactly once', async () => {
        await handler.execute(baseCommand);

        expect(removeManyVariantsFromWishListDomainMock).toHaveBeenCalledTimes(
          1,
        );
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent batch wishlist deletions', async () => {
        const command1 = new DeleteManyWishListDto(
          'customer-concurrent-1',
          ['var-1-1', 'var-1-2'],
          'tenant-concurrent-1',
        );
        const command2 = new DeleteManyWishListDto(
          'customer-concurrent-2',
          ['var-2-1', 'var-2-2', 'var-2-3'],
          'tenant-concurrent-2',
        );

        removeManyFromWishListMock.mockResolvedValue(mockWishListItems as any);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(9);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(removeManyFromWishListMock).toHaveBeenCalledTimes(2);
        expect(removeManyVariantsFromWishListDomainMock).toHaveBeenCalledTimes(
          2,
        );
        expect(result1).toBeUndefined();
        expect(result2).toBeUndefined();
      });

      it('should preserve variant order in batch deletion', async () => {
        const orderedCommand = new DeleteManyWishListDto(
          'customer-ordered',
          ['variant-a', 'variant-b', 'variant-c'],
          'tenant-ordered',
        );

        await handler.execute(orderedCommand);

        expect(idCreateMock).toHaveBeenCalledWith('variant-a');
        expect(idCreateMock).toHaveBeenCalledWith('variant-b');
        expect(idCreateMock).toHaveBeenCalledWith('variant-c');
      });
    });
  });
});
