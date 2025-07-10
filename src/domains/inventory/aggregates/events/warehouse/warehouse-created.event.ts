import { IEvent } from '@nestjs/cqrs';
import { Warehouse } from '../../entities';

export class WarehouseCreatedEvent implements IEvent {
  constructor(public readonly warehouse: Warehouse) {}
} 