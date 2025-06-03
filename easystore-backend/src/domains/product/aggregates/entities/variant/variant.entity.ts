import { NotFoundException } from '@nestjs/common';
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
} from '../../value-objects';
import {
  IVariantBase,
  Media,
  IMediaBase,
  InstallmentPayment,
  IInstallmentPaymentBase,
  Warranty,
  IWarrantyBase,
  Entity,
  EntityProps,
} from '../';
import {
  MediaCreatedEvent,
  MediaUpdatedEvent,
  MediaDeletedEvent,
  InstallmentPaymentCreatedEvent,
  InstallmentPaymentUpdatedEvent,
  InstallmentPaymentDeletedEvent,
  WarrantyCreatedEvent,
  WarrantyUpdatedEvent,
  WarrantyDeletedEvent,
} from '../../events';

// Props for the Variant entity, using Value Objects
export interface IVariantProps extends EntityProps {
  id: Id;
  attributes: Attribute[];
  price: Price;
  variantCover?: Cover;
  personalizationOptions: PersonalizationOptions[];
  weight?: Weight | null;
  dimension?: Dimension | null;
  condition: Condition;
  upc?: UPC | null;
  ean?: EAN | null;
  sku?: SKU | null;
  barcode?: Barcode | null;
  isbn?: ISBN | null;
  productId: Id;
  tenantId: Id;
  updatedAt: Date;
  createdAt: Date;
  variantMedia: Media[];
  installmentPayments: InstallmentPayment[];
  warranties: Warranty[];
}

export class Variant extends Entity<IVariantProps> {
  constructor(props: IVariantProps) {
    super(props);
  }

