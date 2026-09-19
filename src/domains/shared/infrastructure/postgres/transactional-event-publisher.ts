import { Injectable } from '@nestjs/common';
import { AggregateRoot, EventBus, EventPublisher, IEvent } from '@nestjs/cqrs';
import { TransactionManager } from './transaction-manager';

/** Publishes aggregate events only after the current database transaction commits. */
@Injectable()
export class TransactionalEventPublisher extends EventPublisher {
  constructor(
    private readonly events: EventBus,
    private readonly transactions: TransactionManager,
  ) {
    super(events);
  }

  mergeObjectContext<T extends AggregateRoot>(object: T): T {
    object.publish = (event: IEvent) => {
      this.transactions.afterCommit(() => {
        this.events.publish(event, object);
      });
    };
    object.publishAll = (events: IEvent[]) => {
      this.transactions.afterCommit(() => {
        this.events.publishAll(events, object);
      });
    };
    return object;
  }
}
