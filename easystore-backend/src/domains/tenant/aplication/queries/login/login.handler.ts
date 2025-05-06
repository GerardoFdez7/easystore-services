import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { TenantLoginDTO } from './login.dto';
import { Email } from '../../../aggregates/value-objects';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import {
  ExceptionHandler,
  DomainErrorCode,
} from '../../../../../shared/domains/auth/exception-handler';

@QueryHandler(TenantLoginDTO)
export class LoginTenantHandler implements IQueryHandler<TenantLoginDTO> {
  private readonly exceptionHandler: ExceptionHandler;

  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
    private readonly logger: LoggerService,
  ) {
    this.exceptionHandler = new ExceptionHandler(this.logger);
  }

  async execute(command: TenantLoginDTO): Promise<boolean> {
    const { identifier, password } = command;

    const tenant = await this.tenantRepository.findByEmail(
      Email.create(identifier),
    );
    if (!tenant) {
      this.exceptionHandler.handle(
        'AuthenticationError',
        'Tenant with provided email was not found.',
        DomainErrorCode.TENANT_NOT_FOUND,
        { 'X-Error-Type': 'TenantAuth' },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      tenant.get('password').getValue(),
    );

    if (!isPasswordValid) {
      this.exceptionHandler.handle(
        'AuthenticationError',
        'Invalid credentials provided.',
        DomainErrorCode.INVALID_CREDENTIALS,
        { 'X-Error-Type': 'TenantAuth' },
      );
    }

    return true;
  }
}
