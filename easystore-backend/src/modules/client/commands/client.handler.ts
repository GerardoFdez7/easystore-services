import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterClientCommand } from './dto/register-client.command';
import { ClientService } from '../client.service';
import { Client } from '.prisma/postgres';

@CommandHandler(RegisterClientCommand)
export class RegisterClientHandler
  implements ICommandHandler<RegisterClientCommand>
{
  constructor(private readonly clientService: ClientService) {}

  async execute(command: RegisterClientCommand): Promise<Client> {
    const { businessName, ownerName, email, password } = command;
    return this.clientService.create({
      businessName,
      ownerName,
      email,
      password,
    });
  }
}
