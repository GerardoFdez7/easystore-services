import {
  Id,
  Attribute,
  Price,
  Media as MediaVO,
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
  InstallmentPayment,
  Warranty,
  Entity,
  EntityProps,
} from '../';

// Props for the Variant entity, using Value Objects
export interface IVariantProps extends EntityProps {
  id: Id;
  attributes: Attribute[];
  price: Price;
  variantCover?: MediaVO;
  personalizationOptions: PersonalizationOptions[];
  weight?: Weight;
  dimension?: Dimension;
  condition: Condition;
  upc?: UPC;
  ean?: EAN;
  sku: SKU;
  barcode?: Barcode;
  isbn?: ISBN;
  isArchived: boolean;
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
        ? MediaVO.create(props.variantCover)
        : null,
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
      sku: SKU.create(props.sku),
      barcode: props.barcode ? Barcode.create(props.barcode) : null,
      isbn: props.isbn ? ISBN.create(props.isbn) : null,
      productId: props.productId ? Id.create(props.productId) : null,
      tenantId: Id.create(props.tenantId),
    };

    // Creation of related entities
    // This ID represents the variant being created.
    const newVariantIdValue = Id.generate();

    const variantMedia = (props.variantMedia || []).map((mediaData) =>
      Media.create({
        ...mediaData,
        variantId: newVariantIdValue.getValue(),
      }),
    );

    const warranties = (props.warranties || []).map((warrantyData) =>
      Warranty.create({
        ...warrantyData,
        variantId: newVariantIdValue.getValue(),
      }),
    );

    const installmentPayments = (props.installmentPayments || []).map(
      (paymentData) =>
        InstallmentPayment.create({
          ...paymentData,
          variantId: newVariantIdValue.getValue(),
        }),
    );

    const variant = new Variant({
      id: newVariantIdValue,
      ...transformedProps,
      variantMedia,
      warranties,
      installmentPayments,
      isArchived: false,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    return variant;
  }

  public update(
    data: Partial<Omit<IVariantBase, 'productId' | 'tenantId'>>,
  ): Variant {
    const newProps = { ...this.props };

    if (data.attributes) {
      newProps.attributes = data.attributes.map((attr) =>
        Attribute.create(attr.key, attr.value),
      );
    }
    if (data.price !== undefined) {
      newProps.price = Price.create(data.price);
    }
    if (data.variantCover !== undefined) {
      newProps.variantCover = MediaVO.create(data.variantCover);
    }
    if (data.personalizationOptions) {
      newProps.personalizationOptions = data.personalizationOptions.map((opt) =>
        PersonalizationOptions.create(opt),
      );
    }
    if (data.weight !== undefined) {
      newProps.weight =
        data.weight !== undefined ? Weight.create(data.weight) : null;
    }
    if (data.dimension !== undefined) {
      newProps.dimension = data.dimension
        ? Dimension.create(data.dimension)
        : null;
    }
    if (data.condition) {
      newProps.condition = Condition.create(data.condition);
    }
    if (data.upc !== undefined) {
      newProps.upc = data.upc ? UPC.create(data.upc) : null;
    }
    if (data.ean !== undefined) {
      newProps.ean = data.ean ? EAN.create(data.ean) : null;
    }
    if (data.sku !== undefined) {
      newProps.sku = SKU.create(data.sku);
    }
    if (data.barcode !== undefined) {
      newProps.barcode = data.barcode ? Barcode.create(data.barcode) : null;
    }
    if (data.isbn !== undefined) {
      newProps.isbn = data.isbn ? ISBN.create(data.isbn) : null;
    }

    if (data.variantMedia !== undefined) {
      newProps.variantMedia = (data.variantMedia || []).map((mediaData) =>
        Media.create({
          ...mediaData,
          variantId: this.props.id.getValue(),
        }),
      );
    }

    if (data.installmentPayments !== undefined) {
      newProps.installmentPayments = (data.installmentPayments || []).map(
        (paymentData) =>
          InstallmentPayment.create({
            ...paymentData,
            variantId: this.props.id.getValue(),
          }),
      );
    }

    if (data.warranties !== undefined) {
      newProps.warranties = (data.warranties || []).map((warrantyData) =>
        Warranty.create({
          ...warrantyData,
          variantId: this.props.id.getValue(),
        }),
      );
    }

    newProps.updatedAt = new Date();

    return new Variant(newProps);
  }

  public archive(): Variant {
    const newProps = { ...this.props };
    newProps.isArchived = true;
    newProps.updatedAt = new Date();
    return new Variant(newProps);
  }

  public restore(): Variant {
    const newProps = { ...this.props };
    newProps.isArchived = false;
    newProps.updatedAt = new Date();
    return new Variant(newProps);
  }
}
