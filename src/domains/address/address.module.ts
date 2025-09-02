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
  GetAllCountriesHandler,
  GetStatesByCountryIdHandler,
} from './application/queries';

//Event Handlers
import {
  AddressCreatedHandler,
  AddressDeletedHandler,
  AddressUpdatedHandler,
} from './application/events';
import AddressRepository from './infrastructure/persistence/postgres/address.repository';
import CountryRepository from './infrastructure/persistence/postgres/country.repository';
import StateRepository from './infrastructure/persistence/postgres/state.repository';
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
  GetAllCountriesHandler,
  GetStatesByCountryIdHandler,
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
    CountryRepository,
    StateRepository,
    AddressResolver,
    ...CommandHanldlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [GetAddressesDetailsHandler],
})
export class AddressDomain {}
