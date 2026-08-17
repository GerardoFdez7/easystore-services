/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { TenantMapper } from '../../../mappers';
import { UpdateTenantDTO } from '../update-tenant.dto';
import { UpdateTenantHandler } from '../update-tenant.handler';

describe('UpdateTenantHandler', () => {
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f331';
  const tenant = { id: tenantId };
  const updatedTenant = { commit: jest.fn() };
  const dto = { id: tenantId, name: 'Updated store' };
  const repository = { findById: jest.fn(), update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new UpdateTenantDTO(tenantId, {
    businessName: 'Updated store',
  });
  let handler: UpdateTenantHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateTenantHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    repository.findById.mockResolvedValue(tenant);
    jest
      .spyOn(TenantMapper, 'fromUpdateDto')
      .mockReturnValue(updatedTenant as never);
    jest.spyOn(TenantMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(updatedTenant);
  });

  it('finds, updates, persists, commits, and maps the tenant aggregate', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
    );
    expect(TenantMapper.fromUpdateDto).toHaveBeenCalledWith(tenant, command);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      updatedTenant,
    );
    expect(updatedTenant.commit).toHaveBeenCalledTimes(1);
    expect(TenantMapper.toDto).toHaveBeenCalledWith(updatedTenant);
  });

  it('throws a precise error and performs no write for an unknown tenant', async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(handler.execute(command)).rejects.toThrow(
      new NotFoundException(`Tenant with ID ${tenantId} not found`),
    );
    expect(TenantMapper.fromUpdateDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('supports an empty patch and delegates value preservation to the domain', async () => {
    const emptyPatch = new UpdateTenantDTO(tenantId, {});

    await handler.execute(emptyPatch);

    expect(TenantMapper.fromUpdateDto).toHaveBeenCalledWith(tenant, emptyPatch);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('does not write when tenant domain validation rejects a patch', async () => {
    const error = new Error('Tenant name is invalid');
    jest.spyOn(TenantMapper, 'fromUpdateDto').mockImplementationOnce(() => {
      throw error;
    });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.update).not.toHaveBeenCalled();
    expect(updatedTenant.commit).not.toHaveBeenCalled();
  });

  it('does not commit or map a result when persistence fails', async () => {
    const error = new Error('tenant update conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(updatedTenant.commit).not.toHaveBeenCalled();
    expect(TenantMapper.toDto).not.toHaveBeenCalled();
  });
});
