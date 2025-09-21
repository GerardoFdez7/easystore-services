import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteStockPerWarehouseHandler } from '../delete-stock-per-warehouse.handler';
import { DeleteStockPerWarehouseDTO } from '../delete-stock-per-warehouse.dto';
import { IWarehouseRepository } from '../../../../../aggregates/repositories';
import { WarehouseMapper, WarehouseDTO } from '../../../../mappers';
import { Id } from '@shared/value-objects';

interface MockWarehouse {
  commit: jest.Mock;
  apply: jest.Mock;
  get: jest.Mock;
  removeStockFromWarehouse: jest.Mock;
}

describe('DeleteStockPerWarehouseHandler', () => {
  let handler: DeleteStockPerWarehouseHandler;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockWarehouse: MockWarehouse;

  let findByIdMock: jest.Mock;
  let updateSingleStockMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let idCreateMock: jest.SpyInstance;
  let fromRemoveStockFromWarehouseMock: jest.SpyInstance;
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
      removeStockFromWarehouse: jest.fn().mockReturnThis(),
    };

    mergeObjectContextMock.mockReturnValue(mockWarehouse);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    idCreateMock = jest.spyOn(Id, 'create').mockReturnValue({
      value: 'warehouse-id',
    } as never);
    fromRemoveStockFromWarehouseMock = jest
      .spyOn(WarehouseMapper, 'fromRemoveStockFromWarehouse')
      .mockReturnValue(mockWarehouse as never);
    toDtoMock = jest
      .spyOn(WarehouseMapper, 'toDto')
      .mockReturnValue({ id: 'warehouse-id' } as WarehouseDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteStockPerWarehouseHandler,
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

    handler = module.get<DeleteStockPerWarehouseHandler>(
      DeleteStockPerWarehouseHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseCommand: DeleteStockPerWarehouseDTO = {
      stockId: 'stock-123',
      warehouseId: 'warehouse-123',
      tenantId: 'tenant-123',
      reason: 'Stock removal',
      createdById: 'user-456',
    };

    describe('Warehouse finding and validation', () => {
      it('should throw NotFoundException when warehouse does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-id' },
          { value: 'warehouse-id' },
        );
      });

      it('should find warehouse with correct tenant and warehouse IDs', async () => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('warehouse-123');
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-id' },
          { value: 'warehouse-id' },
        );
      });
    });

    describe('Stock removal and processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should remove stock from warehouse with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(fromRemoveStockFromWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
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
          { value: 'warehouse-id' },
          { value: 'warehouse-id' },
          { qtyAvailable: 0 },
          {
            reason: 'Stock removal',
            createdById: 'user-456',
          },
        );
      });

      it('should update after stock removal and before committing events', async () => {
        await handler.execute(baseCommand);

        const stockRemovalOrder =
          fromRemoveStockFromWarehouseMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const repositoryUpdateOrder =
          updateSingleStockMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];

        expect(stockRemovalOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(repositoryUpdateOrder);
        expect(repositoryUpdateOrder).toBeLessThan(commitOrder);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should commit events after removing stock', async () => {
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
      it('should handle stock removal with minimal required fields', async () => {
        const minimalCommand: DeleteStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-1',
          reason: 'Test removal',
          createdById: 'user-1',
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(minimalCommand);

        expect(fromRemoveStockFromWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should handle stock removal with all optional fields', async () => {
        const completeCommand: DeleteStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-123',
          reason: 'Complete stock removal',
          createdById: 'user-456',
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(completeCommand);

        expect(fromRemoveStockFromWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should handle large quantity removals', async () => {
        const largeQuantityCommand: DeleteStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-123',
          reason: 'Bulk removal',
          createdById: 'user-456',
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(largeQuantityCommand);

        expect(fromRemoveStockFromWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          'stock-123',
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
        const updateError = new Error('Failed to remove stock');
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        updateSingleStockMock.mockRejectedValue(updateError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(updateError);
      });

      it('should handle entity removeStock method errors', async () => {
        const removeStockError = new Error('Insufficient stock');
        findByIdMock.mockResolvedValue(mockWarehouse);
        fromRemoveStockFromWarehouseMock.mockImplementation(() => {
          throw removeStockError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          removeStockError,
        );
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete stock removal flow', async () => {
        // Clear mocks to ensure clean state
        idCreateMock.mockClear();
        findByIdMock.mockClear();
        mergeObjectContextMock.mockClear();
        updateSingleStockMock.mockClear();
        mockWarehouse.commit.mockClear();
        fromRemoveStockFromWarehouseMock.mockClear();
        toDtoMock.mockClear();
        const completeCommand: DeleteStockPerWarehouseDTO = {
          stockId: 'stock-123',
          warehouseId: 'warehouse-123',
          tenantId: 'tenant-789',
          reason: 'Integration test stock removal',
          createdById: 'user-789',
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
        expect(fromRemoveStockFromWarehouseMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateSingleStockMock).toHaveBeenCalledTimes(1);
        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
