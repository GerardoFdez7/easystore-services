import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import CountryRepository from '../../../../infrastructure/persistence/postgres/country.repository';
import { GetAllCountriesDTO } from './all-countries.dto';
import { Country } from '.prisma/postgres';

@QueryHandler(GetAllCountriesDTO)
export class GetAllCountriesHandler
  implements IQueryHandler<GetAllCountriesDTO, Country[]>
{
  constructor(private readonly repository: CountryRepository) {}

  async execute(_query: GetAllCountriesDTO): Promise<Country[]> {
    return this.repository.findAll();
  }
}
