import { EventPublisher } from '@nestjs/cqrs';
import { UpdateStoreDTO } from '../update-store.dto';
import { UpdateStoreHandler } from '../update-store.handler';
import { StoreMapper } from '../../../mappers';

describe('UpdateStoreHandler', () => {
  const storeId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const existing = {};
  const updated = { commit: jest.fn() };
  const repository = { findByIdAndTenantId: jest.fn(), update: jest.fn() };
  const events = { mergeObjectContext: jest.fn() };
  const command = new UpdateStoreDTO(storeId, tenantId, {
    name: 'A',
  });
  let handler: UpdateStoreHandler;
  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateStoreHandler(
      repository as never,
      events as unknown as EventPublisher,
    );
    repository.findByIdAndTenantId.mockResolvedValue(existing);
    events.mergeObjectContext.mockReturnValue(updated);
    repository.update.mockResolvedValue(updated);
    jest.spyOn(StoreMapper, 'fromUpdateDto').mockReturnValue(updated as never);
    jest.spyOn(StoreMapper, 'toDto').mockReturnValue({ id: storeId } as never);
  });
  it('uses the tenant-qualified lookup before updating and commits after persistence', async () => {
    await handler.execute(command);
    expect(repository.findByIdAndTenantId).toHaveBeenCalledWith(
      expect.objectContaining({ value: storeId }),
      expect.objectContaining({ value: tenantId }),
    );
    expect(repository.update.mock.invocationCallOrder[0]).toBeLessThan(
      updated.commit.mock.invocationCallOrder[0],
    );
  });
  it('does not write a foreign or missing Store', async () => {
    repository.findByIdAndTenantId.mockResolvedValueOnce(null);
    await expect(handler.execute(command)).rejects.toThrow('not found');
    expect(repository.update).not.toHaveBeenCalled();
  });
});
