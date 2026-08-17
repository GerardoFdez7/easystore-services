/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { TenantMapper } from '../../../mappers';
import { TenantSingUpDTO } from '../sing-up.dto';
import { TenantSingUpHandler } from '../sing-up.handler';

describe('TenantSingUpHandler', () => {
  const tenant = { commit: jest.fn() };
  const dto = { id: 'tenant-1', name: 'Easy Store' };
  const repository = { create: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new TenantSingUpDTO({
    name: 'Easy Store',
    authIdentityId: 'auth-1',
  } as never);
  let handler: TenantSingUpHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new TenantSingUpHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    jest.spyOn(TenantMapper, 'fromCreateDto').mockReturnValue(tenant as never);
    jest.spyOn(TenantMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(tenant);
  });

  it('creates a tenant aggregate linked to its authentication identity', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(TenantMapper.fromCreateDto).toHaveBeenCalledWith(command);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(tenant);
    expect(repository.create).toHaveBeenCalledWith(tenant);
    expect(tenant.commit).toHaveBeenCalledTimes(1);
    expect(TenantMapper.toDto).toHaveBeenCalledWith(tenant);
    expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(
      tenant.commit.mock.invocationCallOrder[0],
    );
  });

  it('does not persist when domain creation rejects invalid tenant data', async () => {
    const error = new Error('Tenant name is required');
    jest.spyOn(TenantMapper, 'fromCreateDto').mockImplementationOnce(() => {
      throw error;
    });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.create).not.toHaveBeenCalled();
    expect(tenant.commit).not.toHaveBeenCalled();
  });

  it('does not commit or map a response when persistence fails', async () => {
    const error = new Error('authentication identity already has a tenant');
    repository.create.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(tenant.commit).not.toHaveBeenCalled();
    expect(TenantMapper.toDto).not.toHaveBeenCalled();
  });
});
