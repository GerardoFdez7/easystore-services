import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { AccountTypeEnum } from '../../../aggregates/value-objects';
import { AuthenticationMapper } from '../../mappers';
import { ITenantAdapter } from '../../ports';
import { AuthenticationRegisterDTO } from './sign-up.dto';
import { AuthenticationDTO } from '../../mappers/auth/authentication.dto';

@CommandHandler(AuthenticationRegisterDTO)
export class AuthenticationRegisterHandler
  implements ICommandHandler<AuthenticationRegisterDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('ITenantAdapter')
    private readonly tenantAdapter: ITenantAdapter,
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

    if (requiresDomain) {
      const tenantId = await this.tenantAdapter.getTenantIdByDomain(
        data.domain,
      );
      if (!tenantId) {
        throw new NotFoundException('Tenant not found for this domain');
      }
    }

    // Execute domain logic
    const auth = this.eventPublisher.mergeObjectContext(
      AuthenticationMapper.fromRegisterDto(command),
    );

    // Persist entity
    await this.authRepository.create(auth);

    // Publish event
    auth.commit();

    // Return DTO
    return AuthenticationMapper.toDto(auth);
  }
}
