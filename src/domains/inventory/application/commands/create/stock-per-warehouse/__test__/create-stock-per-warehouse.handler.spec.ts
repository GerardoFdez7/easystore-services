import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateStockPerWarehouseHandler } from '../create-stock-per-warehouse.handler';
import { CreateStockPerWarehouseDTO } from '../create-stock-per-warehouse.dto';
import { IWarehouseRepository } from '../../../../../aggregates/repositories';
import { WarehouseMapper, WarehouseDTO } from '../../../../mappers';
import { Id } from '@domains/value-objects';

interface MockWarehouse {
  commit: jest.Mock;
  apply: jest.Mock;
  get: jest.Mock;
  addStockToWarehouse: jest.Mock;
}

describe('CreateStockPerWarehouseHandler', () => {
  let handler: CreateStockPerWarehouseHandler;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockWarehouse: MockWarehouse;

  let findByIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let idCreateMock: jest.SpyInstance;
  let fromAddStockToWarehouseMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    findByIdMock = jest.fn();
    updateMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    warehouseRepository = {
      findById: findByIdMock,
      update: updateMock,
    } as unknown as jest.Mocked<IWarehouseRepository>;

    mockWarehouse = {
      commit: jest.fn(),
      apply: jest.fn(),
      get: jest.fn(),
      addStockToWarehouse: jest.fn().mockReturnThis(),
    };

    mergeObjectContextMock.mockReturnValue(mockWarehouse);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    idCreateMock = jest.spyOn(Id, 'create').mockReturnValue({
      value: 'warehouse-id',
    } as never);
    fromAddStockToWarehouseMock = jest
      .spyOn(WarehouseMapper, 'fromAddStockToWarehouse')
      .mockReturnValue(mockWarehouse as never);
    toDtoMock = jest
      .spyOn(WarehouseMapper, 'toDto')
      .mockReturnValue({ id: 'warehouse-id' } as WarehouseDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStockPerWarehouseHandler,
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

    handler = module.get<CreateStockPerWarehouseHandler>(
      CreateStockPerWarehouseHandler,
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
      qtyAvailable: 100,
    };

    const baseCommand: CreateStockPerWarehouseDTO = {
      tenantId: 'tenant-123',
      reason: 'Initial stock creation for this test',
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

    describe('Stock processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should add stock to warehouse with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(fromAddStockToWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
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

      it('should update the warehouse in repository', async () => {
        await handler.execute(baseCommand);

        expect(updateMock).toHaveBeenCalledWith(
          { value: 'warehouse-id' },
          { value: 'warehouse-id' },
          mockWarehouse,
          {
            reason: 'Initial stock creation for this test',
            createdById: 'user-456',
          },
        );
      });

      it('should update after adding stock and before committing events', async () => {
        await handler.execute(baseCommand);

        const addStockOrder =
          fromAddStockToWarehouseMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];

        expect(addStockOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(updateOrder);
        expect(updateOrder).toBeLessThan(commitOrder);
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

        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];
        expect(updateOrder).toBeLessThan(commitOrder);
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
      it('should handle stock with minimal required fields', async () => {
        const minimalCommand: CreateStockPerWarehouseDTO = {
          tenantId: 'tenant-1',
          reason: 'Test stock creation esge case',
          createdById: 'user-1',
          data: {
            warehouseId: 'warehouse-1',
            variantId: 'variant-1',
            qtyAvailable: 1,
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(minimalCommand);

        expect(fromAddStockToWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          minimalCommand.data,
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should handle stock with all optional fields', async () => {
        const completeCommand: CreateStockPerWarehouseDTO = {
          tenantId: 'tenant-123',
          reason: 'Complete stock addition',
          createdById: 'user-456',
          data: {
            warehouseId: 'warehouse-123',
            variantId: 'variant-789',
            qtyAvailable: 500,
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(completeCommand);

        expect(fromAddStockToWarehouseMock).toHaveBeenCalledWith(
          mockWarehouse,
          completeCommand.data,
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
        const updateError = new Error('Failed to update warehouse');
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        updateMock.mockRejectedValue(updateError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(updateError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete stock creation flow', async () => {
        const completeCommand: CreateStockPerWarehouseDTO = {
          tenantId: 'tenant-789',
          reason: 'Integration test stock',
          createdById: 'user-789',
          data: {
            warehouseId: 'warehouse-789',
            variantId: 'variant-789',
            qtyAvailable: 250,
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
        expect(idCreateMock).toHaveBeenCalledTimes(4); // findById (2 calls) and update (2 calls)
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(fromAddStockToWarehouseMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
