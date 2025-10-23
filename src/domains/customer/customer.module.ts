import { Module } from '@nestjs/common';
import { CustomerResolver } from './presentation/graphql/customer.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCustomerHandler } from './application/commands/create/create-customer.handler';
import { CustomerRepository } from './infrastructure/database/postgres/customer.repository';
import { IdentityCreatedHandler } from './application/events/customer/identity-created.handler';

const CommandHandlers = [CreateCustomerHandler];

const EventHandlers = [IdentityCreatedHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    CustomerResolver,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class CustomerDomain {}
