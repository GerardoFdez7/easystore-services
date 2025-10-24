import { Module } from '@nestjs/common';
import { CustomerResolver } from './presentation/graphql/customer.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCustomerHandler } from './application/commands/create/create-customer.handler';
import { CustomerRepository } from './infrastructure/database/postgres/customer.repository';
import { IdentityCreatedHandler } from './application/events/customer/identity-created.handler';
import { CustomerCreatedHandler } from './application/events/customer/customer-created.handler';
import { TenantDomain } from '../tenant/tenant.module';
import { FindCustomerByIdHandler } from './application/queries';
import { UpdateCustomerHandler } from './application/commands/update/update-customer.handler';
import { CustomerUpdatedHandler } from './application/events/customer/customer-updated.handler';

const CommandHandlers = [CreateCustomerHandler, UpdateCustomerHandler];

const EventHandlers = [
  IdentityCreatedHandler,
  CustomerCreatedHandler,
  CustomerUpdatedHandler,
];

const QueryHandlers = [FindCustomerByIdHandler];

@Module({
  imports: [CqrsModule, TenantDomain],
  providers: [
    CustomerResolver,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class CustomerDomain {}
