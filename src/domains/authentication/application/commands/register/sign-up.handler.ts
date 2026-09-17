import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { AccountTypeEnum } from '../../../aggregates/value-objects';
import { AuthenticationMapper } from '../../mappers';
import { IStoreAdapter } from '../../ports';
import { AuthenticationRegisterDTO } from './sign-up.dto';
import { AuthenticationDTO } from '../../mappers/auth/authentication.dto';
import {
  CustomerOnboardingService,
  TenantOnboardingService,
} from '../../../infrastructure/onboarding';

@CommandHandler(AuthenticationRegisterDTO)
export class AuthenticationRegisterHandler
  implements ICommandHandler<AuthenticationRegisterDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('IStoreAdapter')
    private readonly storeAdapter: IStoreAdapter,
    private readonly tenantOnboardingService: TenantOnboardingService,
    private readonly customerOnboardingService: CustomerOnboardingService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: AuthenticationRegisterDTO,
  ): Promise<AuthenticationDTO> {
    const { data } = command;

    // Domain is required for CUSTOMER/EMPLOYEE sign-up so the tenant can be resolved.
    const requiresDomain =
      data.accountType === AccountTypeEnum.CUSTOMER ||
      data.accountType === AccountTypeEnum.EMPLOYEE;

    if (requiresDomain && !data.domain) {
      throw new BadRequestException(
        'Domain is required for customer and employee sign-up',
      );
    }

    let trustedStoreId: string | undefined;
    if (requiresDomain) {
      const store = await this.storeAdapter.getStoreByDomain(data.domain);
      if (!store) {
        throw new NotFoundException('Store not found for this domain');
      }
      trustedStoreId = store.id;
    }

    // Execute domain logic
    const auth = this.eventPublisher.mergeObjectContext(
      AuthenticationMapper.fromRegisterDto(command),
    );

    if (data.accountType === AccountTypeEnum.TENANT) {
      await this.tenantOnboardingService.provision(auth, data.domain);
    } else if (data.accountType === AccountTypeEnum.CUSTOMER) {
      if (!trustedStoreId) {
        throw new NotFoundException('Store not found for this domain');
      }
      await this.customerOnboardingService.provision(auth, trustedStoreId);
    } else {
      await this.authRepository.create(auth);
    }

    // Publish event
    auth.commit();

    // Return DTO
    return AuthenticationMapper.toDto(auth);
  }
}
