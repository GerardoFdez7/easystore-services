import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CustomerCreatedEvent } from '../../aggregates/events/customer-created.event'; // replace with the correct path '@customer/aggregates/events'
import { CreateCartDto } from '../commands/create/cart/create-cart.dto';

@Injectable()
@EventsHandler(CustomerCreatedEvent)
export class CustomerCreatedHandler
  implements IEventHandler<CustomerCreatedEvent>
{
  constructor(private readonly commandBus: CommandBus) {}
  async handle(event: CustomerCreatedEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateCartDto({
        customerId: event.customer.get('id').getValue(),
      }),
    );
  }
}
