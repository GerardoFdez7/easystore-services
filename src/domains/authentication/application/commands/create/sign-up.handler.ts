import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { AuthenticationMapper } from '../../mappers';
import { AuthenticationRegisterDTO } from '../create/sign-up.dto';
import { AuthenticationDTO } from '../../mappers/authentication.dto';

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
    const auth = this.eventPublisher.mergeObjectContext(
      AuthenticationMapper.fromRegisterDto(command),
    );
    await this.authRepository.save(auth);
    auth.commit();
    return AuthenticationMapper.toDto(auth);
  }
}
