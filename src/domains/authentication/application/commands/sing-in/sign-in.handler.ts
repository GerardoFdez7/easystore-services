import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { LoginResponseDTO } from '../../mappers';
import { Email, AccountType } from '../../../aggregates/value-objects';
import { AuthenticationLoginDTO } from './sign-in.dto';

@CommandHandler(AuthenticationLoginDTO)
export class AuthenticationLoginHandler
  implements ICommandHandler<AuthenticationLoginDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AuthenticationLoginDTO): Promise<LoginResponseDTO> {
    const { email, password, accountType } = command;

    const emailVO = Email.create(email);
    const accountTypeVO = AccountType.create(accountType);

    const authEntity = await this.authRepository.findByEmailAndAccountType(
      emailVO,
      accountTypeVO,
    );

    if (!authEntity) {
      throw new NotFoundException('User not found');
    }

    const auth = this.eventPublisher.mergeObjectContext(authEntity);

    const areCredentialsValid = await this.authRepository.validateCredentials(
      emailVO,
      password,
    );

    if (!areCredentialsValid) {
      auth.loginFailed();
      await this.authRepository.save(auth);
      auth.commit();
      throw new UnauthorizedException('Invalid credentials');
    }

    auth.loginSucceeded();

    const { accessToken, refreshToken } = await this.authRepository.login(
      emailVO,
      password,
      accountTypeVO,
    );

    await this.authRepository.save(auth);

    auth.commit();

    return { accessToken, refreshToken };
  }
}
