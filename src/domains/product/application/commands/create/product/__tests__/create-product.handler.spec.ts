import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CreateProductHandler } from '../create-product.handler';
import { CreateProductDTO } from '../create-product.dto';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { TypeEnum } from '../../../../../aggregates/value-objects';

interface MockProduct {
  commit: jest.Mock;
}

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let _mockProductRepository: jest.Mocked<IProductRepository>;
  let _mockEventPublisher: EventPublisher;

  // Mock functions
  const createMock = jest.fn();
  const mergeObjectContextMock = jest.fn();
  const fromCreateDtoMock = jest.fn();
  const toDtoMock = jest.fn();

  const mockProduct: MockProduct = {
    commit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductHandler,
        {
          provide: 'IProductRepository',
          useValue: {
            create: createMock,
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: mergeObjectContextMock,
          },
        },
      ],
    }).compile();

    handler = module.get<CreateProductHandler>(CreateProductHandler);
    _mockProductRepository = module.get('IProductRepository');
    _mockEventPublisher = module.get<EventPublisher>(EventPublisher);

    // Setup ProductMapper mocks
    jest
      .spyOn(ProductMapper, 'fromCreateDto')
      .mockImplementation(fromCreateDtoMock);
    jest.spyOn(ProductMapper, 'toDto').mockImplementation(toDtoMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseProductData = {
      name: 'Test Product',
      description: 'Test Description',
      tenantId: 'tenant-123',
      productType: TypeEnum.PHYSICAL,
      variants: [
        {
          sku: 'TEST-001',
          price: 29.99,
          stock: 100,
          weight: 1.5,
          dimension: {
            height: 10,
            width: 20,
            length: 30,
          },
        },
      ],
    };

    const baseCommand: CreateProductDTO = {
      data: baseProductData,
    } as unknown as CreateProductDTO;

    describe('Product type validation for variants', () => {
      describe('Digital products', () => {
        it('should throw BadRequestException when digital product variant has weight', async () => {
          const digitalProductWithWeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.DIGITAL,
              variants: [
                {
                  sku: 'DIGITAL-001',
                  price: 19.99,
                  stock: 50,
                  weight: 1.5,
                  dimension: undefined,
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(digitalProductWithWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Digital products cannot have weight or dimensions.',
            ),
          );
        });

        it('should throw BadRequestException when digital product variant has dimensions', async () => {
          const digitalProductWithDimensions: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.DIGITAL,
              variants: [
                {
                  sku: 'DIGITAL-002',
                  price: 19.99,
                  stock: 50,
                  weight: undefined,
                  dimension: {
                    height: 5,
                    width: 10,
                    length: 15,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(digitalProductWithDimensions),
          ).rejects.toThrow(
            new BadRequestException(
              'Digital products cannot have weight or dimensions.',
            ),
          );
        });

        it('should throw BadRequestException when digital product variant has both weight and dimensions', async () => {
          const digitalProductWithBoth: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.DIGITAL,
              variants: [
                {
                  sku: 'DIGITAL-003',
                  price: 19.99,
                  stock: 50,
                  weight: 1.0,
                  dimension: {
                    height: 5,
                    width: 10,
                    length: 15,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(handler.execute(digitalProductWithBoth)).rejects.toThrow(
            new BadRequestException(
              'Digital products cannot have weight or dimensions.',
            ),
          );
        });

        it('should successfully create digital product without weight and dimensions', async () => {
          const digitalProduct: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.DIGITAL,
              variants: [
                {
                  sku: 'DIGITAL-004',
                  price: 19.99,
                  stock: 50,
                },
              ],
            },
          } as unknown as CreateProductDTO;

          const expectedDto: ProductDTO = {
            id: 'product-id',
            name: 'Test Product',
          } as unknown as ProductDTO;

          fromCreateDtoMock.mockReturnValue(mockProduct);
          mergeObjectContextMock.mockReturnValue(mockProduct);
          toDtoMock.mockReturnValue(expectedDto);

          const result = await handler.execute(digitalProduct);

          expect(result).toEqual(expectedDto);
          expect(createMock).toHaveBeenCalledWith(mockProduct);
          expect(mockProduct.commit).toHaveBeenCalledTimes(1);
        });
      });

      describe('Physical products', () => {
        it('should throw BadRequestException when physical product variant has no weight', async () => {
          const physicalProductNoWeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-001',
                  price: 29.99,
                  stock: 100,
                  weight: null,
                  dimension: {
                    height: 10,
                    width: 20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductNoWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight property is required for physical products',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has undefined weight', async () => {
          const physicalProductUndefinedWeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-002',
                  price: 29.99,
                  stock: 100,
                  weight: undefined,
                  dimension: {
                    height: 10,
                    width: 20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductUndefinedWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight property is required for physical products',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has no dimensions', async () => {
          const physicalProductNoDimensions: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-003',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: null,
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductNoDimensions),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension property is required for physical products',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has undefined dimensions', async () => {
          const physicalProductUndefinedDimensions: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-004',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: undefined,
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductUndefinedDimensions),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension property is required for physical products',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has zero weight', async () => {
          const physicalProductZeroWeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-005',
                  price: 29.99,
                  stock: 100,
                  weight: 0,
                  dimension: {
                    height: 10,
                    width: 20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductZeroWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has negative weight', async () => {
          const physicalProductNegativeWeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-006',
                  price: 29.99,
                  stock: 100,
                  weight: -1.5,
                  dimension: {
                    height: 10,
                    width: 20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductNegativeWeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Weight must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has zero height', async () => {
          const physicalProductZeroHeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-007',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: {
                    height: 0,
                    width: 20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductZeroHeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension height must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has negative height', async () => {
          const physicalProductNegativeHeight: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-008',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: {
                    height: -10,
                    width: 20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductNegativeHeight),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension height must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has zero width', async () => {
          const physicalProductZeroWidth: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-009',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: {
                    height: 10,
                    width: 0,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductZeroWidth),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension width must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has negative width', async () => {
          const physicalProductNegativeWidth: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-010',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: {
                    height: 10,
                    width: -20,
                    length: 30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductNegativeWidth),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension width must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has zero length', async () => {
          const physicalProductZeroLength: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-011',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: {
                    height: 10,
                    width: 20,
                    length: 0,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductZeroLength),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension length must be a positive value for physical products.',
            ),
          );
        });

        it('should throw BadRequestException when physical product variant has negative length', async () => {
          const physicalProductNegativeLength: CreateProductDTO = {
            data: {
              ...baseProductData,
              productType: TypeEnum.PHYSICAL,
              variants: [
                {
                  sku: 'PHYSICAL-012',
                  price: 29.99,
                  stock: 100,
                  weight: 1.5,
                  dimension: {
                    height: 10,
                    width: 20,
                    length: -30,
                  },
                },
              ],
            },
          } as unknown as CreateProductDTO;

          await expect(
            handler.execute(physicalProductNegativeLength),
          ).rejects.toThrow(
            new BadRequestException(
              'Dimension length must be a positive value for physical products.',
            ),
          );
        });

        it('should successfully create physical product with valid weight and dimensions', async () => {
          const expectedDto: ProductDTO = {
            id: 'product-id',
            name: 'Test Product',
          } as unknown as ProductDTO;

          fromCreateDtoMock.mockReturnValue(mockProduct);
          mergeObjectContextMock.mockReturnValue(mockProduct);
          toDtoMock.mockReturnValue(expectedDto);

          const result = await handler.execute(baseCommand);

          expect(result).toEqual(expectedDto);
          expect(createMock).toHaveBeenCalledWith(mockProduct);
          expect(mockProduct.commit).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Product creation flow', () => {
      beforeEach(() => {
        fromCreateDtoMock.mockReturnValue(mockProduct);
        mergeObjectContextMock.mockReturnValue(mockProduct);
      });

      it('should call ProductMapper.fromCreateDto with processed product data', async () => {
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        toDtoMock.mockReturnValue(expectedDto);

        await handler.execute(baseCommand);

        expect(fromCreateDtoMock).toHaveBeenCalledWith({
          ...baseProductData,
          variants: baseProductData.variants,
        });
      });

      it('should merge object context with event publisher', async () => {
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        toDtoMock.mockReturnValue(expectedDto);

        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockProduct);
      });

      it('should persist product through repository', async () => {
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        toDtoMock.mockReturnValue(expectedDto);

        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledWith(mockProduct);
      });

      it('should commit events after creation', async () => {
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        toDtoMock.mockReturnValue(expectedDto);

        await handler.execute(baseCommand);

        expect(mockProduct.commit).toHaveBeenCalledTimes(1);
      });

      it('should return mapped DTO', async () => {
        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockProduct);
        expect(result).toEqual(expectedDto);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle product with no variants', async () => {
        const productWithoutVariants: CreateProductDTO = {
          data: {
            ...baseProductData,
            variants: [],
          },
        } as unknown as CreateProductDTO;

        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        fromCreateDtoMock.mockReturnValue(mockProduct);
        mergeObjectContextMock.mockReturnValue(mockProduct);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(productWithoutVariants);

        expect(result).toEqual(expectedDto);
        expect(createMock).toHaveBeenCalledWith(mockProduct);
        expect(mockProduct.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle product with undefined variants', async () => {
        const productWithUndefinedVariants: CreateProductDTO = {
          data: {
            ...baseProductData,
            variants: undefined,
          },
        } as unknown as CreateProductDTO;

        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        fromCreateDtoMock.mockReturnValue(mockProduct);
        mergeObjectContextMock.mockReturnValue(mockProduct);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(productWithUndefinedVariants);

        expect(result).toEqual(expectedDto);
        expect(createMock).toHaveBeenCalledWith(mockProduct);
        expect(mockProduct.commit).toHaveBeenCalledTimes(1);
      });

      it('should propagate repository errors', async () => {
        fromCreateDtoMock.mockReturnValue(mockProduct);
        mergeObjectContextMock.mockReturnValue(mockProduct);
        createMock.mockRejectedValue(new Error('Database connection failed'));

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Database connection failed',
        );
      });
    });

    describe('Multiple variants validation', () => {
      it('should validate all variants in a product', async () => {
        const productWithMultipleVariants: CreateProductDTO = {
          data: {
            ...baseProductData,
            productType: TypeEnum.DIGITAL,
            variants: [
              {
                sku: 'DIGITAL-001',
                price: 19.99,
                stock: 50,
              },
              {
                sku: 'DIGITAL-002',
                price: 29.99,
                stock: 30,
                weight: 1.0, // This should cause validation error
              },
            ],
          },
        } as unknown as CreateProductDTO;

        await expect(
          handler.execute(productWithMultipleVariants),
        ).rejects.toThrow(
          new BadRequestException(
            'Digital products cannot have weight or dimensions.',
          ),
        );
      });

      it('should successfully create product with multiple valid variants', async () => {
        const productWithMultipleValidVariants: CreateProductDTO = {
          data: {
            ...baseProductData,
            productType: TypeEnum.PHYSICAL,
            variants: [
              {
                sku: 'PHYSICAL-001',
                price: 29.99,
                stock: 100,
                weight: 1.5,
                dimension: {
                  height: 10,
                  width: 20,
                  length: 30,
                },
              },
              {
                sku: 'PHYSICAL-002',
                price: 39.99,
                stock: 50,
                weight: 2.0,
                dimension: {
                  height: 15,
                  width: 25,
                  length: 35,
                },
              },
            ],
          },
        } as unknown as CreateProductDTO;

        const expectedDto: ProductDTO = {
          id: 'product-id',
          name: 'Test Product',
        } as unknown as ProductDTO;

        fromCreateDtoMock.mockReturnValue(mockProduct);
        mergeObjectContextMock.mockReturnValue(mockProduct);
        toDtoMock.mockReturnValue(expectedDto);
        createMock.mockResolvedValue(mockProduct); // Reset the mock to resolve instead of reject

        const result = await handler.execute(productWithMultipleValidVariants);

        expect(result).toEqual(expectedDto);
        expect(createMock).toHaveBeenCalledWith(mockProduct);
        expect(mockProduct.commit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
