import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateVariantHandler } from '../create-variant.handler';
import { CreateVariantDTO } from '../create-variant.dto';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { Id } from '../../../../../aggregates/value-objects/id.value-object';

// Define a minimal Product interface for testing
interface MockProduct {
  get: jest.Mock;
  commit: jest.Mock;
}

describe('CreateVariantHandler', () => {
  let handler: CreateVariantHandler;
  let productRepository: jest.Mocked<IProductRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockProduct: MockProduct;
  let mockUpdatedProduct: MockProduct;

  // Store references to avoid unbound method issues
  let findByIdMock: jest.Mock;
  let saveMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let addVariantToProductMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    // Create mock functions
    findByIdMock = jest.fn();
    saveMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    // Create mock implementations
    productRepository = {
      findById: findByIdMock,
      save: saveMock,
    } as unknown as jest.Mocked<IProductRepository>;

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    // Create mock product
    mockProduct = {
      get: jest.fn(),
      commit: jest.fn(),
    };

    mockUpdatedProduct = {
      get: mockProduct.get,
      commit: jest.fn(),
    };

    // Mock static methods
    jest
      .spyOn(Id, 'create')
      .mockImplementation((id: string) => ({ value: id }) as unknown as Id);
    addVariantToProductMock = jest
      .spyOn(ProductMapper, 'addVariantToProduct')
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
    const baseCommand: CreateVariantDTO = {
      productId: 'product-123',
      variant: {
        sku: 'VAR-001',
        price: 29.99,
        stock: 100,
        weight: 1.5,
        dimensions: {
          height: 10,
          width: 20,
          depth: 30,
        },
      },
    } as unknown as CreateVariantDTO;

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      findByIdMock.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(baseCommand)).rejects.toThrow(
        new NotFoundException(
          `Product with ID ${baseCommand.productId} not found`,
        ),
      );

      expect(findByIdMock).toHaveBeenCalledWith({
        value: baseCommand.productId,
      } as unknown as Id);
      expect(saveMock).not.toHaveBeenCalled();
    });

    describe('DIGITAL product type', () => {
      beforeEach(() => {
        mockProduct.get.mockReturnValue({ getValue: () => 'DIGITAL' });
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should set weight and dimensions to null for DIGITAL products', async () => {
        // Act
        const result = await handler.execute(baseCommand);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            sku: 'VAR-001',
            price: 29.99,
            stock: 100,
            weight: null,
            dimensions: null,
          }),
        );

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockUpdatedProduct);
        expect(saveMock).toHaveBeenCalledWith(mockUpdatedProduct);
        expect(mockUpdatedProduct.commit).toHaveBeenCalled();
        expect(result).toEqual({ id: 'product-id' });
      });
    });

    describe('PHYSICAL product type', () => {
      beforeEach(() => {
        mockProduct.get.mockReturnValue({ getValue: () => 'PHYSICAL' });
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should preserve valid weight and dimensions for PHYSICAL products', async () => {
        // Act
        const result = await handler.execute(baseCommand);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            sku: 'VAR-001',
            price: 29.99,
            stock: 100,
            weight: 1.5,
            dimensions: {
              height: 10,
              width: 20,
              depth: 30,
            },
          }),
        );

        expect(result).toEqual({ id: 'product-id' });
      });

      it('should set weight to 0 when weight is null or undefined', async () => {
        // Arrange
        const commandWithoutWeight: CreateVariantDTO = {
          ...baseCommand,
          variant: {
            ...baseCommand.variant,
            weight: null,
          },
        } as CreateVariantDTO;

        // Act
        await handler.execute(commandWithoutWeight);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            weight: 0,
          }),
        );
      });

      it('should set weight to 0 when weight is negative', async () => {
        // Arrange
        const commandWithNegativeWeight: CreateVariantDTO = {
          ...baseCommand,
          variant: {
            ...baseCommand.variant,
            weight: -5,
          },
        } as CreateVariantDTO;

        // Act
        await handler.execute(commandWithNegativeWeight);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            weight: 0,
          }),
        );
      });

      it('should set default dimensions when dimensions are null', async () => {
        // Arrange
        const commandWithoutDimensions: CreateVariantDTO = {
          ...baseCommand,
          variant: {
            ...baseCommand.variant,
            dimensions: null,
          },
        } as CreateVariantDTO;

        // Act
        await handler.execute(commandWithoutDimensions);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            dimensions: {
              height: 0,
              width: 0,
              depth: 0,
            },
          }),
        );
      });

      it('should normalize negative dimensions to 0', async () => {
        // Arrange
        const commandWithNegativeDimensions: CreateVariantDTO = {
          ...baseCommand,
          variant: {
            ...baseCommand.variant,
            dimensions: {
              height: -10,
              width: 20,
              depth: -30,
            },
          },
        } as CreateVariantDTO;

        // Act
        await handler.execute(commandWithNegativeDimensions);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            dimensions: {
              height: 0,
              width: 20,
              depth: 0,
            },
          }),
        );
      });

      it('should normalize zero dimensions to 0', async () => {
        // Arrange
        const commandWithZeroDimensions: CreateVariantDTO = {
          ...baseCommand,
          variant: {
            ...baseCommand.variant,
            dimensions: {
              height: 0,
              width: 0,
              depth: 0,
            },
          },
        } as CreateVariantDTO;

        // Act
        await handler.execute(commandWithZeroDimensions);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          expect.objectContaining({
            dimensions: {
              height: 0,
              width: 0,
              depth: 0,
            },
          }),
        );
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        mockProduct.get.mockReturnValue({ getValue: () => 'DIGITAL' });
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should merge object context with event publisher', async () => {
        // Act
        await handler.execute(baseCommand);

        // Assert
        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockUpdatedProduct);
      });

      it('should commit events after saving', async () => {
        // Act
        await handler.execute(baseCommand);

        // Assert
        expect(mockUpdatedProduct.commit).toHaveBeenCalled();

        // Verify order: save should be called before commit
        const saveCallOrder = saveMock.mock.invocationCallOrder[0];
        const commitCallOrder =
          mockUpdatedProduct.commit.mock.invocationCallOrder[0];
        expect(saveCallOrder).toBeLessThan(commitCallOrder);
      });
    });

    describe('Repository interactions', () => {
      beforeEach(() => {
        mockProduct.get.mockReturnValue({ getValue: () => 'PHYSICAL' });
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
      });

      it('should save the updated product to repository', async () => {
        // Act
        await handler.execute(baseCommand);

        // Assert
        expect(saveMock).toHaveBeenCalledWith(mockUpdatedProduct);
      });

      it('should return the mapped DTO', async () => {
        // Arrange
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as ProductDTO;
        toDtoMock.mockReturnValue(expectedDto);

        // Act
        const result = await handler.execute(baseCommand);

        // Assert
        expect(toDtoMock).toHaveBeenCalledWith(mockUpdatedProduct);
        expect(result).toBe(expectedDto);
      });
    });

    describe('Unknown product type', () => {
      it('should not modify variant for unknown product types', async () => {
        // Arrange
        mockProduct.get.mockReturnValue({ getValue: () => 'UNKNOWN_TYPE' });
        findByIdMock.mockResolvedValue(mockProduct as never);
        mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);

        // Act
        await handler.execute(baseCommand);

        // Assert
        expect(addVariantToProductMock).toHaveBeenCalledWith(
          mockProduct,
          baseCommand.variant,
        );
      });
    });
  });
});
