import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateVariantHandler } from '../create-variant.handler';
import { CreateVariantDTO } from '../create-variant.dto';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { Id } from '../../../../../aggregates/value-objects';

interface MockProduct {
  commit: jest.Mock;
}

describe('CreateVariantHandler', () => {
  let handler: CreateVariantHandler;
  let productRepository: jest.Mocked<IProductRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockProduct: MockProduct;
  let mockUpdatedProduct: MockProduct;

  let findByIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let fromAddVariantDtoMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;

  beforeEach(async () => {
    findByIdMock = jest.fn();
    updateMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    productRepository = {
      findById: findByIdMock,
      update: updateMock,
    } as unknown as jest.Mocked<IProductRepository>;

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    mockProduct = {
      commit: jest.fn(),
    };

    mockUpdatedProduct = {
      commit: jest.fn(),
    };

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockImplementation((id: string) => ({ value: id }) as unknown as Id);
    fromAddVariantDtoMock = jest
      .spyOn(ProductMapper, 'fromAddVariantDto')
      .mockReturnValue(mockUpdatedProduct as never);
    toDtoMock = jest
      .spyOn(ProductMapper, 'toDto')
      .mockReturnValue({ id: 'product-id' } as ProductDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVariantHandler,
        {
          provide: 'IProductRepository',
          useValue: productRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<CreateVariantHandler>(CreateVariantHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseVariant = {
      productId: 'product-123',
      tenantId: 'tenant-456',
      sku: 'VAR-001',
      price: 29.99,
      stock: 100,
      weight: 1.5,
      dimensions: {
        height: 10,
        width: 20,
        depth: 30,
      },
    };

    const baseCommand: CreateVariantDTO = {
      variant: baseVariant,
    } as unknown as CreateVariantDTO;

    describe('Product finding and validation', () => {
      it('should throw NotFoundException when product does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          new NotFoundException(
            `Product with ID ${baseVariant.productId} not found`,
          ),
        );

        expect(idCreateMock).toHaveBeenCalledWith(baseVariant.tenantId);
        expect(idCreateMock).toHaveBeenCalledWith(baseVariant.productId);
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: baseVariant.tenantId },
          { value: baseVariant.productId },
        );
        expect(updateMock).not.toHaveBeenCalled();
      });

      it('should find product with correct tenant and product IDs', async () => {
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenNthCalledWith(1, baseVariant.tenantId);
        expect(idCreateMock).toHaveBeenNthCalledWith(2, baseVariant.productId);
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: baseVariant.tenantId },
          { value: baseVariant.productId },
        );
      });
    });

    describe('Variant mapping and processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should call ProductMapper.fromAddVariantDto with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(fromAddVariantDtoMock).toHaveBeenCalledWith(
          mockProduct,
          baseVariant,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockUpdatedProduct);
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should update the product in repository', async () => {
        await handler.execute(baseCommand);

        expect(updateMock).toHaveBeenCalledWith(
          { value: baseVariant.tenantId },
          { value: baseVariant.productId },
          mockUpdatedProduct,
        );
      });

      it('should update after mapping and before committing events', async () => {
        await handler.execute(baseCommand);

        const fromAddVariantDtoOrder =
          fromAddVariantDtoMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder =
          mockUpdatedProduct.commit.mock.invocationCallOrder[0];

        expect(fromAddVariantDtoOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(updateOrder);
        expect(updateOrder).toBeLessThan(commitOrder);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should commit events after updating', async () => {
        await handler.execute(baseCommand);

        expect(mockUpdatedProduct.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after all operations', async () => {
        await handler.execute(baseCommand);

        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder =
          mockUpdatedProduct.commit.mock.invocationCallOrder[0];
        expect(updateOrder).toBeLessThan(commitOrder);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should convert updated product to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockUpdatedProduct);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
          variants: [],
        } as ProductDTO;
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle variant with minimal required fields', async () => {
        const minimalCommand: CreateVariantDTO = {
          variant: {
            productId: 'prod-1',
            tenantId: 'tenant-1',
            sku: 'SKU-001',
            price: 10,
            stock: 0,
          },
        } as unknown as CreateVariantDTO;

        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);

        const result = await handler.execute(minimalCommand);

        expect(fromAddVariantDtoMock).toHaveBeenCalledWith(
          mockProduct,
          minimalCommand.variant,
        );
        expect(result).toEqual({ id: 'product-id' });
      });

      it('should handle variant with all optional fields', async () => {
        const fullCommand: CreateVariantDTO = {
          variant: {
            productId: 'prod-1',
            tenantId: 'tenant-1',
            sku: 'SKU-001',
            price: 99.99,
            stock: 100,
            weight: 2.5,
            dimensions: {
              height: 15,
              width: 25,
              depth: 35,
            },
            attributes: {
              color: 'red',
              size: 'large',
            },
            images: ['image1.jpg', 'image2.jpg'],
            barcode: '1234567890',
          },
        } as unknown as CreateVariantDTO;

        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);

        const result = await handler.execute(fullCommand);

        expect(fromAddVariantDtoMock).toHaveBeenCalledWith(
          mockProduct,
          fullCommand.variant,
        );
        expect(result).toEqual({ id: 'product-id' });
      });

      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        findByIdMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should propagate update errors', async () => {
        const updateError = new Error('Failed to update product');
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
        updateMock.mockRejectedValue(updateError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(updateError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete variant creation flow', async () => {
        const completeCommand: CreateVariantDTO = {
          variant: {
            productId: 'product-789',
            tenantId: 'tenant-123',
            sku: 'VAR-COMPLETE',
            price: 49.99,
            stock: 50,
            weight: 1.0,
            dimensions: {
              height: 5,
              width: 10,
              depth: 15,
            },
          },
        } as unknown as CreateVariantDTO;

        const expectedDto: ProductDTO = {
          id: 'product-789',
          name: 'Complete Product',
          variants: [
            {
              sku: 'VAR-COMPLETE',
              price: 49.99,
              stock: 50,
            },
          ],
        } as unknown as ProductDTO;

        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(4); // Called twice for findById and twice for update
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(fromAddVariantDtoMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockUpdatedProduct.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
