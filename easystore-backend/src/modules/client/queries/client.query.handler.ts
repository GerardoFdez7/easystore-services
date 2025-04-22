import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  FindClientByBusinessNameQuery,
  FindClientByEmailQuery,
} from './client.query';
import { ClientService } from '../client.service';

@QueryHandler(FindClientByEmailQuery)
export class FindClientByEmailHandler
  implements IQueryHandler<FindClientByEmailQuery>
{
  constructor(private readonly clientService: ClientService) {}

  async execute(query: FindClientByEmailQuery) {
    return this.clientService.findByEmail(query.email);
  }
}

@QueryHandler(FindClientByBusinessNameQuery)
export class FindClientByBusinessNameHandler
  implements IQueryHandler<FindClientByBusinessNameQuery>
{
  constructor(private readonly clientService: ClientService) {}

  async execute(query: FindClientByBusinessNameQuery) {
    return this.clientService.findByBusiness(query.businessName);
  }
}
