import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.repository.interface';
import { TenantLoginDTO } from './login.dto';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';

@QueryHandler(TenantLoginDTO)
export class LoginTenantHandler implements IQueryHandler<TenantLoginDTO> {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(command: TenantLoginDTO): Promise<boolean> {
    const { identifier, password } = command;

    let tenant = await this.tenantRepository.findByEmail(identifier);
    if (!tenant) {
      tenant = await this.tenantRepository.findByBusinessName(identifier);
    }

    if (!tenant) throw new Error('Tenant not found');

    const isPasswordValid = await bcrypt.compare(
      password,
      tenant.get('password').getValue(),
    );
    if (!isPasswordValid) throw new Error('Invalid credentials');

    return true;
  }
}
