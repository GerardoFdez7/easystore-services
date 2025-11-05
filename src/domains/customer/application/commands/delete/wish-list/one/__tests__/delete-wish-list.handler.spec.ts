/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeleteWishListHandler } from '../delete-wish-list.handler';
import { DeleteWishListDto } from '../delete-wish-list.dto';
import { IWishListRepository } from '../../../../../../aggregates/repositories/wish-list.interface';
import { ICustomerRepository } from '../../../../../../aggregates/repositories/customer.interface';
import { Customer } from '../../../../../../aggregates/entities';
import { Id } from '@shared/value-objects';
import { NotFoundException } from '@nestjs/common';

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

interface MockWishListItem {
  getId: jest.Mock;
}

describe('DeleteWishListHandler', () => {
  let handler: DeleteWishListHandler;
  let wishListRepository: jest.Mocked<IWishListRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;
  let mockWishListItem: MockWishListItem;

  let findCustomerByIdMock: jest.Mock;
  let removeVariantFromWishListMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let removeVariantFromWishListDomainMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    removeVariantFromWishListMock = jest.fn();
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
      removeVariantFromWishList: removeVariantFromWishListMock,
      removeManyFromWishList: jest.fn(),
      getManyWishListsByVariantIds: jest.fn(),
    } as unknown as jest.Mocked<IWishListRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mockWishListItem = {
      getId: jest.fn().mockReturnValue('wishlist-item-id-123'),
    };

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    removeVariantFromWishListDomainMock = jest
      .spyOn(Customer, 'removeVariantFromWishList')
      .mockReturnValue(undefined);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteWishListHandler,
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

    handler = module.get<DeleteWishListHandler>(DeleteWishListHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseCommand = new DeleteWishListDto(
      'customer-123',
      'variant-456',
      'tenant-789',
    );

    describe('Customer retrieval and validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-123');
        expect(idCreateMock).toHaveBeenCalledWith('tenant-789');
      });

      it('should create variant ID object', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('variant-456');
      });

      it('should handle valid customer, variant and tenant IDs', async () => {
        const validCommand = new DeleteWishListDto(
          'valid-customer-888',
          'valid-variant-777',
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

    describe('WishList item removal and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );
      });

      it('should call removeVariantFromWishList repository method', async () => {
        await handler.execute(baseCommand);

        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should remove variant with valid data', async () => {
        const removeCommand = new DeleteWishListDto(
          'customer-remove-001',
          'variant-remove-001',
          'tenant-remove-001',
        );

        await handler.execute(removeCommand);

        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should call Customer.removeVariantFromWishList with removed item', async () => {
        await handler.execute(baseCommand);

        expect(removeVariantFromWishListDomainMock).toHaveBeenCalledWith(
          mockWishListItem,
          mockCustomer,
        );
      });

      it('should handle multiple wishlist removals', async () => {
        const command1 = new DeleteWishListDto(
          'customer-multi-1',
          'variant-multi-1',
          'tenant-multi-1',
        );
        const command2 = new DeleteWishListDto(
          'customer-multi-2',
          'variant-multi-2',
          'tenant-multi-2',
        );

        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );

        await handler.execute(command1);
        await handler.execute(command2);

        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(2);
      });
    });

    describe('Repository operations', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );
      });

      it('should call repository removeVariantFromWishList', async () => {
        await handler.execute(baseCommand);

        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should handle repository removal successfully', async () => {
        await handler.execute(baseCommand);

        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(1);
      });

      it('should propagate repository removal errors', async () => {
        const repositoryError = new Error('Database removal failed');
        removeVariantFromWishListMock.mockRejectedValue(repositoryError);

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
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should commit events after wishlist removal', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository operations', async () => {
        await handler.execute(baseCommand);

        expect(removeVariantFromWishListMock).toHaveBeenCalled();
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

      it('should propagate wishlist removal errors', async () => {
        const removalError = new Error('Wishlist removal failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockRejectedValue(removalError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          removalError,
        );
      });

      it('should propagate Customer.removeVariantFromWishList errors', async () => {
        const domainError = new Error('Failed to remove variant from domain');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );
        removeVariantFromWishListDomainMock.mockImplementation(() => {
          throw domainError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(domainError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete wishlist deletion flow', async () => {
        const completeCommand = new DeleteWishListDto(
          'customer-complete-delete',
          'variant-complete-delete',
          'tenant-complete-delete',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );

        await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(3);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(1);
        expect(removeVariantFromWishListDomainMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );
      });

      it('should remove a wishlist item and commit events exactly once', async () => {
        await handler.execute(baseCommand);

        expect(removeVariantFromWishListDomainMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent wishlist deletions', async () => {
        const command1 = new DeleteWishListDto(
          'customer-concurrent-1',
          'variant-concurrent-1',
          'tenant-concurrent-1',
        );
        const command2 = new DeleteWishListDto(
          'customer-concurrent-2',
          'variant-concurrent-2',
          'tenant-concurrent-2',
        );

        removeVariantFromWishListMock.mockResolvedValue(
          mockWishListItem as any,
        );

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(6);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(removeVariantFromWishListMock).toHaveBeenCalledTimes(2);
        expect(removeVariantFromWishListDomainMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeUndefined();
        expect(result2).toBeUndefined();
      });
    });
  });
});
