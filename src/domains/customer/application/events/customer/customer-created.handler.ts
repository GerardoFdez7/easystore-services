import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerCreatedEvent } from '../../../aggregates/events';
import { ICartAdapter } from '../../ports';

@Injectable()
@EventsHandler(CustomerCreatedEvent)
export class CustomerCreatedHandler
  implements IEventHandler<CustomerCreatedEvent>
{
  constructor(
    @Inject('ICartAdapter') private readonly cartAdapter: ICartAdapter,
  ) {}

  async handle(event: CustomerCreatedEvent): Promise<void> {
    await this.cartAdapter.createCart(
      event.customer.getProps().id.getValue(),
      event.customer.getProps().tenantId.getValue(),
    );
  }
}
