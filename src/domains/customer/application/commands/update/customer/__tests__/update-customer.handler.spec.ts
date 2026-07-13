import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateCustomerHandler } from '../update-customer.handler';
import { UpdateCustomerDto } from '../update-customer.dto';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { Customer } from '../../../../../aggregates/entities/customer.entity';
import { CustomerDTO, CustomerMapper } from '../../../../mappers';
import { Id } from '@shared/value-objects';

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

describe('UpdateCustomerHandler', () => {
  let handler: UpdateCustomerHandler;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;

  let findCustomerByIdMock: jest.Mock;
  let updateMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let customerUpdateMock: jest.SpyInstance;
  let idCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;
  let defaultDto: CustomerDTO;

  beforeEach(async () => {
    findCustomerByIdMock = jest.fn();
    updateMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: jest.fn(),
      findCustomerById: findCustomerByIdMock,
      update: updateMock,
    } as unknown as jest.Mocked<ICustomerRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    customerUpdateMock = jest
      .spyOn(Customer, 'update')
      .mockReturnValue(mockCustomer as unknown as Customer);

    idCreateMock = jest
      .spyOn(Id, 'create')
      .mockReturnValue({ getValue: () => 'mocked-id' } as Id);

    defaultDto = {
      id: 'customer-id-123',
      name: 'Updated Customer',
      tenantId: 'tenant-abc',
      authIdentityId: 'auth-xyz',
      defaultPhoneNumberId: null,
      defaultShippingAddressId: null,
      defaultBillingAddressId: null,
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    toDtoMock = jest.spyOn(CustomerMapper, 'toDto').mockReturnValue(defaultDto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerHandler,
        {
          provide: 'ICustomerRepository',
          useValue: customerRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<UpdateCustomerHandler>(UpdateCustomerHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseUpdateData = {
      name: 'Updated Customer Name',
    };

    const baseCommand = new UpdateCustomerDto(
      baseUpdateData,
      'customer-123',
      'tenant-456',
    );

    describe('Customer retrieval and validation', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should find customer by ID and tenant ID', async () => {
        await handler.execute(baseCommand);

        expect(findCustomerByIdMock).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function) as unknown,
          }),
          expect.objectContaining({
            getValue: expect.any(Function) as unknown,
          }),
        );
      });

      it('should throw NotFoundException when customer is not found', async () => {
        findCustomerByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should throw NotFoundException with correct message', async () => {
        findCustomerByIdMock.mockResolvedValue(null);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          'Customer not found.',
        );
      });

      it('should handle valid customer ID correctly', async () => {
        const validCommand = new UpdateCustomerDto(
          { name: 'Valid Name' },
          'valid-customer-999',
          'valid-tenant-888',
        );
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(validCommand);

        expect(idCreateMock).toHaveBeenCalledWith('valid-customer-999');
        expect(idCreateMock).toHaveBeenCalledWith('valid-tenant-888');
      });
    });

    describe('Customer update and processing', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should call Customer.update with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(customerUpdateMock).toHaveBeenCalledWith(
          mockCustomer,
          baseUpdateData,
        );
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should update customer with valid data set', async () => {
        const validCommand = new UpdateCustomerDto(
          { name: 'Valid Updated Name' },
          'customer-valid-001',
          'tenant-valid-002',
        );

        await handler.execute(validCommand);

        expect(customerUpdateMock).toHaveBeenCalledWith(mockCustomer, {
          name: 'Valid Updated Name',
        });
      });

      it('should handle partial update data', async () => {
        const partialCommand = new UpdateCustomerDto(
          { name: 'Partial Update' },
          'customer-partial',
          'tenant-partial',
        );

        await handler.execute(partialCommand);

        expect(customerUpdateMock).toHaveBeenCalledWith(mockCustomer, {
          name: 'Partial Update',
        });
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should update the customer in repository', async () => {
        await handler.execute(baseCommand);

        expect(updateMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should update after domain update and before committing events', async () => {
        await handler.execute(baseCommand);

        const customerUpdateOrder =
          customerUpdateMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCustomer.commit.mock.invocationCallOrder[0];

        expect(customerUpdateOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(updateOrder);
        expect(updateOrder).toBeLessThan(commitOrder);
      });

      it('should handle repository update successfully', async () => {
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(baseCommand);

        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should propagate repository update errors', async () => {
        const repositoryError = new Error('Database update failed');
        updateMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should commit events after updating the customer', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository persistence', async () => {
        await handler.execute(baseCommand);

        const updateOrder = updateMock.mock.invocationCallOrder[0];
        const commitOrder = mockCustomer.commit.mock.invocationCallOrder[0];

        expect(updateOrder).toBeLessThan(commitOrder);
      });

      it('should apply domain events during customer update', async () => {
        await handler.execute(baseCommand);

        expect(customerUpdateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should convert customer to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: CustomerDTO = {
          id: 'customer-id-updated',
          name: 'Updated Customer Name',
          tenantId: 'tenant-abc',
          authIdentityId: 'auth-xyz',
          defaultPhoneNumberId: null,
          defaultShippingAddressId: null,
          defaultBillingAddressId: null,
          updatedAt: new Date('2024-02-01T00:00:00.000Z'),
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        };
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(baseCommand);

        expect(result).toBe(expectedDto);
      });

      it('should return DTO with correct structure', async () => {
        const result = await handler.execute(baseCommand);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('tenantId');
        expect(result).toHaveProperty('authIdentityId');
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should propagate customer update errors', async () => {
        const updateError = new Error('Failed to update customer');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        customerUpdateMock.mockImplementation(() => {
          throw updateError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(updateError);
      });

      it('should propagate Id.create errors for customer ID', async () => {
        const idCreationError = new Error('Invalid customer ID format');
        idCreateMock.mockImplementationOnce(() => {
          throw idCreationError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          idCreationError,
        );
      });

      it('should propagate Id.create errors for tenant ID', async () => {
        const idCreationError = new Error('Invalid tenant ID format');
        idCreateMock
          .mockReturnValueOnce({ getValue: () => 'customer-id' } as Id)
          .mockImplementationOnce(() => {
            throw idCreationError;
          });

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          idCreationError,
        );
      });

      it('should handle mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });

      it('should handle repository retrieval errors', async () => {
        const retrieverError = new Error('Database read failed');
        findCustomerByIdMock.mockRejectedValue(retrieverError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          retrieverError,
        );
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete customer update flow', async () => {
        const completeCommand = new UpdateCustomerDto(
          { name: 'Complete Update' },
          'customer-complete',
          'tenant-complete',
        );

        const expectedDto: CustomerDTO = {
          id: 'customer-id-complete',
          name: 'Complete Update',
          tenantId: 'tenant-complete',
          authIdentityId: 'auth-complete',
          defaultPhoneNumberId: null,
          defaultShippingAddressId: null,
          defaultBillingAddressId: null,
          updatedAt: new Date('2024-03-01T00:00:00.000Z'),
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        };

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        expect(idCreateMock).toHaveBeenCalledTimes(2);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(1);
        expect(customerUpdateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const customerData = { name: 'Consistency Update' };
        const command = new UpdateCustomerDto(
          customerData,
          'customer-consistency',
          'tenant-consistency',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(command);

        expect(customerUpdateMock).toHaveBeenCalledWith(
          mockCustomer,
          customerData,
        );
        expect(updateMock).toHaveBeenCalledWith(mockCustomer);
        expect(toDtoMock).toHaveBeenCalledWith(mockCustomer);
      });
    });

    describe('Business logic validation', () => {
      it('should update an existing customer and commit events', async () => {
        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(baseCommand);

        expect(customerUpdateMock).toHaveBeenCalledWith(
          mockCustomer,
          baseUpdateData,
        );
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent customer update requests', async () => {
        const command1 = new UpdateCustomerDto(
          { name: 'Customer One Update' },
          'customer-1',
          'tenant-1',
        );
        const command2 = new UpdateCustomerDto(
          { name: 'Customer Two Update' },
          'customer-2',
          'tenant-2',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(idCreateMock).toHaveBeenCalledTimes(4);
        expect(findCustomerByIdMock).toHaveBeenCalledTimes(2);
        expect(customerUpdateMock).toHaveBeenCalledTimes(2);
        expect(updateMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });

      it('should handle update with only name change', async () => {
        const nameOnlyCommand = new UpdateCustomerDto(
          { name: 'Only Name Changed' },
          'customer-name-only',
          'tenant-name-only',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(nameOnlyCommand);

        expect(customerUpdateMock).toHaveBeenCalledWith(mockCustomer, {
          name: 'Only Name Changed',
        });
        expect(updateMock).toHaveBeenCalledTimes(1);
      });

      it('should handle update with empty data object', async () => {
        const emptyCommand = new UpdateCustomerDto(
          {},
          'customer-empty',
          'tenant-empty',
        );

        findCustomerByIdMock.mockResolvedValue(
          mockCustomer as unknown as Customer,
        );
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        updateMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(emptyCommand);

        expect(customerUpdateMock).toHaveBeenCalledWith(mockCustomer, {});
        expect(updateMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
