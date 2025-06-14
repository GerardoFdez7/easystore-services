import { IEvent } from '@nestjs/cqrs';
import { Category } from '../../entities';

export class CategoryUpdatedEvent implements IEvent {
  constructor(public readonly category: Category) {}
}
