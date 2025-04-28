import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ClientPostgreRepository } from '../../../infrastructure/persistence/postgre/client.postgre';
import { Client } from '../../../aggregates/entities/client.entity';
import { RegisterClientDTO } from './register.dto';

@CommandHandler(RegisterClientDTO)
export class RegisterClientHandler
  implements ICommandHandler<RegisterClientDTO>
{
  constructor(
    private readonly clientRepository: ClientPostgreRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterClientDTO): Promise<void> {
    const { businessName, ownerName, email, password } = command;

    // Create domain entity using factory method
    const client = this.eventPublisher.mergeObjectContext(
      Client.create(businessName, ownerName, email, password),
    );

    // Persist through repository
    await this.clientRepository.create(client);

    // Commit events to event bus
    client.commit();
  }
}
