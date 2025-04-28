import { Client } from '../entities/client.entity';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findByEmail(email: string): Promise<Client | null>;
  findByBusinessName(businessName: string): Promise<Client | null>;
}
