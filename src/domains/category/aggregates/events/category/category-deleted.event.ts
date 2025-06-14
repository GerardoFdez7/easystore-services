import { IEvent } from '@nestjs/cqrs';
import { Category } from '../../entities';

export class CategoryDeletedEvent implements IEvent {
  constructor(public readonly category: Category) {}
}
