import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { AuthenticationMapper } from '../../mappers';
import { AuthenticationRegisterDTO } from './sign-up.dto';
import { AuthenticationDTO } from '../../mappers/auth/authentication.dto';

@CommandHandler(AuthenticationRegisterDTO)
export class AuthenticationRegisterHandler
  implements ICommandHandler<AuthenticationRegisterDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: AuthenticationRegisterDTO,
  ): Promise<AuthenticationDTO> {
    // Execute domain logic
    const auth = this.eventPublisher.mergeObjectContext(
      AuthenticationMapper.fromRegisterDto(command),
    );

    // Persist entity
    await this.authRepository.create(auth);

    // Publish event
    auth.commit();

    // Return DTO
    return AuthenticationMapper.toDto(auth);
  }
}
