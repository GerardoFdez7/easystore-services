import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateCustomerReviewProductHandler } from '../create-customer-review-product.handler';
import { CreateCustomerReviewProductDto } from '../create-customer-review-product.dto';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { ICustomerReviewProductRepository } from '../../../../../aggregates/repositories/customer-review-product.interface';
import { Customer } from '../../../../../aggregates/entities/customer.entity';
import { CustomerReviewProductDTO } from '../../../../mappers/review/customer-review-product.dto';
import { CustomerReviewProductMapper } from '../../../../mappers/review/customer-review-product.mapper';
import { Id } from '@shared/value-objects';

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

interface MockReview {
  getCustomerIdValue: jest.Mock;
}

describe('CreateCustomerReviewProductHandler', () => {
  let handler: CreateCustomerReviewProductHandler;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let reviewRepository: jest.Mocked<ICustomerReviewProductRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;
  let mockReview: MockReview;

  let findCustomerByIdMock: jest.Mock;
  let reviewCreateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let addCustomerReviewProductMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;
  let defaultDto: CustomerReviewProductDTO;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    reviewCreateMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: jest.fn(),
      findCustomerById: findCustomerByIdMock,
      update: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    reviewRepository = {
      create: reviewCreateMock,
      update: jest.fn(),
      findById: jest.fn(),
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

    addCustomerReviewProductMock = jest
      .spyOn(Customer, 'addCustomerReviewProduct')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      .mockReturnValue(mockReview as any);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    defaultDto = {
      id: 'review-id-123',
      ratingCount: 5,
      comment: 'Great product!',
      customerId: 'customer-id-123',
      variantId: 'variant-id-123',
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    toDtoMock = jest
      .spyOn(CustomerReviewProductMapper, 'toDto')
      .mockReturnValue(defaultDto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerReviewProductHandler,
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

    handler = module.get<CreateCustomerReviewProductHandler>(
      CreateCustomerReviewProductHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseReviewData = {
      ratingCount: 4,
      comment: 'Good product',
      variantId: 'variant-123',
    };

    const baseCommand = new CreateCustomerReviewProductDto(
      baseReviewData,
      'customer-123',
      'tenant-456',
    );

    describe('Customer retrieval and validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('customer-123');
        expect(idCreateMock).toHaveBeenCalledWith('tenant-456');
      });

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new CreateCustomerReviewProductDto(
          { ratingCount: 3, comment: 'Valid', variantId: 'variant-999' },
          'valid-customer-999',
          'valid-tenant-888',
        );
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);

        await handler.execute(validCommand);

        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Review creation and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
      });

      it('should call Customer.addCustomerReviewProduct with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(addCustomerReviewProductMock).toHaveBeenCalledWith(
          baseReviewData,
          mockCustomer,
        );
      });

      it('should create review with valid data set', async () => {
        const validCommand = new CreateCustomerReviewProductDto(
          { ratingCount: 5, comment: 'Excellent!', variantId: 'variant-001' },
          'customer-valid-001',
          'tenant-valid-002',
        );

        await handler.execute(validCommand);

        expect(addCustomerReviewProductMock).toHaveBeenCalledWith(
          { ratingCount: 5, comment: 'Excellent!', variantId: 'variant-001' },
          mockCustomer,
        );
      });

      it('should handle different rating counts', async () => {
        const ratingCommand = new CreateCustomerReviewProductDto(
          { ratingCount: 1, comment: 'Poor', variantId: 'variant-low' },
          'customer-rating',
          'tenant-rating',
        );

        await handler.execute(ratingCommand);

        expect(addCustomerReviewProductMock).toHaveBeenCalledWith(
          { ratingCount: 1, comment: 'Poor', variantId: 'variant-low' },
          mockCustomer,
        );
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
      });

      it('should persist the review in repository', async () => {
        await handler.execute(baseCommand);

        expect(reviewCreateMock).toHaveBeenCalledWith(mockReview);
      });

      it('should handle repository creation successfully', async () => {
        await handler.execute(baseCommand);

        expect(reviewCreateMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(mockReview);
      });

      it('should propagate repository creation errors', async () => {
        const repositoryError = new Error('Database write failed');
        reviewCreateMock.mockRejectedValue(repositoryError);

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
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should commit events after review creation', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository persistence', async () => {
        await handler.execute(baseCommand);

        const createOrder = reviewCreateMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const commitOrder = mockCustomer.commit.mock.invocationCallOrder[0];

        expect(createOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(commitOrder);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
      });

      it('should convert review to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockReview);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: CustomerReviewProductDTO = {
          id: 'review-id-expected',
          ratingCount: 4,
          comment: 'Good product',
          customerId: 'customer-id-123',
          variantId: 'variant-123',
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
        const retrieverError = new Error('Database read failed');
        findCustomerByIdMock.mockRejectedValue(retrieverError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          retrieverError,
        );
      });

      it('should propagate Customer.addCustomerReviewProduct errors', async () => {
        const reviewError = new Error('Failed to add review');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        addCustomerReviewProductMock.mockImplementation(() => {
          throw reviewError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(reviewError);
      });

      it('should propagate mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete review creation flow', async () => {
        const completeCommand = new CreateCustomerReviewProductDto(
          { ratingCount: 5, comment: 'Perfect!', variantId: 'variant-perfect' },
          'customer-complete',
          'tenant-complete',
        );

        const expectedDto: CustomerReviewProductDTO = {
          id: 'review-id-complete',
          ratingCount: 5,
          comment: 'Perfect!',
          customerId: 'customer-complete',
          variantId: 'variant-perfect',
          updatedAt: new Date('2024-03-01T00:00:00.000Z'),
        };

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(2);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(addCustomerReviewProductMock).toHaveBeenCalledTimes(1);
        expect(reviewCreateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });

    describe('Business logic validation', () => {
      it('should create a review and commit events once', async () => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);

        await handler.execute(baseCommand);

        expect(addCustomerReviewProductMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent review creation requests', async () => {
        const command1 = new CreateCustomerReviewProductDto(
          { ratingCount: 5, comment: 'Great!', variantId: 'variant-1' },
          'customer-1',
          'tenant-1',
        );
        const command2 = new CreateCustomerReviewProductDto(
          { ratingCount: 3, comment: 'Good', variantId: 'variant-2' },
          'customer-2',
          'tenant-2',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        reviewCreateMock.mockResolvedValue(mockReview as unknown);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(4);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(addCustomerReviewProductMock).toHaveBeenCalledTimes(2);
        expect(reviewCreateMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });
  });
});
