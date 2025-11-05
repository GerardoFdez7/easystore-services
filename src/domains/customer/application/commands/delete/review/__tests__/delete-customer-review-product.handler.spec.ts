import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { DeleteCustomerReviewProductHandler } from '../delete-customer-review-product.handler';
import { DeleteCustomerReviewProductDto } from '../delete-customer-review-product.dto';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { ICustomerReviewProductRepository } from '../../../../../aggregates/repositories/customer-review-product.interface';
import { Customer } from '../../../../../aggregates/entities/customer.entity';
import { Id } from '@shared/value-objects';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

interface MockReview {
  getCustomerIdValue: jest.Mock;
}

describe('DeleteCustomerReviewProductHandler', () => {
  let handler: DeleteCustomerReviewProductHandler;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let reviewRepository: jest.Mocked<ICustomerReviewProductRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;
  let mockReview: MockReview;

  let findCustomerByIdMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let removeReviewMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let removeCustomerReviewProductMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    findByIdMock = jest.fn();
    removeReviewMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: jest.fn(),
      findCustomerById: findCustomerByIdMock,
      update: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    reviewRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: findByIdMock,
      findMany: jest.fn(),
      removeReview: removeReviewMock,
    } as unknown as jest.Mocked<ICustomerReviewProductRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mockReview = {
      getCustomerIdValue: jest.fn().mockReturnValue('customer-123'),
    };

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    removeCustomerReviewProductMock = jest
      .spyOn(Customer, 'removeCustomerReviewProduct')
      .mockReturnValue(undefined);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerReviewProductHandler,
        {
          provide: 'ICustomerRepository',
          useValue: customerRepository,
        },
        {
          provide: 'ICustomerReviewProductRepository',
          useValue: reviewRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<DeleteCustomerReviewProductHandler>(
      DeleteCustomerReviewProductHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseCommand = new DeleteCustomerReviewProductDto(
      'customer-123',
      'review-123',
      'tenant-456',
    );

    describe('Customer and review retrieval with ownership validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        removeReviewMock.mockResolvedValue(undefined);
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-123');
        expect(idCreateMock).toHaveBeenCalledWith('tenant-456');
      });

      it('should find review by ID before deletion', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('review-123');
        expect(findByIdMock).toHaveBeenCalledTimes(1);
      });

      it('should validate review ownership by customer ID', async () => {
        await handler.execute(baseCommand);

        expect(mockReview.getCustomerIdValue).toHaveBeenCalledTimes(1);
      });

      it('should handle valid customer, review, and ownership', async () => {
        const validCommand = new DeleteCustomerReviewProductDto(
          'valid-customer-888',
          'valid-review-999',
          'valid-tenant-777',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('valid-customer-888');
        removeReviewMock.mockResolvedValue(undefined);

        await handler.execute(validCommand);

        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(mockReview.getCustomerIdValue).toHaveBeenCalledTimes(1);
      });

      it('should reject deletion if ownership does not match', async () => {
        mockReview.getCustomerIdValue.mockReturnValue('different-customer-id');

        await expect(handler.execute(baseCommand)).rejects.toThrow();
      });
    });

    describe('Review removal and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        removeReviewMock.mockResolvedValue(undefined);
      });

      it('should call Customer.removeCustomerReviewProduct with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(removeCustomerReviewProductMock).toHaveBeenCalledWith(
          mockReview,
          mockCustomer,
        );
      });

      it('should remove review with valid data', async () => {
        const removeCommand = new DeleteCustomerReviewProductDto(
          'customer-delete-001',
          'review-delete-001',
          'tenant-delete-001',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('customer-delete-001');
        removeReviewMock.mockResolvedValue(undefined);

        await handler.execute(removeCommand);

        expect(removeCustomerReviewProductMock).toHaveBeenCalledWith(
          mockReview,
          mockCustomer,
        );
      });

      it('should handle multiple review removals', async () => {
        const command1 = new DeleteCustomerReviewProductDto(
          'customer-multi-1',
          'review-multi-1',
          'tenant-multi-1',
        );
        const command2 = new DeleteCustomerReviewProductDto(
          'customer-multi-2',
          'review-multi-2',
          'tenant-multi-2',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue
          .mockReturnValueOnce('customer-multi-1')
          .mockReturnValueOnce('customer-multi-2');
        removeReviewMock.mockResolvedValue(undefined);

        await handler.execute(command1);
        await handler.execute(command2);

        expect(removeCustomerReviewProductMock).toHaveBeenCalledTimes(2);
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('customer-123');
        removeReviewMock.mockResolvedValue(undefined);
      });

      it('should remove review from repository', async () => {
        await handler.execute(baseCommand);

        expect(removeReviewMock).toHaveBeenCalledTimes(1);
      });

      it('should handle repository removal successfully', async () => {
        await handler.execute(baseCommand);

        expect(removeReviewMock).toHaveBeenCalledTimes(1);
      });

      it('should propagate repository removal errors', async () => {
        const repositoryError = new Error('Database removal failed');
        removeReviewMock.mockRejectedValue(repositoryError);

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
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('customer-123');
        removeReviewMock.mockResolvedValue(undefined);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should commit events after review removal', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository persistence', async () => {
        jest.clearAllMocks();

        // Re-setup mocks after clear
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('customer-123');
        removeReviewMock.mockResolvedValue(undefined);
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);

        await handler.execute(baseCommand);

        expect(removeReviewMock).toHaveBeenCalled();
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

      it('should propagate review retrieval errors', async () => {
        const retrieverError = new Error('Review database read failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockRejectedValue(retrieverError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          retrieverError,
        );
      });

      it('should propagate ownership validation errors', async () => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('wrong-customer-id');

        await expect(handler.execute(baseCommand)).rejects.toThrow();
      });

      it('should propagate Customer.removeCustomerReviewProduct errors', async () => {
        const removeError = new Error('Failed to remove review from domain');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        removeCustomerReviewProductMock.mockImplementation(() => {
          throw removeError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(removeError);
      });

      it('should propagate repository removal errors to caller', async () => {
        const repoError = new Error('Cannot remove review from database');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        removeReviewMock.mockRejectedValue(repoError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(repoError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete review deletion flow', async () => {
        const completeCommand = new DeleteCustomerReviewProductDto(
          'customer-complete-delete',
          'review-complete-delete',
          'tenant-complete-delete',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue(
          'customer-complete-delete',
        );
        removeReviewMock.mockResolvedValue(undefined);

        await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(3);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(mockReview.getCustomerIdValue).toHaveBeenCalledTimes(1);
        expect(removeCustomerReviewProductMock).toHaveBeenCalledTimes(1);
        expect(removeReviewMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });
    });

    describe('Business logic validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        removeReviewMock.mockResolvedValue(undefined);
      });

      it('should remove a review and commit events exactly once', async () => {
        await handler.execute(baseCommand);

        expect(removeCustomerReviewProductMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent review deletions', async () => {
        const command1 = new DeleteCustomerReviewProductDto(
          'customer-concurrent-1',
          'review-concurrent-1',
          'tenant-concurrent-1',
        );
        const command2 = new DeleteCustomerReviewProductDto(
          'customer-concurrent-2',
          'review-concurrent-2',
          'tenant-concurrent-2',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue
          .mockReturnValueOnce('customer-concurrent-1')
          .mockReturnValueOnce('customer-concurrent-2');
        removeReviewMock.mockResolvedValue(undefined);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(6);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(findByIdMock).toHaveBeenCalledTimes(2);
        expect(mockReview.getCustomerIdValue).toHaveBeenCalledTimes(2);
        expect(removeCustomerReviewProductMock).toHaveBeenCalledTimes(2);
        expect(removeReviewMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeUndefined();
        expect(result2).toBeUndefined();
      });

      it('should verify ownership check before deletion', async () => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        mockReview.getCustomerIdValue.mockReturnValue('customer-123');
        removeReviewMock.mockResolvedValue(undefined);

        await handler.execute(baseCommand);

        const ownershipCheckCall =
          mockReview.getCustomerIdValue.mock.invocationCallOrder[0];
        const removeCall =
          removeCustomerReviewProductMock.mock.invocationCallOrder[0];

        expect(ownershipCheckCall).toBeLessThan(removeCall);
      });
    });
  });
});
