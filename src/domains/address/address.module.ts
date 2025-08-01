import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';

//Comand Handlers
import {
  CreateAddressHandler,
  UpdateAddressHandler,
  DeleteAddressHandler,
} from './application/commands';

//Query Handlers
import {
  GetAddressByIdHandler,
  GetAllAddressesHandler,
} from './application/queries';

//Event Handlers
import {
  AddressCreatedHandler,
  AddressDeletedHandler,
  AddressUpdatedHandler,
} from './application/events';
import AddressRepository from './infrastructure/address.repository';
import AddressResolver from './presentation/graphql/address.resolver';

const CommandHanldlers = [
  CreateAddressHandler,
  DeleteAddressHandler,
  UpdateAddressHandler,
];
const QueryHandlers = [GetAddressByIdHandler, GetAllAddressesHandler];
const EventHandlers = [
  AddressCreatedHandler,
  AddressDeletedHandler,
  AddressUpdatedHandler,
];

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
