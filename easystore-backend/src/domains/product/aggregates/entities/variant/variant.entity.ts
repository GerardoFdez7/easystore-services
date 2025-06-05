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
      isArchived: false,
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
      this.props.variantCover = data.variantCover
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

    if (data.variantMedia !== undefined) {
      this.props.variantMedia = (data.variantMedia || []).map((mediaData) =>
        Media.create({
          ...mediaData,
          variantId: this.props.id.getValue(),
        }),
      );

      if (data.installmentPayments !== undefined) {
        this.props.installmentPayments = (data.installmentPayments || []).map(
          (paymentData) =>
            InstallmentPayment.create({
              ...paymentData,
              variantId: this.props.id.getValue(),
            }),
        );
      }

      if (data.warranties !== undefined) {
        this.props.warranties = (data.warranties || []).map((warrantyData) =>
          Warranty.create({
            ...warrantyData,
            variantId: this.props.id.getValue(),
          }),
        );
      }
    }

    this.props.updatedAt = new Date();
  }

  public archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date();
  }

  public restore(): void {
    this.props.isArchived = false;
    this.props.updatedAt = new Date();
  }
}
