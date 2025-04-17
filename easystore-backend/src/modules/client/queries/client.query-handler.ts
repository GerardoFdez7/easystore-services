import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClientByEmailQuery } from './dto/find-client-by-email.query';
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
