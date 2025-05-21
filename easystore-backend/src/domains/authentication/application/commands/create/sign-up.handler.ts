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
    // Crear entidad de dominio a partir del DTO
    const auth = this.eventPublisher.mergeObjectContext(
      AuthenticationMapper.fromRegisterDto(command),
    );

    // Guardar en el repositorio
    await this.authRepository.save(auth);

    // Disparar eventos de dominio (si hay)
    auth.commit();

    // Retornar el DTO para la respuesta
    return AuthenticationMapper.toDto(auth);
  }
}
