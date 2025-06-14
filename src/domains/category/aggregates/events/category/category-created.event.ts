import { IEvent } from '@nestjs/cqrs';
import { Category } from '../../entities';

export class CategoryCreatedEvent implements IEvent {
  constructor(public readonly category: Category) {}
}
