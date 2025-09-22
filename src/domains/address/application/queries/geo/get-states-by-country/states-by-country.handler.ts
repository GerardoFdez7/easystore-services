import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import StateRepository from '../../../../infrastructure/persistence/postgres/state.repository';
import { GetStatesByCountryIdDTO } from './states-by-country.dto';
import { State } from '.prisma/postgres';

@QueryHandler(GetStatesByCountryIdDTO)
export class GetStatesByCountryIdHandler
  implements IQueryHandler<GetStatesByCountryIdDTO, State[]>
{
  constructor(private readonly repository: StateRepository) {}

  async execute(query: GetStatesByCountryIdDTO): Promise<State[]> {
    return this.repository.findByCountryId(query.countryId);
  }
}
