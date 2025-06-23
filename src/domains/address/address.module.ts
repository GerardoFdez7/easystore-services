import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';

//Comand Handlers
import { CreateAddressHandler } from './application/commands';

//Query Handlers

//Event Handlers
import { AddressCreatedHandler } from './application/events';
import AddressRepository from './infrastructure/address.repository';
import AddressResolver from './presentation/graphql/address.resolver';

const CommandHanldlers = [CreateAddressHandler];

const EventHandlers = [AddressCreatedHandler];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    { provide: 'IAddressRepository', useClass: AddressRepository },
    AddressRepository,
    AddressResolver,
    ...CommandHanldlers,
    ...EventHandlers,
  ],
  exports: [AddressRepository],
})
export class AddressDomain {}
