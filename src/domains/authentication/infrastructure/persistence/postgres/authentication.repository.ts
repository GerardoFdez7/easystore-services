import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PostgreService } from '@database/postgres.service';
import { Prisma, AuthIdentity as PrismaAuthIdentity } from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  DatabaseOperationError,
} from '@shared/errors';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import { AuthenticationMapper } from '../../../application/mappers';
import { AuthIdentity, IAuthIdentityType } from '../../../aggregates/entities';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { Id, Email, AccountType } from '../../../aggregates/value-objects';

@Injectable()
export class AuthenticationRepository implements IAuthRepository {
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Creates a new authIdentity with transaction support
   */
  async create(authIdentity: AuthIdentity): Promise<AuthIdentity> {
    const authDto = AuthenticationMapper.toDto(authIdentity);

    try {
      const prismaAuth = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.authIdentity.findFirst({
          where: {
            email: authDto.email,
            accountType: authDto.accountType,
          },
        });

        if (existing) {
          throw new UniqueConstraintViolationError(
            `email already exists for accountType '${authDto.accountType}'`,
          );
        }

        const saltRounds = 10;
        authDto.password = await bcrypt.hash(authDto.password, saltRounds);

        return await tx.authIdentity.create({
          data: authDto,
        });
      });

      return this.mapToDomain(prismaAuth);
    } catch (error) {
      return this.handleDatabaseError(error, 'create auth identity');
    }
  }

  /**
   * Updates an existing authIdentity with transaction support
   */
  async update(id: Id, updates: AuthIdentity): Promise<AuthIdentity> {
    const idValue = id.getValue();
    const updatesDto = AuthenticationMapper.toDto(updates);

    try {
      const prismaAuth = await this.prisma.$transaction(async (tx) => {
        const existingAuth = await tx.authIdentity.findUnique({
          where: { id: idValue },
        });

        if (!existingAuth) {
          throw new ResourceNotFoundError('AuthIdentity', idValue);
        }

        if (
          updatesDto.password &&
          updatesDto.password !== existingAuth.password
        ) {
          const saltRounds = 10;
          updatesDto.password = await bcrypt.hash(
            updatesDto.password,
            saltRounds,
          );
        }

        return await tx.authIdentity.update({
          where: { id: idValue },
          data: {
            ...updatesDto,
            updatedAt: new Date(),
          },
        });
      });

      return this.mapToDomain(prismaAuth);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update auth identity');
    }
  }

  /**
   * Finds an authIdentity by email and accountType.
   */
  async findByEmailAndAccountType(
    email: Email,
    accountType: AccountType,
  ): Promise<AuthIdentity | null> {
    try {
      const user = await this.prisma.authIdentity.findFirst({
        where: {
          email: email.getValue(),
          accountType: accountType.getValue(),
        },
      });

      return user ? this.mapToDomain(user) : null;
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'find auth identity by email and account type',
      );
    }
  }

  /**
   * Finds an authIdentity by ID.
   */
  async findById(id: Id): Promise<AuthIdentity | null> {
    try {
      const user = await this.prisma.authIdentity.findUnique({
        where: {
          id: id.getValue(),
        },
      });

      return user ? this.mapToDomain(user) : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'find auth identity by id');
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          throw new UniqueConstraintViolationError(
            field,
            `AuthIdentity ${field} already exists`,
          );
        }
        case 'P2025':
          throw new ResourceNotFoundError('AuthIdentity');
        default:
          break;
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }

  /**
   * Maps Prisma AuthIdentity to domain entity
   */
  private mapToDomain(prismaAuth: PrismaAuthIdentity): AuthIdentity {
    return AuthenticationMapper.fromPersistence(
      prismaAuth as IAuthIdentityType,
    );
  }
}
