import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { State } from '.prisma/postgres';

@Injectable()
export default class StateRepository {
  constructor(private readonly prisma: PostgreService) {}

  async findByCountryId(countryId: string): Promise<State[]> {
    return this.prisma.state.findMany({
      where: { countryId },
    });
  }
}
