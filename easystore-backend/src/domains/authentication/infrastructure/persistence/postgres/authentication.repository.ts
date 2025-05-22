import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  UniqueConstraintViolationError,
  DatabaseOperationError,
  ResourceNotFoundError,
} from '@domains/errors';
import { AuthenticationMapper } from '../../../application/mappers/authentication.mapper';
import { AuthIdentity } from '../../../aggregates/entities/auth/authentication.entity';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { Email } from '../../../aggregates/value-objects';

@Injectable()
export class AuthenticationRepository implements IAuthRepository {
  constructor(private readonly prisma: PostgreService) {}

  async save(authIdentity: AuthIdentity): Promise<AuthIdentity> {
    const id = authIdentity.get('id')?.getValue() ?? null;
    const fullDto = AuthenticationMapper.toDto(authIdentity);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt, updatedAt, ...dto } = fullDto;

    try {
      let persistedAuth;

      if (id) {
        persistedAuth = await this.prisma.authIdentity.update({
          where: { id },
          data: {
            ...dto,
            updatedAt: new Date(),
          },
        });
      } else {
        // 4b. CREATE: dto ya no contiene id, createdAt, updatedAt
        persistedAuth = await this.prisma.authIdentity.create({
          data: dto,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return AuthenticationMapper.fromPersistence(persistedAuth);
    } catch (error) {
      // manejo de errores idéntico al tuyo...
      if ((error as { code?: string }).code === 'P2002') {
        const prismaError = error as { meta?: { target?: string[] } };
        const field = prismaError.meta?.target?.[0] || 'unknown field';
        throw new UniqueConstraintViolationError(field);
      }
      if ((error as { code?: string }).code === 'P2025') {
        throw new ResourceNotFoundError('AuthIdentity', id?.toString());
      }
      throw new DatabaseOperationError(
        id ? 'update' : 'create',
        (error as Error).message,
        error as Error,
      );
    }
  }

  async findByEmail(email: Email): Promise<AuthIdentity | null> {
    try {
      const user = await this.prisma.authIdentity.findFirst({
        where: { email: email.getValue() },
      });

      return user ? AuthenticationMapper.fromPersistence(user) : null;
    } catch (error) {
      throw new DatabaseOperationError(
        'findByEmail',
        (error as Error).message,
        error as Error,
      );
    }
  }

  async validateCredentials(email: Email, password: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return false;

      const storedPassword = user.get('password').getValue();

      return storedPassword === password;
    } catch (error) {
      throw new DatabaseOperationError(
        'validateCredentials',
        (error as Error).message,
        error as Error,
      );
    }
  }
}
