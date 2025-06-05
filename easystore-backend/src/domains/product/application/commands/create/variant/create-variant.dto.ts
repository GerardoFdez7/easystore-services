import { IVariantBase } from '../../../../aggregates/entities';

export class CreateVariantDTO {
  constructor(public readonly variant: IVariantBase) {}
}
