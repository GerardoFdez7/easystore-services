import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RegisterClientCommand } from '../impl/register-client.command';
import { ClientRepository } from '../../client.repository';
import { ClientType } from '../../types/client.type';
import * as bcrypt from 'bcrypt';

@CommandHandler(RegisterClientCommand)
export class RegisterClientHandler
  implements ICommandHandler<RegisterClientCommand>
{
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterClientCommand): Promise<ClientType> {
    const { businessName, ownerName, email, password } = command.input;

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await this.clientRepo.create({
      businessName,
      ownerName,
      email,
      password: hashedPassword,
    });

    return client;
  }
}
