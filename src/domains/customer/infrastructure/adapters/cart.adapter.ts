import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCartDto } from '../../../cart/application/commands';
import { ICartAdapter } from '../../application/ports';

@Injectable()
export class CartAdapter implements ICartAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  async createCart(customerId: string, tenantId: string): Promise<void> {
    await this.commandBus.execute(new CreateCartDto({ customerId, tenantId }));
  }
}
