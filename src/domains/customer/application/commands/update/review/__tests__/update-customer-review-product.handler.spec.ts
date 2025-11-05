import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateCustomerReviewProductHandler } from '../update-customer-review-product.handler';
import { UpdateCustomerReviewProductDto } from '../update-customer-review-product.dto';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { ICustomerReviewProductRepository } from '../../../../../aggregates/repositories/customer-review-product.interface';
import { Customer } from '../../../../../aggregates/entities/customer.entity';
import { CustomerReviewProductDTO } from '../../../../mappers/review/customer-review-product.dto';
import { CustomerReviewProductMapper } from '../../../../mappers/review/customer-review-product.mapper';
import { Id } from '@shared/value-objects';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

interface MockReview {
  getCustomerIdValue: jest.Mock;
}

describe('UpdateCustomerReviewProductHandler', () => {
  let handler: UpdateCustomerReviewProductHandler;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let reviewRepository: jest.Mocked<ICustomerReviewProductRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;
  let mockReview: MockReview;

  let findCustomerByIdMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let reviewUpdateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let updateCustomerReviewProductMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;
  let defaultDto: CustomerReviewProductDTO;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    findByIdMock = jest.fn();
    reviewUpdateMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: jest.fn(),
      findCustomerById: findCustomerByIdMock,
      update: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    reviewRepository = {
      create: jest.fn(),
      update: reviewUpdateMock,
      findById: findByIdMock,
      findMany: jest.fn(),
      removeReview: jest.fn(),
    } as unknown as jest.Mocked<ICustomerReviewProductRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mockReview = {
      getCustomerIdValue: jest.fn().mockReturnValue('customer-id-123'),
    };

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    updateCustomerReviewProductMock = jest
      .spyOn(Customer, 'updateCustomerReviewProduct')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .mockReturnValue(mockReview as any);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    defaultDto = {
      id: 'review-id-123',
      ratingCount: 4,
      comment: 'Updated comment',
      customerId: 'customer-id-123',
      variantId: 'variant-id-123',
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    toDtoMock = jest
      .spyOn(CustomerReviewProductMapper, 'toDto')
      .mockReturnValue(defaultDto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerReviewProductHandler,
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

    handler = module.get<UpdateCustomerReviewProductHandler>(
      UpdateCustomerReviewProductHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseReviewUpdate = {
      id: 'review-id-123',
      ratingCount: 4,
      comment: 'Updated review',
    };

    const baseCommand = new UpdateCustomerReviewProductDto(
      baseReviewUpdate,
      'customer-123',
      'tenant-456',
    );

    describe('Customer and review retrieval', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-123');
        expect(idCreateMock).toHaveBeenCalledWith('tenant-456');
      });

      it('should find review by ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('review-id-123');
        expect(findByIdMock).toHaveBeenCalledTimes(1);
      });

      it('should handle valid customer and review IDs', async () => {
        const validCommand = new UpdateCustomerReviewProductDto(
          {
            id: 'valid-review-999',
            ratingCount: 3,
            comment: 'Valid update',
          },
          'valid-customer-999',
          'valid-tenant-888',
        );
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);

        await handler.execute(validCommand);

        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Review update and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);
      });

      it('should call Customer.updateCustomerReviewProduct with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(updateCustomerReviewProductMock).toHaveBeenCalledWith(
          mockReview,
          {
            ratingCount: 4,
            comment: 'Updated review',
          },
          mockCustomer,
        );
      });

      it('should update review with valid data set', async () => {
        const validCommand = new UpdateCustomerReviewProductDto(
          { id: 'review-001', ratingCount: 5, comment: 'Excellent!' },
          'customer-valid-001',
          'tenant-valid-002',
        );

        await handler.execute(validCommand);

        expect(updateCustomerReviewProductMock).toHaveBeenCalledWith(
          mockReview,
          {
            ratingCount: 5,
            comment: 'Excellent!',
          },
          mockCustomer,
        );
      });

      it('should handle different rating updates', async () => {
        const ratingCommand = new UpdateCustomerReviewProductDto(
          { id: 'review-rating', ratingCount: 1, comment: 'Poor' },
          'customer-rating',
          'tenant-rating',
        );

        await handler.execute(ratingCommand);

        expect(updateCustomerReviewProductMock).toHaveBeenCalledWith(
          mockReview,
          {
            ratingCount: 1,
            comment: 'Poor',
          },
          mockCustomer,
        );
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);
      });

      it('should update the review in repository', async () => {
        await handler.execute(baseCommand);

        expect(reviewUpdateMock).toHaveBeenCalledWith(mockReview);
      });

      it('should handle repository update successfully', async () => {
        await handler.execute(baseCommand);

        expect(reviewUpdateMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(mockReview);
      });

      it('should propagate repository update errors', async () => {
        const repositoryError = new Error('Database update failed');
        reviewUpdateMock.mockRejectedValue(repositoryError);

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
        reviewUpdateMock.mockResolvedValue(mockReview as any);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should commit events after review update', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository persistence', async () => {
        await handler.execute(baseCommand);

        const updateOrder = reviewUpdateMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const commitOrder = mockCustomer.commit.mock.invocationCallOrder[0];

        expect(updateOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(commitOrder);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);
      });

      it('should convert review to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockReview);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: CustomerReviewProductDTO = {
          id: 'review-id-updated',
          ratingCount: 4,
          comment: 'Updated review',
          customerId: 'customer-id-123',
          variantId: 'variant-id-123',
          updatedAt: new Date('2024-02-01T00:00:00.000Z'),
        };
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });

      it('should return DTO with correct structure', async () => {
        const result = await handler.execute(baseCommand);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('ratingCount');
        expect(result).toHaveProperty('comment');
        expect(result).toHaveProperty('customerId');
        expect(result).toHaveProperty('variantId');
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

      it('should propagate Customer.updateCustomerReviewProduct errors', async () => {
        const reviewError = new Error('Failed to update review');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        updateCustomerReviewProductMock.mockImplementation(() => {
          throw reviewError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(reviewError);
      });

      it('should propagate mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete review update flow', async () => {
        const completeCommand = new UpdateCustomerReviewProductDto(
          { id: 'review-complete', ratingCount: 5, comment: 'Perfect!' },
          'customer-complete',
          'tenant-complete',
        );

        const expectedDto: CustomerReviewProductDTO = {
          id: 'review-id-complete',
          ratingCount: 5,
          comment: 'Perfect!',
          customerId: 'customer-complete',
          variantId: 'variant-id-123',
          updatedAt: new Date('2024-03-01T00:00:00.000Z'),
        };

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(3);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(updateCustomerReviewProductMock).toHaveBeenCalledTimes(1);
        expect(reviewUpdateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });

    describe('Business logic validation', () => {
      it('should update a review and commit events once', async () => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);

        await handler.execute(baseCommand);

        expect(updateCustomerReviewProductMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent review updates', async () => {
        const command1 = new UpdateCustomerReviewProductDto(
          { id: 'review-1', ratingCount: 5, comment: 'Great!' },
          'customer-1',
          'tenant-1',
        );
        const command2 = new UpdateCustomerReviewProductDto(
          { id: 'review-2', ratingCount: 3, comment: 'Good' },
          'customer-2',
          'tenant-2',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        findByIdMock.mockResolvedValue(mockReview as any);
        reviewUpdateMock.mockResolvedValue(mockReview as any);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(6);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(findByIdMock).toHaveBeenCalledTimes(2);
        expect(updateCustomerReviewProductMock).toHaveBeenCalledTimes(2);
        expect(reviewUpdateMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });
  });
});
