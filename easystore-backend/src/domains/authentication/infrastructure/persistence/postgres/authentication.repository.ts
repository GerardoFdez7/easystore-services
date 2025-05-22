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
import { AccountType } from '.prisma/postgres';
import * as bcrypt from 'bcrypt';

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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const SALT_ROUNDS = 10;

      if (id) {
        // Si se proporciona nueva contraseña, encriptarla
        if (dto.password) {
          dto.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
        }

        persistedAuth = await this.prisma.authIdentity.update({
          where: { id },
          data: {
            ...dto,
            updatedAt: new Date(),
          },
        });
      } else {
        // Validar si ya existe un usuario con ese email y accountType
        const existing = await this.findByEmailAndAccountType(
          Email.create(dto.email),
          dto.accountType,
        );

        if (existing) {
          throw new UniqueConstraintViolationError(
            `email already exists for accountType '${dto.accountType}'`,
          );
        }

        // 🔐 Encriptar contraseña antes de guardar
        dto.password = await bcrypt.hash(dto.password, SALT_ROUNDS);

        persistedAuth = await this.prisma.authIdentity.create({
          data: dto,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return AuthenticationMapper.fromPersistence(persistedAuth);
    } catch (error) {
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

  async findByEmailAndAccountType(
    email: Email,
    accountType: AccountType,
  ): Promise<AuthIdentity | null> {
    try {
      const user = await this.prisma.authIdentity.findFirst({
        where: {
          email: email.getValue(),
          accountType,
        },
      });

      return user ? AuthenticationMapper.fromPersistence(user) : null;
    } catch (error) {
      throw new DatabaseOperationError(
        'findByEmailAndAccountType',
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

      // 🔐 Validar contraseña encriptada
      return await bcrypt.compare(password, storedPassword);
    } catch (error) {
      throw new DatabaseOperationError(
        'validateCredentials',
        (error as Error).message,
        error as Error,
      );
    }
  }
}
