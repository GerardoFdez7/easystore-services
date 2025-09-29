import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateVariantHandler } from '../create-variant.handler';
import { CreateVariantDTO } from '../create-variant.dto';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { Id, TypeEnum } from '../../../../../aggregates/value-objects';

interface MockProduct {
  commit: jest.Mock;
  get: jest.Mock;
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
      get: jest.fn(),
    };

    mockUpdatedProduct = {
      commit: jest.fn(),
      get: jest.fn(),
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
      dimension: {
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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

    describe('Product type validation', () => {
      describe('Digital products', () => {
        beforeEach(() => {
          findByIdMock.mockResolvedValue(mockProduct as never);
          mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.DIGITAL });
        });

        it('should throw BadRequestException when digital product variant has weight', async () => {
          const digitalVariantWithWeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: undefined,
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(digitalVariantWithWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Digital products cannot have weight or dimensions.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when digital product variant has dimensions', async () => {
          const digitalVariantWithDimensions: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: undefined,
              dimension: {
                height: 10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(digitalVariantWithDimensions),
          ).rejects.toThrow(
            new BadRequestException(
              'Digital products cannot have weight or dimensions.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when digital product variant has both weight and dimensions', async () => {
          const digitalVariantWithBoth: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: 10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(handler.execute(digitalVariantWithBoth)).rejects.toThrow(
            new BadRequestException(
              'Digital products cannot have weight or dimensions.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should successfully create variant for digital product without weight and dimensions', async () => {
          const digitalVariant: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: undefined,
              dimension: undefined,
            },
          } as unknown as CreateVariantDTO;

          mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);

          const result = await handler.execute(digitalVariant);

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(fromAddVariantDtoMock).toHaveBeenCalledWith(
            mockProduct,
            digitalVariant.variant,
          );
          expect(result).toEqual({ id: 'product-id' });
        });
      });

      describe('Physical products', () => {
        beforeEach(() => {
          findByIdMock.mockResolvedValue(mockProduct as never);
          mockProduct.get.mockReturnValue({
            getValue: () => TypeEnum.PHYSICAL,
          });
          mergeObjectContextMock.mockReturnValue(mockUpdatedProduct as never);
        });

        it('should throw BadRequestException when physical product variant has no weight', async () => {
          const physicalVariantNoWeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: null,
              dimension: {
                height: 10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantNoWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight property is required for physical products',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has undefined weight', async () => {
          const physicalVariantUndefinedWeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: undefined,
              dimension: {
                height: 10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantUndefinedWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight property is required for physical products',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has no dimensions', async () => {
          const physicalVariantNoDimensions: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: null,
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantNoDimensions),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension property is required for physical products',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has undefined dimensions', async () => {
          const physicalVariantUndefinedDimensions: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: undefined,
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantUndefinedDimensions),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension property is required for physical products',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has zero weight', async () => {
          const physicalVariantZeroWeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 0,
              dimension: {
                height: 10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantZeroWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has negative weight', async () => {
          const physicalVariantNegativeWeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: -1.5,
              dimension: {
                height: 10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantNegativeWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has zero height', async () => {
          const physicalVariantZeroHeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: 0,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantZeroHeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension height must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has negative height', async () => {
          const physicalVariantNegativeHeight: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: -10,
                width: 20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantNegativeHeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension height must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has zero width', async () => {
          const physicalVariantZeroWidth: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: 10,
                width: 0,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantZeroWidth),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension width must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has negative width', async () => {
          const physicalVariantNegativeWidth: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: 10,
                width: -20,
                length: 30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantNegativeWidth),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension width must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has zero length', async () => {
          const physicalVariantZeroLength: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: 10,
                width: 20,
                length: 0,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantZeroLength),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension length must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when physical product variant has negative length', async () => {
          const physicalVariantNegativeLength: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 1.5,
              dimension: {
                height: 10,
                width: 20,
                length: -30,
              },
            },
          } as unknown as CreateVariantDTO;

          await expect(
            handler.execute(physicalVariantNegativeLength),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension length must be a positive value for physical products.',
            ),
          );

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(updateMock).not.toHaveBeenCalled();
        });

        it('should successfully create variant for physical product with valid weight and dimensions', async () => {
          const validPhysicalVariant: CreateVariantDTO = {
            variant: {
              ...baseVariant,
              weight: 2.5,
              dimension: {
                height: 15,
                width: 25,
                length: 35,
              },
            },
          } as unknown as CreateVariantDTO;

          const result = await handler.execute(validPhysicalVariant);

          expect(mockProduct.get).toHaveBeenCalledWith('productType');
          expect(fromAddVariantDtoMock).toHaveBeenCalledWith(
            mockProduct,
            validPhysicalVariant.variant,
          );
          expect(updateMock).toHaveBeenCalled();
          expect(mockUpdatedProduct.commit).toHaveBeenCalled();
          expect(result).toEqual({ id: 'product-id' });
        });
      });
    });

    describe('Variant mapping and processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockProduct as never);
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.DIGITAL });
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
            dimension: {
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
            dimension: {
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
        mockProduct.get.mockReturnValue({ getValue: () => TypeEnum.PHYSICAL });
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
