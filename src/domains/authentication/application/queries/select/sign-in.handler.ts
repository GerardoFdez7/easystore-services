import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { AuthenticationLoginResponseDTO } from './sign-in.dto';
import { Email, AccountType } from '../../../aggregates/value-objects';
import { AuthenticationLoginCommand } from '../../queries/select/sign-in.dto';

@CommandHandler(AuthenticationLoginCommand)
export class AuthenticationLoginHandler
  implements
    ICommandHandler<AuthenticationLoginCommand, AuthenticationLoginResponseDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    command: AuthenticationLoginCommand,
  ): Promise<AuthenticationLoginResponseDTO> {
    const { email, password, accountType } = command;

    const emailVO = Email.create(email);

    const { accessToken, refreshToken } = await this.authRepository.login(
      emailVO,
      password,
      AccountType.create(accountType),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
