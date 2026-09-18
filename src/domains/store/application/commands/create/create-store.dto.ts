import { IStoreBase } from '../../../aggregates/entities';

export class CreateStoreDTO {
  constructor(public readonly data: IStoreBase) {}
}
