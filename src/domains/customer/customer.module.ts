import { Module } from '@nestjs/common';
import { CustomerResolver } from './presentation/graphql/customer.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCustomerHandler } from './application/commands/create/create-customer.handler';
import { CustomerRepository } from '@authentication/infrastructure/persistence/postgres';
import { CustomerCreatedHandler } from '../cart/application/events';

const CommandHandlers = [CreateCustomerHandler];

const EventHandlers = [CustomerCreatedHandler];

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
