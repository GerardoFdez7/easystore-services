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
} from '../../../infrastructure/jwt';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { ITenantRepository } from '../../../../tenant/aggregates/repositories/tenant.interface';
import { LoginResponseDTO } from '../../mappers';
import {
  Id,
  Email,
  AccountType,
  AccountTypeEnum,
} from '../../../aggregates/value-objects';
import { AuthenticationLoginDTO } from './sign-in.dto';

@CommandHandler(AuthenticationLoginDTO)
export class AuthenticationLoginHandler
  implements ICommandHandler<AuthenticationLoginDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AuthenticationLoginDTO): Promise<LoginResponseDTO> {
    const { data } = command;

    const emailVO = Email.create(data.email);
    const accountTypeVO = AccountType.create(data.accountType);

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
    const areCredentialsValid = await bcrypt.compare(
      data.password,
      storedPassword,
    );

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

    // Determine user ID based on account type
    let userId: string;
    const authIdentityId = auth.get('id');

    if (accountTypeVO.getValue() === AccountTypeEnum.TENANT) {
      // For tenants, find the tenant entity and return its ID
      const tenant =
        await this.tenantRepository.findByAuthIdentityId(authIdentityId);
      if (tenant) {
        userId = tenant.get('id').getValue();
      } else {
        // Fallback to authIdentity ID if tenant not found
        userId = authIdentityId.getValue();
      }
    } else {
      // For customers and employees, return the authIdentity ID
      // since they don't have separate domain entities yet
      userId = authIdentityId.getValue();
    }

    auth.commit();

    return { accessToken, refreshToken, userId };
  }
}
