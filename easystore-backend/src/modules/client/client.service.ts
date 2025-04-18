import { Injectable } from '@nestjs/common';
import { Postgre } from '../../infrastructure/database/postgre/postgre';
import * as bcrypt from 'bcrypt';
import { Client } from '.prisma/postgres';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: Postgre) {}

  async create(data: {
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
  }): Promise<Client> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.client.create({
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,

        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.prisma.client.findUnique({ where: { email } });
  }
}
