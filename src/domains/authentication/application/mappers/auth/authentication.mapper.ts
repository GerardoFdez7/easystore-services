import { AuthIdentity, IAuthIdentityType } from '../../../aggregates/entities';
import {
  Email,
  Password,
  IsActive,
  EmailVerified,
  AccountType,
  Id,
} from '../../../aggregates/value-objects';
import { AuthenticationDTO } from './authentication.dto';
import { AuthenticationRegisterDTO } from '../../commands';

/**
 * Centralized mapper for Authentication domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class AuthenticationMapper {
  /**
   * Maps a persistence Authentication model to a domain Authentication entity
   * @param persistenceAuth The persistence Authentication model
   * @returns The mapped Authentication domain entity
   */
  static fromPersistence(persistenceAuth: IAuthIdentityType): AuthIdentity {
    return AuthIdentity.reconstitute({
      id: Id.create(persistenceAuth.id),
      email: Email.create(persistenceAuth.email),
      password: Password.create(persistenceAuth.password),
      accountType: AccountType.create(persistenceAuth.accountType),
      isActive: IsActive.create(persistenceAuth.isActive),
      emailVerified: EmailVerified.create(persistenceAuth.emailVerified),
      lastLoginAt: persistenceAuth.lastLoginAt || null,
      failedAttempts: persistenceAuth.failedAttempts,
      lockedUntil: persistenceAuth.lockedUntil || null,
      createdAt: persistenceAuth.createdAt,
      updatedAt: persistenceAuth.updatedAt,
    });
  }

  /**
   * Maps an Authentication domain entity to an AuthenticationDTO
   * @param auth The authentication domain entity
   * @returns The authentication DTO
   */
  static toDto(auth: AuthIdentity): AuthenticationDTO {
    return auth.toDTO<AuthenticationDTO>((entity) => ({
      id: entity.get('id')?.getValue() ?? undefined,
      email: entity.get('email').getValue(),
      password: entity.get('password').getValue(),
      accountType: entity.get('accountType').getValue(),
      isActive: entity.get('isActive').getValue(),
      emailVerified: entity.get('emailVerified').getValue(),
      lastLoginAt: entity.get('lastLoginAt'),
      failedAttempts: entity.get('failedAttempts'),
      lockedUntil: entity.get('lockedUntil'),
      createdAt: entity.get('createdAt'),
      updatedAt: entity.get('updatedAt'),
    }));
  }

  /**
   * Maps an AuthenticationRegisterDTO to a domain entity
   * @param dto The authentication register DTO
   * @returns The mapped AuthIdentity domain entity
   */
  static fromRegisterDto(dto: AuthenticationRegisterDTO): AuthIdentity {
    return AuthIdentity.register(dto.data);
  }

  /**
   * Maps an AuthenticationUpdateDTO to a domain entity
   * @param dto The authentication update DTO
   * @returns The mapped AuthIdentity domain entity
   */
  static fromUpdateDto(auth: AuthIdentity, dto: string): AuthIdentity {
    return AuthIdentity.updatePassword(auth, dto);
  }

  /**
   * Maps an AuthenticationUpdateEmailDTO to a domain entity
   * @param dto The authentication update email DTO
   * @returns The mapped AuthIdentity domain entity
   */
  static fromUpdateEmailDto(auth: AuthIdentity, dto: string): AuthIdentity {
    return AuthIdentity.updateEmail(auth, dto);
  }
}
