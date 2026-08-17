import { AccountTypeEnum } from '../../../../aggregates/value-objects';
import { AuthenticationRegisterEvent } from '../../../../aggregates/events';
import { TenantProvisioningHandler } from '../tenant-provisioning.handler';

describe('TenantProvisioningHandler', () => {
  const tenantAdapter = {
    provisionTenant: jest.fn(),
    getTenantIdByAuthIdentityId: jest.fn(),
  };

  const eventFor = (
    accountType: AccountTypeEnum,
  ): AuthenticationRegisterEvent =>
    new AuthenticationRegisterEvent({
      get: (property: string) => {
        const values: Record<
          string,
          { getValue: () => AccountTypeEnum | string }
        > = {
          accountType: { getValue: () => accountType },
          email: { getValue: () => 'owner@example.com' },
          id: { getValue: () => 'auth-1' },
        };

        return values[property];
      },
    } as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provisions a tenant when a tenant identity registers', async () => {
    const handler = new TenantProvisioningHandler(tenantAdapter);

    await handler.handle(eventFor(AccountTypeEnum.TENANT));

    expect(tenantAdapter.provisionTenant).toHaveBeenCalledWith({
      ownerName: 'owner',
      authIdentityId: 'auth-1',
    });
  });

  it('does not provision a tenant for non-tenant identities', async () => {
    const handler = new TenantProvisioningHandler(tenantAdapter);

    await handler.handle(eventFor(AccountTypeEnum.CUSTOMER));

    expect(tenantAdapter.provisionTenant).not.toHaveBeenCalled();
  });
});
