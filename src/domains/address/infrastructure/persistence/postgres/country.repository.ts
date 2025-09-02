import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { Country } from '.prisma/postgres';

@Injectable()
export default class CountryRepository {
  constructor(private readonly prisma: PostgreService) {}

  async findAll(): Promise<Country[]> {
    return this.prisma.country.findMany();
  }
}
