import { EventPublisher } from '@nestjs/cqrs';
import { SetDefaultStoreDTO } from '../set-default-store.dto';
import { SetDefaultStoreHandler } from '../set-default-store.handler';
import { TenantMapper } from '../../../mappers';

describe('SetDefaultStoreHandler', () => {
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f331';
  const storeId = '0198b746-8c72-7a2f-9c31-6d4f9866f332';
  const foreignStoreId = '0198b746-8c72-7a2f-9c31-6d4f9866f333';
  const tenant = {
    setDefaultStore: jest.fn(),
    commit: jest.fn(),
    toDTO: jest.fn(),
  };
  const repository = { findById: jest.fn(), update: jest.fn() };
  const storeOwnership = { belongsToTenant: jest.fn() };
  const publisher = {
    mergeObjectContext: jest.fn(),
  } as unknown as EventPublisher;
  const handler = new SetDefaultStoreHandler(
    repository as never,
    storeOwnership as never,
    publisher,
  );

  beforeEach(() => jest.clearAllMocks());

  it('verifies ownership, persists, then commits the transition', async () => {
    repository.findById.mockResolvedValue(tenant);
    storeOwnership.belongsToTenant.mockResolvedValue(true);
    (publisher.mergeObjectContext as jest.Mock).mockReturnValue(tenant);
    repository.update.mockResolvedValue(tenant);
    jest
      .spyOn(TenantMapper, 'toDto')
      .mockReturnValue({ id: tenantId } as never);

    await handler.execute(new SetDefaultStoreDTO(tenantId, storeId));

    expect(storeOwnership.belongsToTenant).toHaveBeenCalledWith(
      storeId,
      tenantId,
    );
    expect(repository.update).toHaveBeenCalled();
    expect(tenant.commit).toHaveBeenCalledTimes(1);
  });

  it('does not persist or commit a store outside the tenant', async () => {
    repository.findById.mockResolvedValue(tenant);
    storeOwnership.belongsToTenant.mockResolvedValue(false);
    await expect(
      handler.execute(new SetDefaultStoreDTO(tenantId, foreignStoreId)),
    ).rejects.toThrow('Store not found');
    expect(repository.update).not.toHaveBeenCalled();
    expect(tenant.commit).not.toHaveBeenCalled();
  });
});
