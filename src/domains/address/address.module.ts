import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';

//Comand Handlers
import { CreateAddressHandler } from './application/commands';
import { DeleteAddressHandler } from './application/commands';

//Query Handlers
import { GetAddressByIdHandler } from './application/queries';

//Event Handlers
import {
  AddressCreatedHandler,
  AddressDeletedHandler,
} from './application/events';
import AddressRepository from './infrastructure/address.repository';
import AddressResolver from './presentation/graphql/address.resolver';

const CommandHanldlers = [CreateAddressHandler, DeleteAddressHandler];
const QueryHandlers = [GetAddressByIdHandler];
const EventHandlers = [AddressCreatedHandler, AddressDeletedHandler];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    { provide: 'IAddressRepository', useClass: AddressRepository },
    AddressRepository,
    AddressResolver,
    ...CommandHanldlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [AddressRepository],
})
export class AddressDomain {}
