import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  generateToken,
  generateRefreshToken,
  JwtPayload,
} from '../../../infrastructure/jwt/jwt-handler';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { LoginResponseDTO } from '../../mappers';
import { Id, Email, AccountType } from '../../../aggregates/value-objects';
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

    // Get user with account type
    const authEntity = await this.authRepository.findByEmailAndAccountType(
      emailVO,
      accountTypeVO,
    );

    if (!authEntity) {
      // Prevent timing attacks by still hashing a dummy password
      await bcrypt.compare(
        'dummy',
        '$2b$10$dummy.hash.to.prevent.timing.attacks',
      );
      throw new NotFoundException('Invalid credentials');
    }

    const auth = this.eventPublisher.mergeObjectContext(authEntity);

    // Check if account is locked
    const lockedUntil = auth.get('lockedUntil');
    if (lockedUntil && new Date() < lockedUntil) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    // Validate credentials
    const storedPassword = auth.get('password').getValue();
    const areCredentialsValid = await bcrypt.compare(password, storedPassword);

    const id = auth.get('id').getValue();
    const IdVO = Id.create(id);

    if (!areCredentialsValid) {
      auth.loginFailed();
      await this.authRepository.update(IdVO, auth);
      auth.commit();
      throw new UnauthorizedException('Invalid credentials');
    }

    // Success flow
    auth.loginSucceeded();
    await this.authRepository.update(IdVO, auth);

    // Generate tokens
    const payload: JwtPayload = {
      email: emailVO.getValue(),
      id: auth.get('id').getValue(),
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    auth.commit();

    return { accessToken, refreshToken };
  }
}
