import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TransactionManager } from '@shared/infrastructure/postgres';
import { CreateStoreDTO } from '../../../store/application/commands';
import { StoreDTO } from '../../../store/application/mappers';
import {
  SetDefaultStoreDTO,
  TenantSingUpDTO,
} from '../../../tenant/application/commands';
import { TenantDTO } from '../../../tenant/application/mappers';
import { AuthIdentity } from '../../aggregates/entities';
import { IAuthRepository } from '../../aggregates/repositories/authentication.interface';
import { ITenantOnboarding } from '../../application/ports';

function isTenantDTO(value: unknown): value is TenantDTO {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

function isStoreDTO(value: unknown): value is StoreDTO {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

/** Adapts tenant account provisioning to Authentication's application port. */
@Injectable()
export class TenantOnboardingAdapter implements ITenantOnboarding {
  constructor(
    @Inject('AuthRepository') private readonly authRepository: IAuthRepository,
    private readonly commands: CommandBus,
    private readonly transactions: TransactionManager,
  ) {}

  async provision(auth: AuthIdentity, initialDomain?: string): Promise<void> {
    const name = auth.getProps().email.getValue().split('@')[0];
    await this.transactions.execute(async () => {
      await this.authRepository.create(auth);
      const tenantResult: unknown = await this.commands.execute(
        new TenantSingUpDTO({
          name,
          authIdentityId: auth.getProps().id.getValue(),
        }),
      );
      if (!isTenantDTO(tenantResult)) {
        throw new Error('Tenant provisioning returned an invalid result');
      }
      const tenant = tenantResult;
      const storeResult: unknown = await this.commands.execute(
        new CreateStoreDTO({
          tenantId: tenant.id,
          name,
          domain: initialDomain,
        }),
      );
      if (!isStoreDTO(storeResult)) {
        throw new Error('Store provisioning returned an invalid result');
      }
      const store = storeResult;
      await this.commands.execute(new SetDefaultStoreDTO(tenant.id, store.id));
    });
  }
}
