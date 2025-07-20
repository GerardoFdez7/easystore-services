import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { LogoutResponseDTO } from '../../mappers';
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

  async execute(command: AuthenticationLogoutDTO): Promise<LogoutResponseDTO> {
    const { token } = command;

    // Verify the token and extract user ID from payload
    let userId: string;
    try {
      const decoded = verifyToken(token);
      userId = decoded.id;
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const idVO = Id.create(userId);

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
    };
  }
}
