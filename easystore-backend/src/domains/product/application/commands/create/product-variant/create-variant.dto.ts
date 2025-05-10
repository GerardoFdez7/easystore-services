import { VariantDTO } from '../../../mappers/product.dto';

export class CreateVariantDTO {
  productId: string;
  variant: VariantDTO;
}
