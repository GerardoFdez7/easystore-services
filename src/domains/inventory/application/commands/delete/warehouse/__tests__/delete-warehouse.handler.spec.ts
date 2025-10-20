import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteWarehouseHandler } from '../delete-warehouse.handler';
import { DeleteWarehouseDTO } from '../delete-warehouse.dto';
import { IWarehouseRepository } from '../../../../../aggregates/repositories';
import { WarehouseMapper, WarehouseDTO } from '../../../../mappers';
import { Id } from '../../../../../aggregates/value-objects';

interface MockWarehouse {
  commit: jest.Mock;
  apply: jest.Mock;
  get: jest.Mock;
}

describe('DeleteWarehouseHandler', () => {
  let handler: DeleteWarehouseHandler;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockWarehouse: MockWarehouse;

  let findByIdMock: jest.Mock;
  let deleteMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let idCreateMock: jest.SpyInstance;
  let _fromDeleteDtoMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    findByIdMock = jest.fn();
    deleteMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    warehouseRepository = {
      findById: findByIdMock,
      delete: deleteMock,
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
    _fromDeleteDtoMock = jest
      .spyOn(WarehouseMapper, 'fromDeleteDto')
      .mockReturnValue(mockWarehouse as never);
    toDtoMock = jest
      .spyOn(WarehouseMapper, 'toDto')
      .mockReturnValue({ id: 'warehouse-id' } as WarehouseDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteWarehouseHandler,
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

    handler = module.get<DeleteWarehouseHandler>(DeleteWarehouseHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseCommand: DeleteWarehouseDTO = {
      id: 'warehouse-123',
      tenantId: 'tenant-456',
    };

    describe('Warehouse finding and validation', () => {
      it('should throw NotFoundException when warehouse does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-123' },
          { value: 'tenant-456' },
        );
      });

      it('should find warehouse with correct tenant and warehouse IDs', async () => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        await handler.execute(baseCommand);

        expect(idCreateMock).toHaveBeenCalledWith('warehouse-123');
        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-123' },
          { value: 'tenant-456' },
        );
      });
    });

    describe('Warehouse deletion and processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should call delete on warehouse repository', async () => {
        await handler.execute(baseCommand);

        expect(deleteMock).toHaveBeenCalledTimes(1);
        expect(deleteMock).toHaveBeenCalledWith(
          { value: 'warehouse-123' },
          { value: 'tenant-456' },
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

      it('should delete the warehouse in repository', async () => {
        await handler.execute(baseCommand);

        expect(deleteMock).toHaveBeenCalledWith(
          { value: 'warehouse-123' },
          { value: 'tenant-456' },
        );
      });

      it('should execute operations in correct order', async () => {
        await handler.execute(baseCommand);

        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const repositoryDeleteOrder = deleteMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];

        expect(mergeOrder).toBeLessThan(repositoryDeleteOrder);
        expect(repositoryDeleteOrder).toBeLessThan(commitOrder);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should commit events after deleting', async () => {
        await handler.execute(baseCommand);

        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after all operations', async () => {
        await handler.execute(baseCommand);

        const repositoryDeleteOrder = deleteMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];
        expect(repositoryDeleteOrder).toBeLessThan(commitOrder);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should convert deleted warehouse to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockWarehouse);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: WarehouseDTO = {
          id: 'warehouse-id',
          name: 'Deleted Warehouse',
        } as WarehouseDTO;
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle deletion with different tenant IDs', async () => {
        const differentTenantCommand: DeleteWarehouseDTO = {
          id: 'warehouse-999',
          tenantId: 'tenant-999',
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(differentTenantCommand);

        expect(findByIdMock).toHaveBeenCalledWith(
          { value: 'warehouse-999' },
          { value: 'tenant-999' },
        );
        expect(deleteMock).toHaveBeenCalledWith(
          { value: 'warehouse-999' },
          { value: 'tenant-999' },
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

      it('should propagate delete errors', async () => {
        const deleteError = new Error('Failed to delete warehouse');
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        deleteMock.mockRejectedValue(deleteError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(deleteError);
      });

      it('should handle repository delete errors', async () => {
        const repositoryDeleteError = new Error('Repository delete failed');
        findByIdMock.mockResolvedValue(mockWarehouse);
        deleteMock.mockRejectedValue(repositoryDeleteError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryDeleteError,
        );
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete warehouse deletion flow', async () => {
        const completeCommand: DeleteWarehouseDTO = {
          id: 'warehouse-789',
          tenantId: 'tenant-789',
        };

        const expectedDto: WarehouseDTO = {
          id: 'warehouse-789',
          name: 'Integration Deleted Warehouse',
          isDeleted: true,
        } as unknown as WarehouseDTO;

        // Reset call counts for clean state
        idCreateMock.mockClear();
        findByIdMock.mockClear();
        mergeObjectContextMock.mockClear();
        deleteMock.mockClear();
        mockWarehouse.commit.mockClear();
        toDtoMock.mockClear();

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(4); // findById (2 calls) and delete (2 calls)
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(deleteMock).toHaveBeenCalledTimes(1);
        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
