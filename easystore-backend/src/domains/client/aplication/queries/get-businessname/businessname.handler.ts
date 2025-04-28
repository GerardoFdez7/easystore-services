import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClientByBusinessNameDTO } from './businessname.dto';
import { ClientPostgreRepository } from '../../../infrastructure/persistence/postgre/client.postgre';
import { ClientDto } from '../client.dto';

@QueryHandler(FindClientByBusinessNameDTO)
export class FindClientByBusinessNameHandler
  implements IQueryHandler<FindClientByBusinessNameDTO>
{
  constructor(private readonly clientRepository: ClientPostgreRepository) {}

  async execute(query: FindClientByBusinessNameDTO): Promise<ClientDto | null> {
    const client = await this.clientRepository.findByBusinessName(
      query.businessName,
    );

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
