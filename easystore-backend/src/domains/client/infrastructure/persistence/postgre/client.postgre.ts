import { Injectable } from '@nestjs/common';
import { PostgreService } from '@/infrastructure/database/postgre/postgre.service';
import { Client as ClientPrisma } from '.prisma/postgres';
import { Client } from '../../../aggregates/entities/client.entity';
import { IClientRepository } from '../../../aggregates/repositories/client.repository.interface';
import {
  BusinessName,
  Email,
  Id,
  OwnerName,
  Password,
} from '../../../aggregates/value-objects/index';

@Injectable()
export class ClientPostgreRepository implements IClientRepository {
  constructor(private readonly prisma: PostgreService) {}

  // Create a new client
  async create(client: Client): Promise<Client> {
    const existingEmail = await this.prisma.client.findUnique({
      where: { email: client.getEmail().getValue() },
    });
    if (existingEmail) throw new Error('Email is already in use');

    const existingBusiness = await this.prisma.client.findUnique({
      where: { businessName: client.getBusinessName().getValue() },
    });
    if (existingBusiness) throw new Error('Business name is already in use');

    const hashedPassword = await client.getPassword().getHashedValue();

    const createdClient = await this.prisma.client.create({
      data: {
        businessName: client.getBusinessName().getValue(),
        ownerName: client.getOwnerName().getValue(),
        email: client.getEmail().getValue(),
        password: hashedPassword,
      },
    });

    return this.mapToDomain(createdClient);
  }

  // Find a client by Email
  async findByEmail(emailStr: string): Promise<Client | null> {
    const email = Email.create(emailStr);
    const client = await this.prisma.client.findUnique({
      where: { email: email.getValue() },
    });
    return client ? this.mapToDomain(client) : null;
  }

  // Find a client by Business Name
  async findByBusinessName(businessNameStr: string): Promise<Client | null> {
    const businessName = BusinessName.create(businessNameStr);
    const client = await this.prisma.client.findUnique({
      where: { businessName: businessName.getValue() },
    });
    return client ? this.mapToDomain(client) : null;
  }

  // Map from database model to domain entity
  private mapToDomain(clientPrisma: ClientPrisma): Client {
    return new Client(
      Id.create(clientPrisma.id),
      BusinessName.create(clientPrisma.businessName),
      OwnerName.create(clientPrisma.ownerName),
      Email.create(clientPrisma.email),
      Password.createHashed(clientPrisma.password),
      clientPrisma.createdAt,
      clientPrisma.updatedAt,
    );
  }
}
