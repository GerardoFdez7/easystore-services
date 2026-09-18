import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PostgreService } from '@database/postgres.service';
import { Currency, Prisma } from '.prisma/postgres';
import { Id } from '@shared/aggregates/value-objects';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { AuthenticationMapper } from '../../application/mappers';
import { AuthIdentity } from '../../aggregates/entities';
import { ITenantOnboarding } from '../../application/ports';

/** Atomically provisions the tenant account and its required initial commerce scope. */
@Injectable()
export class TenantOnboardingService implements ITenantOnboarding {
  constructor(private readonly prisma: PostgreService) {}

  async provision(auth: AuthIdentity, initialDomain?: string): Promise<void> {
    const authDto = AuthenticationMapper.toDto(auth);
    const name = authDto.email.split('@')[0];
    const tenantId = Id.generate().getValue();
    const storeId = Id.generate().getValue();
    const password = await bcrypt.hash(authDto.password, 10);

    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.authIdentity.create({ data: { ...authDto, password } });
        await tx.tenant.create({
          data: { id: tenantId, name, authIdentityId: authDto.id },
        });
        await tx.store.create({
          data: {
            id: storeId,
            tenantId,
            name,
            domain: initialDomain,
            currency: Currency.USD,
          },
        });
        await tx.tenant.update({
          where: { id: tenantId },
          data: { defaultStoreId: storeId },
        });
      });
    } catch (error) {
      return handlePrismaDatabaseError(error, 'provision tenant account', {
        resource: 'Tenant onboarding',
        foreignKeyEntities: {
          authIdentityId: 'Auth Identity',
          tenantId: 'Tenant',
        },
      });
    }
  }
}
