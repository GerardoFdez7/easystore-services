import { EventPublisher } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AccountTypeEnum } from '../../../../aggregates/value-objects';
import {
  generateRefreshToken,
  generateToken,
} from '../../../../infrastructure/strategies';
import { AuthenticationLoginDTO } from '../sign-in.dto';
import { AuthenticationLoginHandler } from '../sign-in.handler';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: { compare: jest.fn() },
}));
jest.mock('../../../../infrastructure/strategies', () => ({
  generateToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

describe('AuthenticationLoginHandler', () => {
  const authIdentityId = '0198b746-8c72-7a2f-9c31-6d4f9866f311';
  const authRepository = {
    findByEmailAndAccountType: jest.fn(),
    update: jest.fn(),
  };
  const tenantAdapter = {
    getTenantIdByAuthIdentityId: jest.fn(),
    getTenantIdByDomain: jest.fn(),
  };
  const customerRepository = { findByAuthIdentityId: jest.fn() };
  const employeeRepository = { findByAuthIdentityId: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const id = { getValue: () => authIdentityId };
  const password = { getValue: () => 'stored-hash' };
  const auth: {
    get: jest.Mock;
    loginFailed: jest.Mock;
    loginSucceeded: jest.Mock;
    commit: jest.Mock;
  } = {
    get: jest.fn((key: string): unknown => {
      if (key === 'id') return id;
      if (key === 'password') return password;
      return null;
    }),
    loginFailed: jest.fn(),
    loginSucceeded: jest.fn(),
    commit: jest.fn(),
  };
  let handler: AuthenticationLoginHandler;

  const command = (
    accountType: AccountTypeEnum,
    domain?: string,
  ): AuthenticationLoginDTO =>
    new AuthenticationLoginDTO({
      email: 'user@example.com',
      password: 'secret',
      accountType,
      domain,
    } as never);

  beforeEach(() => {
    jest.clearAllMocks();
    auth.get.mockImplementation((key: string) => {
      if (key === 'id') return id;
      if (key === 'password') return password;
      return null;
    });
    handler = new AuthenticationLoginHandler(
      authRepository as never,
      tenantAdapter as never,
      customerRepository as never,
      employeeRepository as never,
      publisher as unknown as EventPublisher,
    );
    publisher.mergeObjectContext.mockReturnValue(auth);
    authRepository.findByEmailAndAccountType.mockResolvedValue(auth);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (generateToken as jest.Mock).mockReturnValue('access-token');
    (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
    tenantAdapter.getTenantIdByDomain.mockResolvedValue('tenant-1');
  });

  it.each([[AccountTypeEnum.CUSTOMER], [AccountTypeEnum.EMPLOYEE]])(
    'throws BadRequestException for %s sign-in without a domain',
    async (accountType) => {
      await expect(
        handler.execute(command(accountType)),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(authRepository.findByEmailAndAccountType).not.toHaveBeenCalled();
    },
  );

  it('uses a dummy password comparison and returns a generic error for an unknown identity', async () => {
    authRepository.findByEmailAndAccountType.mockResolvedValueOnce(null);

    await expect(
      handler.execute(command(AccountTypeEnum.CUSTOMER, 'tenant.example.com')),
    ).rejects.toThrow(new NotFoundException('Invalid credentials'));
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'dummy',
      '$2b$10$dummy.hash.to.prevent.timing.attacks',
    );
    expect(publisher.mergeObjectContext).not.toHaveBeenCalled();
    expect(authRepository.update).not.toHaveBeenCalled();
  });

  it('rejects a currently locked account before comparing the submitted password', async () => {
    auth.get.mockImplementation((key: string) => {
      if (key === 'lockedUntil') return new Date(Date.now() + 60_000);
      if (key === 'id') return id;
      if (key === 'password') return password;
      return null;
    });

    await expect(
      handler.execute(command(AccountTypeEnum.TENANT)),
    ).rejects.toThrow(ForbiddenException);
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(auth.loginFailed).not.toHaveBeenCalled();
  });

  it('records, persists, and publishes a failed password attempt', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await expect(
      handler.execute(command(AccountTypeEnum.CUSTOMER, 'tenant.example.com')),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'stored-hash');
    expect(auth.loginFailed).toHaveBeenCalledTimes(1);
    expect(authRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: authIdentityId }),
      auth,
    );
    expect(auth.commit).toHaveBeenCalledTimes(1);
    expect(generateToken).not.toHaveBeenCalled();
  });

  it.each([[AccountTypeEnum.CUSTOMER], [AccountTypeEnum.EMPLOYEE]])(
    'throws NotFoundException for %s sign-in when the domain does not resolve to a tenant',
    async (accountType) => {
      tenantAdapter.getTenantIdByDomain.mockResolvedValueOnce(null);

      await expect(
        handler.execute(command(accountType, 'unknown-tenant.example.com')),
      ).rejects.toThrow('Tenant not found for this domain');
      expect(generateToken).not.toHaveBeenCalled();
      expect(auth.loginSucceeded).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      AccountTypeEnum.TENANT,
      undefined,
      tenantAdapter,
      'getTenantIdByAuthIdentityId',
      'tenant-1',
      { tenantId: 'tenant-1', customerId: undefined, employeeId: undefined },
    ],
    [
      AccountTypeEnum.CUSTOMER,
      'tenant.example.com',
      customerRepository,
      'findByAuthIdentityId',
      { id: 'customer-1', tenantId: 'tenant-1' },
      { tenantId: 'tenant-1', customerId: 'customer-1', employeeId: undefined },
    ],
    [
      AccountTypeEnum.EMPLOYEE,
      'tenant.example.com',
      employeeRepository,
      'findByAuthIdentityId',
      { id: 'employee-1', tenantId: 'tenant-1' },
      { tenantId: 'tenant-1', customerId: undefined, employeeId: 'employee-1' },
    ],
  ])(
    'issues correctly scoped tokens for a %s identity',
    async (
      accountType,
      domain,
      relatedProvider,
      profileMethod,
      relatedIdentity,
      scope,
    ) => {
      const provider = relatedProvider as Record<string, jest.Mock>;
      provider[profileMethod].mockResolvedValueOnce(relatedIdentity);

      await expect(
        handler.execute(command(accountType, domain)),
      ).resolves.toEqual({
        success: true,
        message: 'Login successful',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(auth.loginSucceeded).toHaveBeenCalledTimes(1);
      expect(authRepository.update).toHaveBeenCalledTimes(1);
      expect(provider[profileMethod]).toHaveBeenCalledWith(
        accountType === AccountTypeEnum.EMPLOYEE ? id : authIdentityId,
      );
      expect(generateToken).toHaveBeenCalledWith({
        email: 'user@example.com',
        authIdentityId,
        ...scope,
      });
      expect(generateRefreshToken).toHaveBeenCalledWith({
        email: 'user@example.com',
        authIdentityId,
        ...scope,
      });
      expect(auth.commit).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [
      AccountTypeEnum.TENANT,
      undefined,
      tenantAdapter,
      'getTenantIdByAuthIdentityId',
      'Tenant',
    ],
    [
      AccountTypeEnum.CUSTOMER,
      'tenant.example.com',
      customerRepository,
      'findByAuthIdentityId',
      'Customer',
    ],
    [
      AccountTypeEnum.EMPLOYEE,
      'tenant.example.com',
      employeeRepository,
      'findByAuthIdentityId',
      'Employee',
    ],
  ])(
    'does not issue tokens when the %s profile is missing',
    async (accountType, domain, relatedProvider, profileMethod, label) => {
      const provider = relatedProvider as Record<string, jest.Mock>;
      provider[profileMethod].mockResolvedValueOnce(null);

      await expect(
        handler.execute(command(accountType, domain)),
      ).rejects.toThrow(`${label} not found for this auth identity`);
      expect(generateToken).not.toHaveBeenCalled();
      expect(generateRefreshToken).not.toHaveBeenCalled();
      expect(auth.loginSucceeded).not.toHaveBeenCalled();
      expect(authRepository.update).not.toHaveBeenCalled();
      expect(auth.commit).not.toHaveBeenCalled();
    },
  );

  it.each([
    [AccountTypeEnum.CUSTOMER, customerRepository],
    [AccountTypeEnum.EMPLOYEE, employeeRepository],
  ])(
    'rejects a %s identity whose tenant does not match the resolved domain tenant',
    async (accountType, relatedProvider) => {
      const provider = relatedProvider as Record<string, jest.Mock>;
      provider.findByAuthIdentityId.mockResolvedValueOnce({
        id: 'related-1',
        tenantId: 'other-tenant',
      });

      await expect(
        handler.execute(command(accountType, 'tenant.example.com')),
      ).rejects.toThrow('not found for this auth identity');
      expect(generateToken).not.toHaveBeenCalled();
      expect(auth.loginSucceeded).not.toHaveBeenCalled();
    },
  );
});
