import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PostgreService } from '@database/postgres.service';
import { Prisma } from '.prisma/postgres';
import { Id } from '@shared/aggregates/value-objects';
import { UniqueConstraintViolationError } from '@shared/infrastructure/postgres/errors';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { AuthenticationMapper } from '../../application/mappers';
import { AuthIdentity } from '../../aggregates/entities';

/** Atomically provisions a customer identity, customer profile, and cart in a trusted Store. */
@Injectable()
export class CustomerOnboardingService {
  constructor(private readonly prisma: PostgreService) {}

  async provision(auth: AuthIdentity, storeId: string): Promise<void> {
    const authDto = AuthenticationMapper.toDto(auth);
    const customerId = Id.generate().getValue();
    const cartId = Id.generate().getValue();
    const name = authDto.email.split('@')[0];
    const password = await bcrypt.hash(authDto.password, 10);

    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.authIdentity.findFirst({
          where: { email: authDto.email, accountType: authDto.accountType },
        });

        if (existing) {
          throw new UniqueConstraintViolationError(
            `email already exists for accountType '${authDto.accountType}'`,
          );
        }

        await tx.authIdentity.create({ data: { ...authDto, password } });
        await tx.customer.create({
          data: {
            id: customerId,
            name,
            authIdentityId: authDto.id,
            storeId,
          },
        });
        await tx.cart.create({
          data: { id: cartId, customerId, storeId },
        });
      });
    } catch (error) {
      return handlePrismaDatabaseError(error, 'provision customer account', {
        resource: 'Customer onboarding',
        foreignKeyEntities: {
          authIdentityId: 'Auth Identity',
          customerId: 'Customer',
          storeId: 'Store',
        },
      });
    }
  }
}
