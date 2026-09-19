/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  TransactionManager,
  TransactionalEventPublisher,
} from '@shared/infrastructure/postgres';
import { AccountTypeEnum } from '../../../../aggregates/value-objects';
import { AuthIdentity } from '../../../../aggregates/entities';
import { AuthenticationMapper } from '../../../mappers';
import { AuthenticationRegisterDTO } from '../sign-up.dto';
import { AuthenticationRegisterHandler } from '../sign-up.handler';

describe('AuthenticationRegisterHandler', () => {
  const auth = { commit: jest.fn() };
  const dto = { id: 'auth-1', email: 'owner@example.com' };
  const repository = { create: jest.fn() };
  const storeAdapter = { getStoreByDomain: jest.fn() };
  const tenantOnboarding = { provision: jest.fn() };
  const customerOnboarding = { provision: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const tenantCommand = new AuthenticationRegisterDTO({
    email: 'owner@example.com',
    password: 'StrongPassword123!',
    accountType: AccountTypeEnum.TENANT,
  } as never);
  let handler: AuthenticationRegisterHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new AuthenticationRegisterHandler(
      repository as never,
      storeAdapter as never,
      tenantOnboarding as never,
      customerOnboarding as never,
      publisher as unknown as EventPublisher,
    );
    jest
      .spyOn(AuthenticationMapper, 'fromRegisterDto')
      .mockReturnValue(auth as never);
    jest.spyOn(AuthenticationMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(auth);
  });

  it('provisions a tenant atomically before committing its post-commit event', async () => {
    await expect(handler.execute(tenantCommand)).resolves.toBe(dto);

    expect(tenantOnboarding.provision).toHaveBeenCalledWith(auth, undefined);
    expect(customerOnboarding.provision).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(auth.commit).toHaveBeenCalledTimes(1);
    expect(tenantOnboarding.provision.mock.invocationCallOrder[0]).toBeLessThan(
      auth.commit.mock.invocationCallOrder[0],
    );
  });

  it('does not commit an event or expose a retry result when onboarding rolls back', async () => {
    const failure = new Error('duplicate domain');
    tenantOnboarding.provision.mockRejectedValueOnce(failure);

    await expect(handler.execute(tenantCommand)).rejects.toBe(failure);
    expect(auth.commit).not.toHaveBeenCalled();
    expect(AuthenticationMapper.toDto).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns the registered identity when post-commit event delivery fails', async () => {
    const deliveryFailure = new Error('event bus unavailable');
    const eventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(() => {
        throw deliveryFailure;
      }),
    };
    const transactionManager = new TransactionManager({
      $transaction: jest.fn(),
    } as never);
    const transactionalPublisher = new TransactionalEventPublisher(
      eventBus as never,
      transactionManager,
    );
    const aggregate = AuthIdentity.create({
      email: 'owner@example.com',
      password: 'StrongPassword123!',
      accountType: AccountTypeEnum.TENANT,
    });
    handler = new AuthenticationRegisterHandler(
      repository as never,
      storeAdapter as never,
      tenantOnboarding as never,
      customerOnboarding as never,
      transactionalPublisher,
    );
    jest
      .spyOn(AuthenticationMapper, 'fromRegisterDto')
      .mockReturnValue(aggregate);
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(handler.execute(tenantCommand)).resolves.toBe(dto);

    expect(tenantOnboarding.provision).toHaveBeenCalledWith(
      aggregate,
      undefined,
    );
    expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledWith(
      'A post-commit callback failed after the database transaction completed.',
      deliveryFailure.stack,
    );
  });

  it('propagates a customer onboarding transaction failure without committing identity state', async () => {
    const failure = new Error('cart insert failed');
    customerOnboarding.provision.mockRejectedValueOnce(failure);
    storeAdapter.getStoreByDomain.mockResolvedValueOnce({
      id: 'trusted-store-1',
      tenantId: 'tenant-1',
    });
    const command = new AuthenticationRegisterDTO({
      email: 'person@example.com',
      password: 'StrongPassword123!',
      accountType: AccountTypeEnum.CUSTOMER,
      domain: 'shop.example.com',
    } as never);

    await expect(handler.execute(command)).rejects.toBe(failure);
    expect(customerOnboarding.provision).toHaveBeenCalledWith(
      auth,
      'trusted-store-1',
    );
    expect(repository.create).not.toHaveBeenCalled();
    expect(auth.commit).not.toHaveBeenCalled();
  });

  it.each([[AccountTypeEnum.CUSTOMER], [AccountTypeEnum.EMPLOYEE]])(
    'rejects %s registration without a Store domain before creating identity state',
    async (accountType) => {
      const command = new AuthenticationRegisterDTO({
        email: 'person@example.com',
        password: 'StrongPassword123!',
        accountType,
      } as never);

      await expect(handler.execute(command)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(storeAdapter.getStoreByDomain).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(auth.commit).not.toHaveBeenCalled();
    },
  );

  it('does not create or commit a customer identity for an unknown Store domain', async () => {
    storeAdapter.getStoreByDomain.mockResolvedValueOnce(null);
    const command = new AuthenticationRegisterDTO({
      email: 'person@example.com',
      password: 'StrongPassword123!',
      accountType: AccountTypeEnum.CUSTOMER,
      domain: 'unknown.example.com',
    } as never);

    await expect(handler.execute(command)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.create).not.toHaveBeenCalled();
    expect(auth.commit).not.toHaveBeenCalled();
  });

  it('uses only the Store resolved from the domain for customer onboarding without post-registration provisioning', async () => {
    storeAdapter.getStoreByDomain.mockResolvedValueOnce({
      id: 'store-1',
      tenantId: 'tenant-1',
    });
    const command = new AuthenticationRegisterDTO({
      email: 'person@example.com',
      password: 'StrongPassword123!',
      accountType: AccountTypeEnum.CUSTOMER,
      domain: 'shop.example.com',
    } as never);

    await expect(handler.execute(command)).resolves.toBe(dto);
    expect(customerOnboarding.provision).toHaveBeenCalledWith(auth, 'store-1');
    expect(tenantOnboarding.provision).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(auth.commit).toHaveBeenCalledTimes(1);
  });

  it('creates and commits an employee identity after its Store domain resolves', async () => {
    storeAdapter.getStoreByDomain.mockResolvedValueOnce({
      id: 'store-1',
      tenantId: 'tenant-1',
    });
    const command = new AuthenticationRegisterDTO({
      email: 'employee@example.com',
      password: 'StrongPassword123!',
      accountType: AccountTypeEnum.EMPLOYEE,
      domain: 'shop.example.com',
    } as never);

    await expect(handler.execute(command)).resolves.toBe(dto);
    expect(repository.create).toHaveBeenCalledWith(auth);
    expect(customerOnboarding.provision).not.toHaveBeenCalled();
    expect(auth.commit).toHaveBeenCalledTimes(1);
  });
});
