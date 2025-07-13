import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  UniqueConstraintViolationError,
  DatabaseOperationError,
} from '@domains/errors';
import { AuthenticationMapper } from '../../../application/mappers';
import { AuthIdentity, IAuthIdentityType } from '../../../aggregates/entities';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { Email, AccountType } from '../../../aggregates/value-objects';
import { AuthIdentity as PrismaAuthIdentity } from '.prisma/postgres';
import * as bcrypt from 'bcrypt';
import {
  generateToken,
  generateRefreshToken,
  JwtPayload,
} from '../../jwt/jwt-handler';

@Injectable()
export class AuthenticationRepository implements IAuthRepository {
  constructor(private readonly prisma: PostgreService) {}

  async save(authIdentity: AuthIdentity): Promise<AuthIdentity> {
    const id = authIdentity.get('id').getValue();
    const fullDto = AuthenticationMapper.toDto(authIdentity);
    const { ...dto } = fullDto;

    try {
      let persistedAuth: PrismaAuthIdentity;
      const saltRounds = 10;

      // Check if auth identity exists in database
      const existingAuth = await this.prisma.authIdentity.findUnique({
        where: { id },
      });

      if (existingAuth) {
        // Update existing auth identity
        if (dto.password) {
          dto.password = await bcrypt.hash(dto.password, saltRounds);
        }

        persistedAuth = await this.prisma.authIdentity.update({
          where: { id },
          data: {
            ...dto,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new auth identity
        const existing = await this.findByEmailAndAccountType(
          Email.create(dto.email),
          AccountType.create(dto.accountType),
        );

        if (existing) {
          throw new UniqueConstraintViolationError(
            `email already exists for accountType '${dto.accountType}'`,
          );
        }

        dto.password = await bcrypt.hash(dto.password, saltRounds);

        persistedAuth = await this.prisma.authIdentity.create({
          data: dto,
        });
      }

      return AuthenticationMapper.fromPersistence(
        persistedAuth as IAuthIdentityType,
      );
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        const prismaError = error as { meta?: { target?: string[] } };
        const field = prismaError.meta?.target?.[0] || 'unknown field';
        throw new UniqueConstraintViolationError(field);
      }

      // Determine operation type based on whether auth identity existed
      let operation = 'save auth identity';
      try {
        const existingAuth = await this.prisma.authIdentity.findUnique({
          where: { id },
        });
        operation = existingAuth
          ? 'update auth identity'
          : 'create auth identity';
      } catch {
        operation = 'create auth identity';
      }

      throw new DatabaseOperationError(
        operation,
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
          accountType: accountType.getValue(),
        },
      });

      if (!user) {
        return null;
      }

      return AuthenticationMapper.fromPersistence(user as IAuthIdentityType);
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

      return AuthenticationMapper.fromPersistence(user as IAuthIdentityType);
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

      return await bcrypt.compare(password, storedPassword);
    } catch (error) {
      throw new DatabaseOperationError(
        'validateCredentials',
        (error as Error).message,
        error as Error,
      );
    }
  }

  async login(
    email: Email,
    password: string,
    accountType: AccountType,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.findByEmailAndAccountType(email, accountType);
    if (!user) {
      throw new Error('User not found or incorrect account type');
    }

    const isValidPassword = await this.validateCredentials(email, password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: email.getValue(),
      id: user.get('id').getValue(),
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
}
