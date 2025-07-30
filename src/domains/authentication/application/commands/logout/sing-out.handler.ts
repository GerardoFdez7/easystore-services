import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { ResponseDTO } from '../../mappers';
import { Id } from '../../../aggregates/value-objects';
import { AuthenticationLogoutDTO } from './sing-out.dto';
import { verifyToken, invalidateToken } from '../../../infrastructure/jwt';

@CommandHandler(AuthenticationLogoutDTO)
export class AuthenticationLogoutHandler
  implements ICommandHandler<AuthenticationLogoutDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AuthenticationLogoutDTO): Promise<ResponseDTO> {
    const { token } = command;

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    // Verify the token and extract authIdentity ID from payload
    let authIdentityId: string;
    try {
      const decoded = verifyToken(token);
      authIdentityId = decoded.authIdentityId;
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const idVO = Id.create(authIdentityId);

    // Find the auth identity by ID
    const authEntity = await this.authRepository.findById(idVO);

    if (!authEntity) {
      throw new NotFoundException('User not found');
    }

    const auth = this.eventPublisher.mergeObjectContext(authEntity);

    // Invalidate the token
    invalidateToken(token);

    // Execute logout logic
    auth.logout();

    // Publish events
    auth.commit();

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
