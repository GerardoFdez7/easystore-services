import { VariantDTO } from '../../../mappers/product.dto';

export class CreateVariantDTO {
  constructor(
    public readonly productId: string,
    public readonly variant: VariantDTO,
  ) {}
}
