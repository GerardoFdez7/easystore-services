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
    const existingEmail = await this.prisma.client.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) throw new Error('Email is already in use');

    const existingBusiness = await this.prisma.client.findUnique({
      where: { businessName: data.businessName },
    });
    if (existingBusiness) throw new Error('Business name is already in use');

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

  async findByBusiness(business: string): Promise<Client | null> {
    return await this.prisma.client.findUnique({
      where: { businessName: business },
    });
  }
}
