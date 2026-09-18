import { EventPublisher } from '@nestjs/cqrs';
import { CreateStoreDTO } from '../create-store.dto';
import { CreateStoreHandler } from '../create-store.handler';
import { StoreMapper } from '../../../mappers';

describe('CreateStoreHandler', () => {
  const store = { commit: jest.fn() };
  const repository = { create: jest.fn() };
  const events = { mergeObjectContext: jest.fn() };
  const command = new CreateStoreDTO({
    tenantId: 'tenant-a',
    name: 'A',
  });
  let handler: CreateStoreHandler;
  beforeEach(() => {
    jest.clearAllMocks();
    handler = new CreateStoreHandler(
      repository as never,
      events as unknown as EventPublisher,
    );
    jest.spyOn(StoreMapper, 'fromCreateDto').mockReturnValue(store as never);
    jest
      .spyOn(StoreMapper, 'toDto')
      .mockReturnValue({ id: 'store-a' } as never);
    events.mergeObjectContext.mockReturnValue(store);
    repository.create.mockResolvedValue(store);
  });
  it('persists before committing and maps the created Store', async () => {
    await expect(handler.execute(command)).resolves.toEqual({ id: 'store-a' });
    expect(repository.create).toHaveBeenCalledWith(store);
    expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(
      store.commit.mock.invocationCallOrder[0],
    );
  });
  it('does not commit when persistence fails', async () => {
    repository.create.mockRejectedValueOnce(new Error('conflict'));
    await expect(handler.execute(command)).rejects.toThrow('conflict');
    expect(store.commit).not.toHaveBeenCalled();
  });
});
