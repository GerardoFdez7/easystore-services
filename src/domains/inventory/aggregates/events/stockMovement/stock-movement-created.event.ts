import { IEvent } from '@nestjs/cqrs';
import { StockMovement } from '../../entities';

export class StockMovementCreatedEvent implements IEvent {
  constructor(public readonly stockMovement: StockMovement) {}
}
