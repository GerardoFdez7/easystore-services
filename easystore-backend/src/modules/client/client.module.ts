import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientResolver } from './client.resolver';
import { RegisterClientHandler } from './commands/handlers/register-client.handler';
import { ClientRepository } from './client.repository';
import { PrismaService } from '../../infrastructure/database/postgre/postgre';

const CommandHandlers = [RegisterClientHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ClientResolver,
    ClientRepository,
    PrismaService,
    ...CommandHandlers,
  ],
})
export class ClientModule {}
