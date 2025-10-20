import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateWarehouseHandler } from '../create-warehouse.handler';
import { CreateWarehouseDTO } from '../create-warehouse.dto';
import { IWarehouseRepository } from '../../../../../aggregates/repositories';
import { WarehouseMapper, WarehouseDTO } from '../../../../mappers';

interface MockWarehouse {
  commit: jest.Mock;
  apply: jest.Mock;
  get: jest.Mock;
}

describe('CreateWarehouseHandler', () => {
  let handler: CreateWarehouseHandler;
  let warehouseRepository: jest.Mocked<IWarehouseRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockWarehouse: MockWarehouse;

  let createMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let fromCreateDtoMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;

  beforeEach(async () => {
    createMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    warehouseRepository = {
      create: createMock,
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

    fromCreateDtoMock = jest
      .spyOn(WarehouseMapper, 'fromCreateDto')
      .mockReturnValue(mockWarehouse as never);
    toDtoMock = jest
      .spyOn(WarehouseMapper, 'toDto')
      .mockReturnValue({ id: 'warehouse-id' } as WarehouseDTO);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWarehouseHandler,
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

    handler = module.get<CreateWarehouseHandler>(CreateWarehouseHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseWarehouseData = {
      name: 'Main Warehouse',
      addressId: 'address-123',
      tenantId: 'tenant-456',
    };

    const baseCommand: CreateWarehouseDTO = {
      data: baseWarehouseData,
    } as unknown as CreateWarehouseDTO;

    describe('Warehouse mapping and processing', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should call WarehouseMapper.fromCreateDto with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(fromCreateDtoMock).toHaveBeenCalledWith(baseWarehouseData);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockWarehouse);
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should create the warehouse in repository', async () => {
        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledWith(mockWarehouse);
      });

      it('should create after mapping and before committing events', async () => {
        await handler.execute(baseCommand);

        const fromCreateDtoOrder =
          fromCreateDtoMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const createOrder = createMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];

        expect(fromCreateDtoOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(createOrder);
        expect(createOrder).toBeLessThan(commitOrder);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should commit events after creating', async () => {
        await handler.execute(baseCommand);

        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after all operations', async () => {
        await handler.execute(baseCommand);

        const createOrder = createMock.mock.invocationCallOrder[0];
        const commitOrder = mockWarehouse.commit.mock.invocationCallOrder[0];
        expect(createOrder).toBeLessThan(commitOrder);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
      });

      it('should convert warehouse to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockWarehouse);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: WarehouseDTO = {
          id: 'warehouse-id',
          name: 'Main Warehouse',
        } as WarehouseDTO;
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should handle warehouse with minimal required fields', async () => {
        const minimalCommand: CreateWarehouseDTO = {
          data: {
            name: 'Minimal Warehouse',
            addressId: 'addr-1',
            tenantId: 'tenant-1',
          },
        } as unknown as CreateWarehouseDTO;

        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);

        const result = await handler.execute(minimalCommand);

        expect(fromCreateDtoMock).toHaveBeenCalledWith(minimalCommand.data);
        expect(result).toEqual({ id: 'warehouse-id' });
      });

      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        createMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should propagate create errors', async () => {
        const createError = new Error('Failed to create warehouse');
        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        createMock.mockRejectedValue(createError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(createError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete warehouse creation flow', async () => {
        const completeCommand: CreateWarehouseDTO = {
          data: {
            name: 'Complete Warehouse',
            addressId: 'address-789',
            tenantId: 'tenant-123',
          },
        } as unknown as CreateWarehouseDTO;

        const expectedDto: WarehouseDTO = {
          id: 'warehouse-789',
          name: 'Complete Warehouse',
          addressId: 'address-789',
          tenantId: 'tenant-123',
        } as unknown as WarehouseDTO;

        mergeObjectContextMock.mockReturnValue(mockWarehouse as never);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        // Verify all steps were called in correct order
        expect(fromCreateDtoMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(mockWarehouse.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });
    });
  });
});
