import { Variant, IVariantType } from '../../../aggregates/entities';
import {
  Id,
  Attribute,
  Price,
  Media,
  PersonalizationOptions,
  Weight,
  Dimension,
  Condition,
  UPC,
  EAN,
  SKU,
  Barcode,
  ISBN,
} from '../../../aggregates/value-objects';
import {
  VariantDTO,
  MediaMapper,
  WarrantyMapper,
  InstallmentPaymentMapper,
} from '../';

/**
 * Centralized mapper for Variant domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class VariantMapper {
  /**
   * Maps a persistence Variant model to a VariantDTO.
   * @param persistenceVariant The Persistence Variant model to map.
   * @returns The mapped Variant domain entity.
   */
  static fromPersistence(persistenceVariant: IVariantType): Variant {
    return Variant.reconstitute({
      id: Id.create(persistenceVariant.id),
      attributes: (persistenceVariant.attributes || []).map((attr) =>
        Attribute.create(attr.key, attr.value),
      ),
      price: Price.create(Number(persistenceVariant.price)),
      variantCover: persistenceVariant.variantCover
        ? Media.create(persistenceVariant.variantCover)
        : null,
      personalizationOptions: persistenceVariant.personalizationOptions
        ? persistenceVariant.personalizationOptions.map((opt) =>
            PersonalizationOptions.create(opt),
          )
        : [],
      weight: persistenceVariant.weight
        ? Weight.create(persistenceVariant.weight)
        : null,
      dimension: persistenceVariant.dimension
        ? Dimension.create(persistenceVariant.dimension)
        : null,
      condition: Condition.create(persistenceVariant.condition),
      upc: persistenceVariant.upc ? UPC.create(persistenceVariant.upc) : null,
      ean: persistenceVariant.ean ? EAN.create(persistenceVariant.ean) : null,
      sku: SKU.create(persistenceVariant.sku),
      barcode: persistenceVariant.barcode
        ? Barcode.create(persistenceVariant.barcode)
        : null,
      isbn: persistenceVariant.isbn
        ? ISBN.create(persistenceVariant.isbn)
        : null,
      isArchived: persistenceVariant.isArchived,
      productId: Id.create(persistenceVariant.productId),
      tenantId: Id.create(persistenceVariant.tenantId),
      updatedAt: persistenceVariant.updatedAt,
      createdAt: persistenceVariant.createdAt,
      variantMedia: (persistenceVariant.variantMedia || []).map((mediaItem) =>
        MediaMapper.fromPersistence(mediaItem),
      ),
      warranties: (persistenceVariant.warranties || []).map((warrantyItem) =>
        WarrantyMapper.fromPersistence(warrantyItem),
      ),
      installmentPayments: (persistenceVariant.installmentPayments || []).map(
        (paymentItem) => InstallmentPaymentMapper.fromPersistence(paymentItem),
      ),
    });
  }

  /**
   * Maps a VariantDTO to a domain entity model.
   * @param dto The Variant tDTO.
   * @returns The mapped Variant domain entity.
   */
  static toDto(variant: Variant): VariantDTO {
    return variant.toDTO<VariantDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      attributes:
        entity.get('attributes')?.map((attr) => attr.getAttribute()) || [],
      price: entity.get('price')?.getValue(),
      variantCover: entity.get('variantCover')?.getValue(),
      personalizationOptions:
        entity
          .get('personalizationOptions')
          ?.map((option) => option.getValue()) || [],
      weight: entity.get('weight')?.getValue(),
      dimension: entity.get('dimension')?.getValue(),
      condition: entity.get('condition')?.getValue(),
      upc: entity.get('upc')?.getValue(),
      ean: entity.get('ean')?.getValue(),
      sku: entity.get('sku')?.getValue(),
      barcode: entity.get('barcode')?.getValue(),
      isbn: entity.get('isbn')?.getValue(),
      isArchived: entity.get('isArchived'),
      productId: entity.get('productId')?.getValue(),
      tenantId: entity.get('tenantId')?.getValue(),
      updatedAt: entity.get('updatedAt'),
      createdAt: entity.get('createdAt'),
      variantMedia:
        entity
          .get('variantMedia')
          .map((mediaItem) => MediaMapper.toDto(mediaItem)) ?? [],
      warranties:
        entity
          .get('warranties')
          .map((warrantyItem) => WarrantyMapper.toDto(warrantyItem)) ?? [],
      installmentPayments:
        entity
          .get('installmentPayments')
          .map((paymentItem) => InstallmentPaymentMapper.toDto(paymentItem)) ??
        [],
    }));
  }
}
