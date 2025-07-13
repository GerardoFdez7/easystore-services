import { IEvent } from '@nestjs/cqrs';
import { Warehouse } from '../../entities';

export class WarehouseDeletedEvent implements IEvent {
  constructor(public readonly warehouse: Warehouse) {}
} 