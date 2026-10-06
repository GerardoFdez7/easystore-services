import { PublicBadRequestException } from '@shared/application/exceptions/public-bad-request.exception';
import { IVariantBase } from '../../../aggregates/entities';
import { TypeEnum } from '../../../aggregates/value-objects';

type VariantPhysicalProperties = Pick<IVariantBase, 'dimension' | 'weight'>;

export function validateVariantForProductType(
  variant: VariantPhysicalProperties,
  productType: TypeEnum,
): void {
  if (productType === TypeEnum.DIGITAL) {
    if (variant.weight !== undefined || variant.dimension !== undefined) {
      throw new PublicBadRequestException(
        'Digital products cannot have weight or dimensions.',
      );
    }

    return;
  }

  if (productType !== TypeEnum.PHYSICAL) return;

  if (variant.dimension === null || variant.dimension === undefined) {
    throw new PublicBadRequestException(
      'Dimension property is required for physical products',
    );
  }

  if (variant.weight === null || variant.weight === undefined) {
    throw new PublicBadRequestException(
      'Weight property is required for physical products',
    );
  }

  if (variant.weight <= 0) {
    throw new PublicBadRequestException(
      'Weight must be a positive value for physical products.',
    );
  }

  const dimensions = [
    ['height', variant.dimension.height],
    ['width', variant.dimension.width],
    ['length', variant.dimension.length],
  ] as const;

  for (const [name, value] of dimensions) {
    if (value !== undefined && value <= 0) {
      throw new PublicBadRequestException(
        `Dimension ${name} must be a positive value for physical products.`,
      );
    }
  }
}
