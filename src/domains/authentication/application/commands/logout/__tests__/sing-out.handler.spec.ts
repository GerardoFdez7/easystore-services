import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { invalidateToken, verifyToken } from '../../../../infrastructure/jwt';
import { AuthenticationLogoutDTO } from '../sing-out.dto';
import { AuthenticationLogoutHandler } from '../sing-out.handler';

jest.mock('../../../../infrastructure/jwt', () => ({
  verifyToken: jest.fn(),
  invalidateToken: jest.fn(),
}));

describe('AuthenticationLogoutHandler', () => {
  const authIdentityId = '0198b746-8c72-7a2f-9c31-6d4f9866f311';
  const repository = { findById: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const auth = { logout: jest.fn(), commit: jest.fn() };
  let handler: AuthenticationLogoutHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new AuthenticationLogoutHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (verifyToken as jest.Mock).mockReturnValue({ authIdentityId });
    repository.findById.mockResolvedValue(auth);
    publisher.mergeObjectContext.mockReturnValue(auth);
  });

  it('rejects an absent token without consulting dependencies', async () => {
    await expect(
      handler.execute(new AuthenticationLogoutDTO('')),
    ).rejects.toThrow(
      new UnauthorizedException('No authentication token provided'),
    );
    expect(verifyToken).not.toHaveBeenCalled();
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('normalizes invalid or expired token errors', async () => {
    (verifyToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    await expect(
      handler.execute(new AuthenticationLogoutDTO('expired')),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
    expect(repository.findById).not.toHaveBeenCalled();
    expect(invalidateToken).not.toHaveBeenCalled();
  });

  it('rejects a valid token whose identity no longer exists', async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      handler.execute(new AuthenticationLogoutDTO('valid-token')),
    ).rejects.toThrow(new NotFoundException('User not found'));
    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ value: authIdentityId }),
    );
    expect(invalidateToken).not.toHaveBeenCalled();
  });

  it('invalidates the token, records logout, commits, and returns success', async () => {
    await expect(
      handler.execute(new AuthenticationLogoutDTO('valid-token')),
    ).resolves.toEqual({ success: true, message: 'Logout successful' });

    expect(invalidateToken).toHaveBeenCalledWith('valid-token');
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(auth.commit).toHaveBeenCalledTimes(1);
    expect(
      (invalidateToken as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan(auth.logout.mock.invocationCallOrder[0]);
  });
});
