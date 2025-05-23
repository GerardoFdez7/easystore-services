import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { AuthenticationLoginResponseDTO } from './sign-in.dto';
import { Email } from '../../../aggregates/value-objects';
import { AccountType } from '.prisma/postgres';
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
    const accountTypeEnum = accountType as AccountType;

    const { accessToken, refreshToken } = await this.authRepository.login(
      emailVO,
      password,
      accountTypeEnum,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
