import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccountTypeEnum } from '../../../../aggregates/value-objects';
import { generateToken } from '../../../../infrastructure/strategies';
import { SwitchStoreDTO } from '../switch-store.dto';
import { SwitchStoreHandler } from '../switch-store.handler';

jest.mock('../../../../infrastructure/strategies', () => ({
  generateToken: jest.fn(),
}));

describe('SwitchStoreHandler', () => {
  const storeAdapter = { validateStoreInTenant: jest.fn() };
  const handler = new SwitchStoreHandler(storeAdapter as never);
  const user = {
    email: 'owner@example.com',
    accountType: AccountTypeEnum.TENANT,
    authIdentityId: 'identity-1',
    tenantId: 'tenant-1',
    storeId: 'store-old',
  };

  beforeEach(() => jest.clearAllMocks());

  it('validates the trusted tenant then signs the replacement scope', async () => {
    storeAdapter.validateStoreInTenant.mockResolvedValue({
      id: 'store-new',
      tenantId: 'tenant-1',
    });
    (generateToken as jest.Mock).mockReturnValue('rotated-token');

    await expect(
      handler.execute(new SwitchStoreDTO('store-new', user)),
    ).resolves.toEqual({
      success: true,
      message: 'Store switched successfully',
      accessToken: 'rotated-token',
    });
    expect(storeAdapter.validateStoreInTenant).toHaveBeenCalledWith(
      'store-new',
      'tenant-1',
    );
    expect(generateToken).toHaveBeenCalledWith({
      ...user,
      storeId: 'store-new',
    });
  });

  it('does not sign a foreign or missing store', async () => {
    storeAdapter.validateStoreInTenant.mockResolvedValue(null);
    await expect(
      handler.execute(new SwitchStoreDTO('other-store', user)),
    ).rejects.toThrow(NotFoundException);
    expect(generateToken).not.toHaveBeenCalled();
  });

  it('does not accept a non-owner identity even if it supplies a tenant claim', async () => {
    await expect(
      handler.execute(
        new SwitchStoreDTO('store-new', {
          ...user,
          accountType: AccountTypeEnum.EMPLOYEE,
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(storeAdapter.validateStoreInTenant).not.toHaveBeenCalled();
  });

  it('propagates adapter failures without minting a token', async () => {
    storeAdapter.validateStoreInTenant.mockRejectedValue(
      new Error('database unavailable'),
    );
    await expect(
      handler.execute(new SwitchStoreDTO('store-new', user)),
    ).rejects.toThrow('database unavailable');
    expect(generateToken).not.toHaveBeenCalled();
  });
});
