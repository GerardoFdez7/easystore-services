import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

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
  GetAddressesDetailsHandler,
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
const QueryHandlers = [
  GetAddressByIdHandler,
  GetAllAddressesHandler,
  GetAddressesDetailsHandler,
];
const EventHandlers = [
  AddressCreatedHandler,
  AddressDeletedHandler,
  AddressUpdatedHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IAddressRepository', useClass: AddressRepository },
    AddressResolver,
    ...CommandHanldlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [GetAddressesDetailsHandler],
})
export class AddressDomain {}
