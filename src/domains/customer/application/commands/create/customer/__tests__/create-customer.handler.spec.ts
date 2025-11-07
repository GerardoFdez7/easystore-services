import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateCustomerHandler } from '../create-customer.handler';
import { CreateCustomerDto } from '../create-customer.dto';
import { ICustomerRepository } from '../../../../../aggregates/repositories/customer.interface';
import { CustomerDTO, CustomerMapper } from '../../../../mappers';
import { Customer } from '../../../../../aggregates/entities/customer.entity';

interface MockCustomer {
  commit: jest.Mock;
  apply: jest.Mock;
}

describe('CreateCustomerHandler', () => {
  let handler: CreateCustomerHandler;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let mockCustomer: MockCustomer;

  let createMock: jest.Mock;
  let mergeObjectContextMock: jest.Mock;
  let customerCreateMock: jest.SpyInstance;
  let toDtoMock: jest.SpyInstance;
  let defaultDto: CustomerDTO;

  beforeEach(async () => {
    createMock = jest.fn();
    mergeObjectContextMock = jest.fn();

    customerRepository = {
      findByAuthIdentityId: jest.fn(),
      create: createMock,
      findCustomerById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    mockCustomer = {
      commit: jest.fn(),
      apply: jest.fn(),
    };

    mergeObjectContextMock.mockReturnValue(mockCustomer as never);

    eventPublisher = {
      mergeObjectContext: mergeObjectContextMock,
    } as unknown as jest.Mocked<EventPublisher>;

    customerCreateMock = jest
      .spyOn(Customer, 'create')
      .mockReturnValue(mockCustomer as unknown as Customer);

    defaultDto = {
      id: 'customer-id-123',
      name: 'John Doe',
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
        CreateCustomerHandler,
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

    handler = module.get<CreateCustomerHandler>(CreateCustomerHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const baseCustomerData = {
      name: 'Alice Example',
      tenantId: 'tenant-123',
      authIdentityId: 'auth-456',
    };

    const baseCommand = new CreateCustomerDto(baseCustomerData);

    describe('Customer creation and processing', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should call Customer.create with correct parameters', async () => {
        await handler.execute(baseCommand);

        expect(customerCreateMock).toHaveBeenCalledWith(baseCustomerData);
      });

      it('should merge object context with event publisher', async () => {
        await handler.execute(baseCommand);

        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should create a customer with valid data set', async () => {
        const validCommand = new CreateCustomerDto({
          name: 'Valid Customer',
          tenantId: 'tenant-valid-001',
          authIdentityId: 'auth-valid-002',
        });

        await handler.execute(validCommand);

        expect(customerCreateMock).toHaveBeenCalledWith({
          name: 'Valid Customer',
          tenantId: 'tenant-valid-001',
          authIdentityId: 'auth-valid-002',
        });
      });

      it('should forward optional identifiers when provided', async () => {
        const optionalCommand = new CreateCustomerDto({
          name: 'Optional Customer',
          tenantId: 'tenant-optional',
          authIdentityId: 'auth-optional',
        });

        await handler.execute(optionalCommand);

        expect(customerCreateMock).toHaveBeenCalledWith({
          name: 'Optional Customer',
          tenantId: 'tenant-optional',
          authIdentityId: 'auth-optional',
        });
      });
    });

    describe('Repository persistence', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should persist the customer in repository', async () => {
        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should persist after domain creation and before committing events', async () => {
        await handler.execute(baseCommand);

        const customerCreateOrder =
          customerCreateMock.mock.invocationCallOrder[0];
        const mergeOrder = mergeObjectContextMock.mock.invocationCallOrder[0];
        const createOrder = createMock.mock.invocationCallOrder[0];
        const commitOrder = mockCustomer.commit.mock.invocationCallOrder[0];

        expect(customerCreateOrder).toBeLessThan(mergeOrder);
        expect(mergeOrder).toBeLessThan(createOrder);
        expect(createOrder).toBeLessThan(commitOrder);
      });

      it('should handle repository creation successfully', async () => {
        const savedCustomer = {
          ...mockCustomer,
          persisted: true,
        } as unknown as Customer;
        createMock.mockResolvedValue(savedCustomer);

        await handler.execute(baseCommand);

        expect(createMock).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledWith(savedCustomer);
      });
    });

    describe('Event handling', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should commit events after creating the customer', async () => {
        await handler.execute(baseCommand);

        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should commit events after repository persistence', async () => {
        await handler.execute(baseCommand);

        const createOrder = createMock.mock.invocationCallOrder[0];
        const commitOrder = mockCustomer.commit.mock.invocationCallOrder[0];

        expect(createOrder).toBeLessThan(commitOrder);
      });

      it('should apply domain events during customer creation', async () => {
        await handler.execute(baseCommand);

        expect(customerCreateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledWith(mockCustomer);
      });
    });

    describe('DTO conversion and return', () => {
      beforeEach(() => {
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);
      });

      it('should convert customer to DTO', async () => {
        await handler.execute(baseCommand);

        expect(toDtoMock).toHaveBeenCalledWith(mockCustomer);
      });

      it('should return the mapped DTO', async () => {
        const expectedDto: CustomerDTO = {
          id: 'customer-id-456',
          name: 'Alice Example',
          tenantId: 'tenant-123',
          authIdentityId: 'auth-456',
          defaultPhoneNumberId: null,
          defaultShippingAddressId: null,
          defaultBillingAddressId: null,
          updatedAt: new Date('2024-02-01T00:00:00.000Z'),
          createdAt: new Date('2024-02-01T00:00:00.000Z'),
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
      it('should handle customer creation with extended data', async () => {
        const extendedCommand = new CreateCustomerDto({
          name: 'Extended Customer',
          tenantId: 'tenant-extended',
          authIdentityId: 'auth-extended',
        });

        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);

        const result = await handler.execute(extendedCommand);

        expect(customerCreateMock).toHaveBeenCalledWith({
          name: 'Extended Customer',
          tenantId: 'tenant-extended',
          authIdentityId: 'auth-extended',
        });
        expect(result).toEqual(defaultDto);
      });

      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockRejectedValue(repositoryError);

        await expect(handler.execute(baseCommand)).rejects.toThrow(
          repositoryError,
        );
      });

      it('should propagate customer creation errors', async () => {
        const createError = new Error('Failed to create customer');
        customerCreateMock.mockImplementation(() => {
          throw createError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(createError);
      });

      it('should handle mapper errors', async () => {
        const mapperError = new Error('Mapping failed');
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);
        toDtoMock.mockImplementation(() => {
          throw mapperError;
        });

        await expect(handler.execute(baseCommand)).rejects.toThrow(mapperError);
      });
    });

    describe('Complete flow integration', () => {
      it('should execute complete customer creation flow', async () => {
        const completeCommand = new CreateCustomerDto({
          name: 'Complete Customer',
          tenantId: 'tenant-complete',
          authIdentityId: 'auth-complete',
        });

        const expectedDto: CustomerDTO = {
          id: 'customer-id-complete',
          name: 'Complete Customer',
          tenantId: 'tenant-complete',
          authIdentityId: 'auth-complete',
          defaultPhoneNumberId: null,
          defaultShippingAddressId: null,
          defaultBillingAddressId: null,
          updatedAt: new Date('2024-03-01T00:00:00.000Z'),
          createdAt: new Date('2024-03-01T00:00:00.000Z'),
        };

        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);
        toDtoMock.mockReturnValue(expectedDto);

        const result = await handler.execute(completeCommand);

        expect(customerCreateMock).toHaveBeenCalledTimes(1);
        expect(mergeObjectContextMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
        expect(toDtoMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedDto);
      });

      it('should maintain data consistency throughout the flow', async () => {
        const customerData = {
          name: 'Consistency Customer',
          tenantId: 'tenant-consistency',
          authIdentityId: 'auth-consistency',
        };
        const command = new CreateCustomerDto(customerData);

        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(command);

        expect(customerCreateMock).toHaveBeenCalledWith(customerData);
        expect(createMock).toHaveBeenCalledWith(mockCustomer);
        expect(toDtoMock).toHaveBeenCalledWith(mockCustomer);
      });
    });

    describe('Business logic validation', () => {
      it('should create a new customer with default optional values', async () => {
        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);

        await handler.execute(baseCommand);

        expect(customerCreateMock).toHaveBeenCalledWith(baseCustomerData);
        expect(mockCustomer.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle concurrent customer creation requests', async () => {
        const command1 = new CreateCustomerDto({
          name: 'Customer One',
          tenantId: 'tenant-1',
          authIdentityId: 'auth-1',
        });
        const command2 = new CreateCustomerDto({
          name: 'Customer Two',
          tenantId: 'tenant-2',
          authIdentityId: 'auth-2',
        });

        mergeObjectContextMock.mockReturnValue(mockCustomer as never);
        createMock.mockResolvedValue(mockCustomer as unknown as Customer);

        const [result1, result2] = await Promise.all([
          handler.execute(command1),
          handler.execute(command2),
        ]);

        expect(customerCreateMock).toHaveBeenCalledTimes(2);
        expect(createMock).toHaveBeenCalledTimes(2);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });
  });
});
