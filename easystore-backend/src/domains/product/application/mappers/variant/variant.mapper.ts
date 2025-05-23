import {
  Entity,
  Variant,
  IVariantProps,
  IVariantType,
} from '../../../aggregates/entities';
import {
  Id,
  Attribute,
  Price,
  Cover,
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
    return Entity.fromPersistence<
      typeof persistenceVariant,
      IVariantProps,
      Variant
    >(Variant, persistenceVariant, (model) => ({
      id: Id.create(model.id),
      attributes: model.attributes.map((attr) =>
        Attribute.create(attr.key, attr.value),
      ),
      price: Price.create(model.price),
      variantCover: Cover.create(model.variantCover),
      personalizationOptions: model.personalizationOptions
        ? model.personalizationOptions.map((opt) =>
            PersonalizationOptions.create(opt),
          )
        : [],
      weight: model.weight ? Weight.create(model.weight) : null,
      dimension: model.dimension ? Dimension.create(model.dimension) : null,
      condition: Condition.create(model.condition),
      upc: model.upc ? UPC.create(model.upc) : null,
      ean: model.ean ? EAN.create(model.ean) : null,
      sku: model.sku ? SKU.create(model.sku) : null,
      barcode: model.barcode ? Barcode.create(model.barcode) : null,
      isbn: model.isbn ? ISBN.create(model.isbn) : null,
      productId: Id.create(model.productId),
      tenantId: Id.create(model.tenantId),
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
      media: model.media.map((mediaItem) =>
        MediaMapper.fromPersistence(mediaItem),
      ),
      warranties: model.warranties.map((warrantyItem) =>
        WarrantyMapper.fromPersistence(warrantyItem),
      ),
      installmentPayments: model.installmentPayments.map((paymentItem) =>
        InstallmentPaymentMapper.fromPersistence(paymentItem),
      ),
    }));
  }

  /**
   * Maps a VariantDTO to a domain entity model.
   * @param dto The Variant tDTO.
   * @returns The mapped Variant domain entity.
   */
  static toDto(variant: Variant): VariantDTO {
    return variant.toDTO<VariantDTO>((entity) => ({
      id: entity.get('id')?.getValue() || null,
      attributes:
        entity.get('attributes')?.map((attr) => attr.getAttribute()) || [],
      price: entity.get('price')?.getValue() || null,
      variantCover: entity.get('variantCover')?.getValue() || null,
      personalizationOptions:
        entity
          .get('personalizationOptions')
          ?.map((option) => option.getValue()) || [],
      weight: entity.get('weight')?.getValue() || null,
      dimension: entity.get('dimension')?.getValue() || null,
      condition: entity.get('condition')?.getValue() || null,
      upc: entity.get('upc')?.getValue() || null,
      ean: entity.get('ean')?.getValue() || null,
      sku: entity.get('sku')?.getValue() || null,
      barcode: entity.get('barcode')?.getValue() || null,
      isbn: entity.get('isbn')?.getValue() || null,
      productId: entity.get('productId')?.getValue() || null,
      tenantId: entity.get('tenantId')?.getValue() || null,
      updatedAt: entity.get('updatedAt'),
      createdAt: entity.get('createdAt'),
      media:
        entity.get('media').map((mediaItem) => MediaMapper.toDto(mediaItem)) ??
        [],
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
