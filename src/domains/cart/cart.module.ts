import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartCreateHandler } from './application/commands/create/create-cart.handler';
import { CartResolver } from './presentation/graphql/cart.resolver';
import { CartRepository } from './infrastructure/persistence/postgres/cart.repository';

const CommandHandlers = [CartCreateHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'ICartRepository', useClass: CartRepository },
    CartResolver,
    ...CommandHandlers,
  ],
})
export class CartDomain {}
