import { Client } from '../entities/client.entity';

export class ClientCreatedEvent {
  constructor(public readonly client: Client) {}
}
