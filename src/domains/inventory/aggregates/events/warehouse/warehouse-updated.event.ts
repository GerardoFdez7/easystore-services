import { IEvent } from '@nestjs/cqrs';
import { Warehouse } from '../../entities';

export class WarehouseUpdatedEvent implements IEvent {
  constructor(public readonly warehouse: Warehouse) {}
} 