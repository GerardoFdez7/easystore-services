/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { findAddressOrThrow } from '../../../address-owner';
import { AddressMapper } from '../../../mappers';
import { UpdateAddressDTO } from '../update-address.dto';
import { UpdateAddressHandler } from '../update-address.handler';

jest.mock('../../../address-owner', () => ({ findAddressOrThrow: jest.fn() }));

describe('UpdateAddressHandler', () => {
  const originalAddress = { id: 'address-1' };
  const updatedAddress = { commit: jest.fn() };
  const dto = { id: 'address-1', city: 'Guatemala City' };
  const addressId = { value: 'address-1' };
  const owner = { value: 'tenant-1' };
  const repository = { update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  let handler: UpdateAddressHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateAddressHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findAddressOrThrow as jest.Mock).mockResolvedValue({
      address: originalAddress,
      addressId,
      owner,
    } as never);
    jest
      .spyOn(AddressMapper, 'fromUpdateDto')
      .mockReturnValue(updatedAddress as never);
    jest.spyOn(AddressMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(updatedAddress);
  });

  it('updates the address within its resolved owner boundary', async () => {
    const command = new UpdateAddressDTO(
      'address-1',
      'tenant-1',
      undefined as never,
      { city: 'Guatemala City' },
    );

    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findAddressOrThrow).toHaveBeenCalledWith(
      repository,
      'address-1',
      'tenant-1',
      undefined,
    );
    expect(AddressMapper.fromUpdateDto).toHaveBeenCalledWith(
      originalAddress,
      command,
    );
    expect(repository.update).toHaveBeenCalledWith(
      addressId,
      owner,
      updatedAddress,
    );
    expect(updatedAddress.commit).toHaveBeenCalledTimes(1);
    expect(AddressMapper.toDto).toHaveBeenCalledWith(updatedAddress);
  });

  it('does not map or persist when lookup rejects an invalid owner combination', async () => {
    const error = new Error('You must provide either tenantId or customerId');
    (findAddressOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(
      handler.execute(
        new UpdateAddressDTO('address-1', 'tenant-1', 'customer-1', {}),
      ),
    ).rejects.toBe(error);
    expect(AddressMapper.fromUpdateDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not commit or map a response when persistence fails', async () => {
    const error = new Error('update failed');
    repository.update.mockRejectedValueOnce(error);

    await expect(
      handler.execute(
        new UpdateAddressDTO('address-1', 'tenant-1', undefined as never, {}),
      ),
    ).rejects.toBe(error);
    expect(updatedAddress.commit).not.toHaveBeenCalled();
    expect(AddressMapper.toDto).not.toHaveBeenCalled();
  });
});
