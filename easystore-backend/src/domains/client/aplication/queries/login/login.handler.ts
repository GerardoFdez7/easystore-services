import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ClientPostgreRepository } from '../../../infrastructure/persistence/postgre/client.postgre';
import { LoginClientDTO } from './login.dto';
import * as bcrypt from 'bcrypt';

@QueryHandler(LoginClientDTO)
export class LoginClientHandler implements IQueryHandler<LoginClientDTO> {
  constructor(private readonly clientRepository: ClientPostgreRepository) {}

  async execute(command: LoginClientDTO): Promise<boolean> {
    const { identifier, password } = command;

    let client = await this.clientRepository.findByEmail(identifier);
    if (!client) {
      client = await this.clientRepository.findByBusinessName(identifier);
    }

    if (!client) throw new Error('Client not found');

    const isPasswordValid = await bcrypt.compare(
      password,
      client.getPassword().getValue(),
    );
    if (!isPasswordValid) throw new Error('Invalid credentials');

    return true;
  }
}
