import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/postgre/postgre';
import { Prisma, Client as PrismaClient } from '@prisma/client';

@Injectable()
export class ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClientCreateInput): Promise<PrismaClient> {
    return this.prisma.client.create({ data });
  }

  async findByEmail(email: string): Promise<PrismaClient | null> {
    return this.prisma.client.findUnique({ where: { email } });
  }
}
