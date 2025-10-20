import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateWarehouseHandler } from '../update-warehouse.handler';
import { UpdateWarehouseDTO } from '../update-warehouse.dto';
import { IWarehouseRepository } from '../../../../../aggregates/repositories';
import { WarehouseMapper, WarehouseDTO } from '../../../../mappers';
import { Id } from '../../../../../aggregates/value-objects';

interface MockWarehouse {
  commit: jest.Mock;
  apply: jest.Mock;
  get: jest.Mock;
  update: jest.Mock;
}

describe('UpdateWarehouseHandler', () => {
  let handler: UpdateWarehouseHandler;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockWarehouse: MockWarehouse;

  let findByIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let idCreateMock: jest.SpyInstance;
  let fromUpdateDtoMock: jest.SpyInstance;
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
      update: jest.fn(),
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
    fromUpdateDtoMock = jest
      .spyOn(WarehouseMapper, 'fromUpdateDto')
      .mockReturnValue(mockWarehouse as never);
    toDtoMock = jest
      .spyOn(WarehouseMapper, 'toDto')
      .mockReturnValue({ id: 'warehouse-id' } as WarehouseDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWarehouseHandler,
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

    handler = module.get<UpdateWarehouseHandler>(UpdateWarehouseHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseUpdateData = {
      name: 'Updated Warehouse',
      addressId: 'new-address-123',
    };

    const baseCommand: UpdateWarehouseDTO = {
      id: 'warehouse-123',
      tenantId: 'tenant-456',
      data: baseUpdateData,
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

    describe('Warehouse updating and processing', () => {
      beforeEach(() => {
        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should update warehouse with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(fromUpdateDtoMock).toHaveBeenCalledWith(
          mockWarehouse,
          baseUpdateData,
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
          { value: 'warehouse-123' },
          { value: 'tenant-456' },
          mockWarehouse,
          {},
        );
      });

      it('should update after warehouse modification and before committing events', async () => {
        await handler.execute(baseCommand);

        const fromUpdateDtoOrder =
          fromUpdateDtoMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const repositoryUpdateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];

        expect(fromUpdateDtoOrder).toBeLessThan(mergeOrder);
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

        const repositoryUpdateOrder = updateMock.mock.invocationCallOrder[0];
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
          name: 'Updated Warehouse',
        } as WarehouseDTO;
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle warehouse update with minimal required fields', async () => {
        const minimalCommand: UpdateWarehouseDTO = {
          id: 'warehouse-1',
          tenantId: 'tenant-1',
          data: {
            name: 'Minimal Update',
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(minimalCommand);

        expect(fromUpdateDtoMock).toHaveBeenCalledWith(
          mockWarehouse,
          minimalCommand.data,
        );
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should handle warehouse update with all optional fields', async () => {
        const completeCommand: UpdateWarehouseDTO = {
          id: 'warehouse-123',
          tenantId: 'tenant-456',
          data: {
            name: 'Complete Updated Warehouse',
            addressId: 'new-address-789',
          },
        };

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(completeCommand);

        expect(fromUpdateDtoMock).toHaveBeenCalledWith(
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
      it('should execute complete warehouse update flow', async () => {
        const completeCommand: UpdateWarehouseDTO = {
          id: 'warehouse-789',
          tenantId: 'tenant-789',
          data: {
            name: 'Integration Updated Warehouse',
            addressId: 'address-integration',
          },
        };

        const expectedDto: WarehouseDTO = {
          id: 'warehouse-789',
          name: 'Integration Updated Warehouse',
          addressId: 'address-integration',
        } as WarehouseDTO;

        findByIdMock.mockResolvedValue(mockWarehouse);
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(idCreateMock).toHaveBeenCalledTimes(4); // findById (2 calls) and update (2 calls)
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(fromUpdateDtoMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
