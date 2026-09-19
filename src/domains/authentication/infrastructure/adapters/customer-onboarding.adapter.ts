import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TransactionManager } from '@shared/infrastructure/postgres';
import { CreateCartDto } from '../../../cart/application/commands';
import { CreateCustomerDto } from '../../../customer/application/commands';
import { CustomerDTO } from '../../../customer/application/mappers';
import { AuthIdentity } from '../../aggregates/entities';
import { IAuthRepository } from '../../aggregates/repositories/authentication.interface';
import { ICustomerOnboarding } from '../../application/ports';

function isCustomerDTO(value: unknown): value is CustomerDTO {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

/** Adapts customer account provisioning to Authentication's application port. */
@Injectable()
export class CustomerOnboardingAdapter implements ICustomerOnboarding {
  constructor(
    @Inject('AuthRepository') private readonly authRepository: IAuthRepository,
    private readonly commands: CommandBus,
    private readonly transactions: TransactionManager,
  ) {}

  async provision(auth: AuthIdentity, storeId: string): Promise<void> {
    const name = auth.getProps().email.getValue().split('@')[0];
    await this.transactions.execute(async () => {
      await this.authRepository.create(auth);
      const customerResult: unknown = await this.commands.execute(
        new CreateCustomerDto({
          name,
          authIdentityId: auth.getProps().id.getValue(),
          storeId,
        }),
      );
      if (!isCustomerDTO(customerResult)) {
        throw new Error('Customer provisioning returned an invalid result');
      }
      const customer = customerResult;
      await this.commands.execute(
        new CreateCartDto({ customerId: customer.id, storeId }),
      );
    });
  }
}
