import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClientByEmailDTO } from './email.dto';
import { ClientPostgreRepository } from '../../../infrastructure/persistence/postgre/client.postgre';
import { ClientDto } from '../client.dto';

@QueryHandler(FindClientByEmailDTO)
export class FindClientByEmailHandler
  implements IQueryHandler<FindClientByEmailDTO>
{
  constructor(private readonly clientRepository: ClientPostgreRepository) {}

  async execute(query: FindClientByEmailDTO): Promise<ClientDto | null> {
    const client = await this.clientRepository.findByEmail(query.email);

    if (!client) {
      return null;
    }

    // Map domain entity to DTO for the query response
    return {
      id: client.getId().getValue(),
      email: client.getEmail().getValue(),
      businessName: client.getBusinessName().getValue(),
      ownerName: client.getOwnerName().getValue(),
    };
  }
}