  public static create(props: IVariantBase): Variant {
    const transformedProps = {
      attributes: props.attributes.map((attr) =>
        Attribute.create(attr.key, attr.value),
      ),
      price: Price.create(props.price),
      variantCover: props.variantCover
        ? Cover.create(props.variantCover)
        : Cover.create('https://easystore.com/default-variant-cover.jpg'),
      personalizationOptions: props.personalizationOptions
        ? props.personalizationOptions.map((opt) =>
            PersonalizationOptions.create(opt),
          )
        : [],
      weight: props.weight !== undefined ? Weight.create(props.weight) : null,
      dimension: props.dimension ? Dimension.create(props.dimension) : null,
      condition: props.condition
        ? Condition.create(props.condition)
        : Condition.create('NEW'),
      upc: props.upc ? UPC.create(props.upc) : null,
      ean: props.ean ? EAN.create(props.ean) : null,
      sku: props.sku ? SKU.create(props.sku) : null,
      barcode: props.barcode ? Barcode.create(props.barcode) : null,
      isbn: props.isbn ? ISBN.create(props.isbn) : null,
      productId: props.productId ? Id.create(props.productId) : null,
      tenantId: Id.create(props.tenantId),
    };

    // Creation of related entities
    // This ID represents the variant being created.
    const newVariantIdValue = null;
    const newVariantEntityId = Id.create(newVariantIdValue as number);

    const variantMedia = (props.variantMedia || []).map((mediaData) =>
      Media.create({
        ...mediaData,
        variantId: newVariantEntityId.getValue(),
      }),
    );

    const warranties = (props.warranties || []).map((warrantyData) =>
      Warranty.create({
        ...warrantyData,
        variantId: newVariantEntityId.getValue(),
      }),
    );

    const installmentPayments = (props.installmentPayments || []).map(
      (paymentData) =>
        InstallmentPayment.create({
          ...paymentData,
          variantId: newVariantEntityId.getValue(),
        }),
    );

    const variant = new Variant({
      id: null,
      ...transformedProps,
      variantMedia,
      warranties,
      installmentPayments,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    return variant;
  }

  public update(
    data: Partial<Omit<IVariantBase, 'productId' | 'tenantId'>>,
  ): void {
    if (data.attributes) {
      this.props.attributes = data.attributes.map((attr) =>
        Attribute.create(attr.key, attr.value),
      );
    }
    if (data.price !== undefined) {
      this.props.price = Price.create(data.price);
    }
    if (data.variantCover !== undefined) {
      this.props.cover = data.variantCover
        ? Cover.create(data.variantCover)
        : Cover.create('https://easystore.com/default-cover.jpg');
    }
    if (data.personalizationOptions) {
      this.props.personalizationOptions = data.personalizationOptions.map(
        (opt) => PersonalizationOptions.create(opt),
      );
    }
    if (data.weight !== undefined) {
      this.props.weight =
        data.weight !== undefined ? Weight.create(data.weight) : null;
    }
    if (data.dimension !== undefined) {
      this.props.dimension = data.dimension
        ? Dimension.create(data.dimension)
        : null;
    }
    if (data.condition) {
      this.props.condition = Condition.create(data.condition);
    }
    if (data.upc !== undefined) {
      this.props.upc = data.upc ? UPC.create(data.upc) : null;
    }
    if (data.ean !== undefined) {
      this.props.ean = data.ean ? EAN.create(data.ean) : null;
    }
    if (data.sku !== undefined) {
      this.props.sku = data.sku ? SKU.create(data.sku) : null;
    }
    if (data.barcode !== undefined) {
      this.props.barcode = data.barcode ? Barcode.create(data.barcode) : null;
    }
    if (data.isbn !== undefined) {
      this.props.isbn = data.isbn ? ISBN.create(data.isbn) : null;
    }

    this.props.updatedAt = new Date();
  }

  // --- Media Management ---

  /**
   * Adds a new media item to the variant.
   * @param mediaData The data for the new media item, conforming to IMediaBase.
   */
  public addMedia(mediaData: IMediaBase): void {
    const newMedia = Media.create({
      ...mediaData,
      variantId: this.props.id.getValue(),
    });
    this.props.variantMedia.push(newMedia);
    this.props.updatedAt = new Date();

    this.apply(new MediaCreatedEvent(this, newMedia));
  }

  /**
   * Updates an existing media item of the variant.
   * @param mediaId The ID of the media item to update.
   * @param updateData The data to update the media item with, conforming to Partial<IMediaBase>.
   */
  public updateMedia(mediaId: number, updateData: Partial<IMediaBase>): void {
    const media = this.props.variantMedia.find(
      (m) => m.get('id').getValue() === mediaId,
    );
    if (!media) {
      throw new NotFoundException(
        `Media with ID ${mediaId} not found on variant ${this.props.id.getValue()}.`,
      );
    }
    media.update(updateData);
    this.props.updatedAt = new Date();

    this.apply(new MediaUpdatedEvent(this, media));
  }

  /**
   * Removes a media item from the variant.
   * @param mediaId The ID of the media item to remove.
   */
  public removeMedia(mediaId: number): void {
    const mediaIndex = this.props.variantMedia.findIndex(
      (m) => m.get('id').getValue() === mediaId,
    );
    if (mediaIndex === -1) {
      throw new NotFoundException(
        `Media with ID ${mediaId} not found on variant ${this.props.id.getValue()}.`,
      );
    }
    const removedMedia = this.props.variantMedia.splice(mediaIndex, 1)[0];
    this.props.updatedAt = new Date();

    this.apply(new MediaDeletedEvent(this, removedMedia));
  }

  // --- Installment Payment Management ---

  /**
   * Adds a new installment payment to the variant.
   * @param paymentData The data for the new installment payment, conforming to IInstallmentPaymentBase.
   */
  public addInstallmentPayment(paymentData: IInstallmentPaymentBase): void {
    const newPayment = InstallmentPayment.create({
      ...paymentData,
      variantId: this.props.id.getValue(),
    });
    this.props.installmentPayments.push(newPayment);
    this.props.updatedAt = new Date();

    this.apply(new InstallmentPaymentCreatedEvent(this, newPayment));
  }

  /**
   * Updates an existing installment payment of the variant.
   * @param paymentId The ID of the installment payment to update.
   * @param updateData The data to update the installment payment with, conforming to Partial<IInstallmentPaymentBase>.
   */
  public updateInstallmentPayment(
    paymentId: number,
    updateData: Partial<IInstallmentPaymentBase>,
  ): void {
    const payment = this.props.installmentPayments.find(
      (p) => p.get('id').getValue() === paymentId,
    );
    if (!payment) {
      throw new NotFoundException(
        `Installment payment with ID ${paymentId} not found on variant ${this.props.id.getValue()}.`,
      );
    }
    payment.update(updateData);
    this.props.updatedAt = new Date();

    this.apply(new InstallmentPaymentUpdatedEvent(this, payment));
  }

  /**
   * Removes an installment payment from the variant.
   * @param paymentId The ID of the installment payment to remove.
   */
  public removeInstallmentPayment(paymentId: number): void {
    const paymentIndex = this.props.installmentPayments.findIndex(
      (p) => p.get('id').getValue() === paymentId,
    );
    if (paymentIndex === -1) {
      throw new NotFoundException(
        `Installment payment with ID ${paymentId} not found on variant ${this.props.id.getValue()}.`,
      );
    }
    const removedPayment = this.props.installmentPayments.splice(
      paymentIndex,
      1,
    )[0];
    this.props.updatedAt = new Date();

    this.apply(new InstallmentPaymentDeletedEvent(this, removedPayment));
  }

  // --- Warranty Management ---

  /**
   * Adds a new warranty to the variant.
   * @param warrantyData The data for the new warranty, conforming to IWarrantyBase.
   */
  public addWarranty(warrantyData: IWarrantyBase): void {
    const newWarranty = Warranty.create({
      ...warrantyData,
      variantId: this.props.id.getValue(),
    });
    this.props.warranties.push(newWarranty);
    this.props.updatedAt = new Date();

    this.apply(new WarrantyCreatedEvent(this, newWarranty));
  }

  /**
   * Updates an existing warranty of the variant.
   * @param warrantyId The ID of the warranty to update.
   * @param updateData The data to update the warranty with, conforming to Partial<IWarrantyBase>.
   */
  public updateWarranty(
    warrantyId: number,
    updateData: Partial<IWarrantyBase>,
  ): void {
    const warranty = this.props.warranties.find(
      (w) => w.get('id').getValue() === warrantyId,
    );
    if (!warranty) {
      throw new NotFoundException(
        `Warranty with ID ${warrantyId} not found on variant ${this.props.id.getValue()}.`,
      );
    }
    warranty.update(updateData);
    this.props.updatedAt = new Date();

    this.apply(new WarrantyUpdatedEvent(this, warranty));
  }

  /**
   * Removes a warranty from the variant.
   * @param warrantyId The ID of the warranty to remove.
   */
  public removeWarranty(warrantyId: number): void {
    const warrantyIndex = this.props.warranties.findIndex(
      (w) => w.get('id').getValue() === warrantyId,
    );
    if (warrantyIndex === -1) {
      throw new NotFoundException(
        `Warranty with ID ${warrantyId} not found on variant ${this.props.id.getValue()}.`,
      );
    }
    const removedWarranty = this.props.warranties.splice(warrantyIndex, 1)[0];
    this.props.updatedAt = new Date();

    this.apply(new WarrantyDeletedEvent(this, removedWarranty));
  }
}
