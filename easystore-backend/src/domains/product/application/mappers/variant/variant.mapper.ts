import {
  Entity,
  Variant,
  IVariantProps,
  IVariantType,
  IMediaBase,
  IInstallmentPaymentBase,
  IWarrantyBase,
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

  // --- Media Management ---

  /**
   * Maps an AddMediaToVariantDTO to call addMedia on Variant entity
   * @param existingVariant The existing variant
   * @param dto The DTO containing media data
   * @returns The variant with the new media added
   */
  static fromAddMediaDto(existingVariant: Variant, dto: IMediaBase): Variant {
    existingVariant.addMedia(dto);
    return existingVariant;
  }

  /**
   * Maps an UpdateMediaOnVariantDTO to call updateMedia on Variant entity
   * @param existingVariant The existing variant
   * @param mediaId The ID of the media to update
   * @param dto The DTO containing media update data
   * @returns The variant with the media updated
   */
  static fromUpdateMediaDto(
    existingVariant: Variant,
    mediaId: number,
    dto: IMediaBase,
  ): Variant {
    existingVariant.updateMedia(mediaId, dto as Partial<IMediaBase>);
    return existingVariant;
  }

  /**
   * Maps a media ID to call removeMedia on Variant entity
   * @param existingVariant The existing variant
   * @param mediaId The ID of the media to remove
   * @returns The variant with the media removed
   */
  static fromRemoveMediaDto(
    existingVariant: Variant,
    mediaId: number,
  ): Variant {
    existingVariant.removeMedia(mediaId);
    return existingVariant;
  }

  // --- Installment Payment Management ---

  /**
   * Maps an AddInstallmentPaymentToVariantDTO to call addInstallmentPayment on Variant entity
   * @param existingVariant The existing variant
   * @param dto The DTO containing installment payment data
   * @returns The variant with the new installment payment added
   */
  static fromAddInstallmentPaymentDto(
    existingVariant: Variant,
    dto: IInstallmentPaymentBase,
  ): Variant {
    existingVariant.addInstallmentPayment(dto);
    return existingVariant;
  }

  /**
   * Maps an UpdateInstallmentPaymentOnVariantDTO to call updateInstallmentPayment on Variant entity
   * @param existingVariant The existing variant
   * @param paymentId The ID of the installment payment to update
   * @param dto The DTO containing installment payment update data
   * @returns The variant with the installment payment updated
   */
  static fromUpdateInstallmentPaymentDto(
    existingVariant: Variant,
    paymentId: number,
    dto: IInstallmentPaymentBase,
  ): Variant {
    existingVariant.updateInstallmentPayment(
      paymentId,
      dto as Partial<IInstallmentPaymentBase>,
    );
    return existingVariant;
  }

  /**
   * Maps a payment ID to call removeInstallmentPayment on Variant entity
   * @param existingVariant The existing variant
   * @param paymentId The ID of the installment payment to remove
   * @returns The variant with the installment payment removed
   */
  static fromRemoveInstallmentPaymentDto(
    existingVariant: Variant,
    paymentId: number,
  ): Variant {
    existingVariant.removeInstallmentPayment(paymentId);
    return existingVariant;
  }

  // --- Warranty Management ---

  /**
   * Maps an AddWarrantyToVariantDTO to call addWarranty on Variant entity
   * @param existingVariant The existing variant
   * @param dto The DTO containing warranty data
   * @returns The variant with the new warranty added
   */
  static fromAddWarrantyDto(
    existingVariant: Variant,
    dto: IWarrantyBase,
  ): Variant {
    existingVariant.addWarranty(dto);
    return existingVariant;
  }

  /**
   * Maps an UpdateWarrantyOnVariantDTO to call updateWarranty on Variant entity
   * @param existingVariant The existing variant
   * @param warrantyId The ID of the warranty to update
   * @param dto The DTO containing warranty update data
   * @returns The variant with the warranty updated
   */
  static fromUpdateWarrantyDto(
    existingVariant: Variant,
    warrantyId: number,
    dto: IWarrantyBase,
  ): Variant {
    existingVariant.updateWarranty(warrantyId, dto as Partial<IWarrantyBase>);
    return existingVariant;
  }

  /**
   * Maps a warranty ID to call removeWarranty on Variant entity
   * @param existingVariant The existing variant
   * @param warrantyId The ID of the warranty to remove
   * @returns The variant with the warranty removed
   */
  static fromRemoveWarrantyDto(
    existingVariant: Variant,
    warrantyId: number,
  ): Variant {
    existingVariant.removeWarranty(warrantyId);
    return existingVariant;
  }
}
