/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { AddressMapper } from '../../../mappers';
import { CreateAddressDTO } from '../create-address.dto';
import { CreateAddressHandler } from '../create-address.handler';

describe('CreateAddressHandler', () => {
  const address = { commit: jest.fn() };
  const dto = { id: 'address-1' };
  const repository = { create: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  let handler: CreateAddressHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new CreateAddressHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    jest
      .spyOn(AddressMapper, 'fromCreateDto')
      .mockReturnValue(address as never);
    jest.spyOn(AddressMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(address);
  });

  it.each([
    ['neither owner', { street: 'Main Street' }],
    [
      'both owners',
      { street: 'Main Street', tenantId: 'tenant-1', customerId: 'customer-1' },
    ],
  ])('rejects an address with %s', async (_case, data) => {
    const command = new CreateAddressDTO(data as never);

    await expect(handler.execute(command)).rejects.toThrow(
      'You must provide either tenantId or customerId',
    );
    expect(AddressMapper.fromCreateDto).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it.each([
    ['tenant', { street: 'Main Street', tenantId: 'tenant-1' }],
    ['customer', { street: 'Main Street', customerId: 'customer-1' }],
  ])(
    'creates, commits, and maps an address owned by a %s',
    async (_case, data) => {
      const command = new CreateAddressDTO(data as never);

      await expect(handler.execute(command)).resolves.toBe(dto);

      expect(AddressMapper.fromCreateDto).toHaveBeenCalledWith(data);
      expect(publisher.mergeObjectContext).toHaveBeenCalledWith(address);
      expect(repository.create).toHaveBeenCalledWith(address);
      expect(address.commit).toHaveBeenCalledTimes(1);
      expect(AddressMapper.toDto).toHaveBeenCalledWith(address);
      expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(
        address.commit.mock.invocationCallOrder[0],
      );
    },
  );

  it('does not commit when persistence fails', async () => {
    const error = new Error('database unavailable');
    repository.create.mockRejectedValueOnce(error);

    await expect(
      handler.execute(new CreateAddressDTO({ tenantId: 'tenant-1' } as never)),
    ).rejects.toBe(error);
    expect(address.commit).not.toHaveBeenCalled();
    expect(AddressMapper.toDto).not.toHaveBeenCalled();
  });
});
