import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientService } from '../client.service';
import { Client } from '.prisma/postgres';
import { LoginClientCommand, RegisterClientCommand } from './client.command';
import * as bcrypt from 'bcrypt';

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

@CommandHandler(LoginClientCommand)
export class LoginClientHandler implements ICommandHandler<LoginClientCommand> {
  constructor(private readonly clientService: ClientService) {}

  async execute(command: LoginClientCommand): Promise<boolean> {
    const { identifier, password } = command;

    let client = await this.clientService.findByEmail(identifier);
    if (!client) {
      client = await this.clientService.findByBusiness(identifier);
    }

    if (!client) throw new Error('Client not found');

    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    return true;
  }
}
