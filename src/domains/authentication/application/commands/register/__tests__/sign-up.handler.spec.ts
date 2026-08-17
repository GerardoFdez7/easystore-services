/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { AuthenticationMapper } from '../../../mappers';
import { AccountTypeEnum } from '../../../../aggregates/value-objects';
import { AuthenticationRegisterDTO } from '../sign-up.dto';
import { AuthenticationRegisterHandler } from '../sign-up.handler';

describe('AuthenticationRegisterHandler', () => {
  const auth = { commit: jest.fn() };
  const dto = { id: 'auth-1', email: 'owner@example.com' };
  const repository = { create: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new AuthenticationRegisterDTO({
    email: 'owner@example.com',
    password: 'StrongPassword123!',
    accountType: AccountTypeEnum.TENANT,
  } as never);
  let handler: AuthenticationRegisterHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new AuthenticationRegisterHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    jest
      .spyOn(AuthenticationMapper, 'fromRegisterDto')
      .mockReturnValue(auth as never);
    jest.spyOn(AuthenticationMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(auth);
  });

  it('creates the identity through the domain mapper and publishes its event', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(AuthenticationMapper.fromRegisterDto).toHaveBeenCalledWith(command);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(auth);
    expect(repository.create).toHaveBeenCalledWith(auth);
    expect(auth.commit).toHaveBeenCalledTimes(1);
    expect(AuthenticationMapper.toDto).toHaveBeenCalledWith(auth);
    expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(
      auth.commit.mock.invocationCallOrder[0],
    );
  });

  it('does not persist when domain creation rejects invalid registration data', async () => {
    const error = new Error('Invalid email');
    jest
      .spyOn(AuthenticationMapper, 'fromRegisterDto')
      .mockImplementationOnce(() => {
        throw error;
      });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.create).not.toHaveBeenCalled();
    expect(auth.commit).not.toHaveBeenCalled();
  });

  it('does not commit or expose a DTO when persistence fails', async () => {
    const error = new Error('duplicate identity');
    repository.create.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(auth.commit).not.toHaveBeenCalled();
    expect(AuthenticationMapper.toDto).not.toHaveBeenCalled();
  });
});
