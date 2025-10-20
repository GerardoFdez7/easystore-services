import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateStockPerWarehouseHandler } from '../update-stock-per-warehouse.handler';
import { UpdateStockPerWarehouseDTO } from '../update-stock-per-warehouse.dto';
import { IWarehouseRepository } from '../../../../../aggregates/repositories';
import { WarehouseMapper, WarehouseDTO } from '../../../../mappers';
import { Id } from '../../../../../aggregates/value-objects';

interface MockWarehouse {
  commit: jest.Mock;
  apply: jest.Mock;
  get: jest.Mock;
}

describe('UpdateStockPerWarehouseHandler', () => {
  let handler: UpdateStockPerWarehouseHandler;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockWarehouse: MockWarehouse;

  let findByIdMock: jest.Mock;
  let updateSingleStockMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let idCreateMock: jest.SpyInstance;
  let fromUpdateStockInWarehouseMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    findByIdMock = jest.fn();
    updateSingleStockMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    warehouseRepository = {
      findById: findByIdMock,
      updateSingleStock: updateSingleStockMock,
    } as unknown as jest.Mocked<IWarehouseRepository>;

    mockWarehouse = {
      commit: jest.fn(),
      apply: jest.fn(),
      get: jest.fn(),
    };

    mergeObjectContextMock.mockReturnValue(mockWarehouse);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    idCreateMock = jest.spyOn(Id, 'create').mockImplementation(function (
      this: void,
      value: string,
    ) {
      return {
        value,
      } as never;
    });
    fromUpdateStockInWarehouseMock = jest
      .spyOn(WarehouseMapper, 'fromUpdateStockInWarehouse')
      .mockReturnValue(mockWarehouse as never);
    toDtoMock = jest
      .spyOn(WarehouseMapper, 'toDto')
      .mockReturnValue({ id: 'warehouse-id' } as WarehouseDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStockPerWarehouseHandler,
        {
          provide: 'IWarehouseRepository',
          useValue: warehouseRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<UpdateStockPerWarehouseHandler>(
      UpdateStockPerWarehouseHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseStockData = {
      warehouseId: 'warehouse-123',
      productId: 'product-456',
      variantId: 'variant-789',
      qtyAvailable: 50,
    };

    const baseCommand: UpdateStockPerWarehouseDTO = {
      stockId: 'stock-123',
      warehouseId: 'warehouse-123',
      tenantId: 'tenant-123',
      reason: 'Stock adjustment',
      createdById: 'user-456',
      data: baseStockData,
    };

    describe('Warehouse finding and validation', () => {
      it('should throw NotFoundException when warehouse does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-123' },
          { value: 'tenant-123' },
        );
      });

      it('should find warehouse with correct tenant and warehouse IDs', async () => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('warehouse-123');
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-123' },
          { value: 'tenant-123' },
        );
      });
    });

    describe('Stock updating and processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should update stock on warehouse with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(fromUpdateStockInWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
          baseStockData,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockWarehouse);
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should update single stock in repository', async () => {
        await handler.execute(baseCommand);

        expect(updateSingleStockMock).toHaveBeenCalledWith(
          { value: 'stock-123' },
          { value: 'warehouse-123' },
          baseStockData,
          {
            reason: 'Stock adjustment',
            createdById: 'user-456',
          },
        );
      });

      it('should update after stock modification and before committing events', async () => {
        await handler.execute(baseCommand);

        const stockUpdateOrder =
          fromUpdateStockInWarehouseMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const repositoryUpdateOrder =
          updateSingleStockMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];

        expect(stockUpdateOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(repositoryUpdateOrder);
        expect(repositoryUpdateOrder).toBeLessThan(commitOrder);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should commit events after updating', async () => {
        await handler.execute(baseCommand);

        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after all operations', async () => {
        await handler.execute(baseCommand);

        const repositoryUpdateOrder =
          updateSingleStockMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];
        expect(repositoryUpdateOrder).toBeLessThan(commitOrder);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should convert updated warehouse to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockWarehouse);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: WarehouseDTO = {
          id: 'warehouse-id',
          name: 'Test Warehouse',
        } as WarehouseDTO;
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle stock update with minimal required fields', async () => {
        const minimalCommand: UpdateStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-1',
          reason: 'Test',
          createdById: 'user-1',
          data: {
            qtyAvailable: 1,
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(minimalCommand);

        expect(fromUpdateStockInWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
          minimalCommand.data,
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should handle stock update with all optional fields', async () => {
        const completeCommand: UpdateStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-123',
          reason: 'Complete stock update',
          createdById: 'user-456',
          data: {
            qtyAvailable: 200,
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(completeCommand);

        expect(fromUpdateStockInWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
          completeCommand.data,
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should handle negative quantity updates', async () => {
        const negativeQuantityCommand: UpdateStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-123',
          reason: 'Stock reduction',
          createdById: 'user-456',
          data: {
            qtyAvailable: -25,
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(negativeQuantityCommand);

        expect(fromUpdateStockInWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
          negativeQuantityCommand.data,
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        findByIdMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should propagate update errors', async () => {
        const updateError = new Error('Failed to update stock');
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        updateSingleStockMock.mockRejectedValue(updateError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(updateError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete stock update flow', async () => {
        const completeCommand: UpdateStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-789',
          reason: 'Integration test stock update',
          createdById: 'user-789',
          data: {
            qtyAvailable: 150,
          },
        };

        const expectedDto: WarehouseDTO = {
          id: 'warehouse-789',
          name: 'Integration Warehouse',
        } as WarehouseDTO;

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(4); // findById (2 calls) and updateSingleStock (2 calls)
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(fromUpdateStockInWarehouseMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateSingleStockMock).toHaveBeenCalledTimes(1);
        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
