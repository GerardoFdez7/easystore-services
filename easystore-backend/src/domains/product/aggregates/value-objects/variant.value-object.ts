import { z } from 'zod';
import {
  Attribute,
  StockPerWarehouse,
  Price,
  Currency,
  Condition,
  SKU,
  EAN,
  UPC,
  ISBN,
  Barcode,
  Weight,
  Dimension,
  PersonalizationOptions,
  VariantMedia,
} from './index';
import { IVariantType } from '../entities';

const variantSchema = z.object({
  attributes: z.array(z.object({})).nullish(),
  stockPerWarehouse: z.array(z.object({})).nullish(),
  price: z.number().nullish(),
  currency: z.string().nullish(),
  variantMedia: z.array(z.string()).nullish(),
  personalizationOptions: z.array(z.string()).nullish(),
  weight: z.number().nullish(),
  dimensions: z.object({}).nullish(),
  condition: z.string().nullish(),
  sku: z.string().nullish(),
  upc: z.string().nullish(),
  ean: z.string().nullish(),
  isbn: z.string().nullish(),
  barcode: z.string().nullish(),
});

type VariantProps = {
  attributes: Attribute[];
  stockPerWarehouse?: StockPerWarehouse[];
  price?: Price;
  currency?: Currency | null;
  variantMedia?: VariantMedia[];
  personalizationOptions?: PersonalizationOptions[];
  weight?: Weight | null;
  dimensions?: Dimension | null;
  condition: Condition;
  sku?: SKU | null;
  upc?: UPC | null;
  ean?: EAN | null;
  isbn?: ISBN | null;
  barcode?: Barcode | null;
};

export class Variant {
  private readonly props: VariantProps;

  private constructor(props: VariantProps) {
    this.props = props;
  }

  public static create(variantProps: IVariantType): Variant {
    // Parse and validate with Zod first (nullish, but recommended)
    variantSchema.parse(variantProps);

    // Ensure all properties are value objects
    const attributes = Array.isArray(variantProps.attributes)
      ? variantProps.attributes.map((attr) =>
          Attribute.create(attr.key, attr.value),
        )
      : [];
    const stockPerWarehouse = Array.isArray(variantProps.stockPerWarehouse)
      ? variantProps.stockPerWarehouse.map((stock) =>
          StockPerWarehouse.create(stock),
        )
      : [];
    const price = Price.create(variantProps.price);
    const currency = Currency.create(variantProps.currency);
    const variantMedia = Array.isArray(variantProps.variantMedia)
      ? variantProps.variantMedia.map((media) => VariantMedia.create(media))
      : [];
    const personalizationOptions = Array.isArray(
      variantProps.personalizationOptions,
    )
      ? variantProps.personalizationOptions.map((opt) =>
          PersonalizationOptions.create(opt),
        )
      : null;
    const weight =
      variantProps.weight !== null ? Weight.create(variantProps.weight) : null;
    const dimensions =
      variantProps.dimensions !== null
        ? Dimension.create(variantProps.dimensions)
        : null;
    const condition = Condition.create(variantProps.condition);
    const sku = variantProps.sku !== null ? SKU.create(variantProps.sku) : null;
    const upc = variantProps.upc !== null ? UPC.create(variantProps.upc) : null;
    const ean = variantProps.ean !== null ? EAN.create(variantProps.ean) : null;
    const isbn =
      variantProps.isbn !== null ? ISBN.create(variantProps.isbn) : null;
    const barcode =
      variantProps.barcode !== null
        ? Barcode.create(variantProps.barcode)
        : null;

    return new Variant({
      attributes,
      stockPerWarehouse,
      price,
      currency,
      variantMedia,
      personalizationOptions,
      weight,
      dimensions,
      condition,
      sku,
      upc,
      ean,
      isbn,
      barcode,
    });
  }

  public getAttributes(): Attribute[] {
    return this.props.attributes;
  }

  public getSku(): SKU | null {
    return this.props.sku;
  }

  public getBarcode(): Barcode | null {
    return this.props.barcode;
  }

  public getPrice(): Price {
    return this.props.price;
  }

  public getCurrency(): Currency {
    return this.props.currency;
  }

  public getDimensions(): Dimension | null {
    return this.props.dimensions;
  }

  public getWeight(): Weight | null {
    return this.props.weight;
  }

  public getVariantMedia(): VariantMedia[] | null {
    return this.props.variantMedia;
  }

  public getPersonalizationOptions(): PersonalizationOptions[] | null {
    return this.props.personalizationOptions;
  }

  public getValue(): VariantProps {
    return this.props;
  }

  public equals(variant: Variant): boolean {
    if (this.props.sku && variant.props.sku) {
      return this.props.sku.equals(variant.props.sku);
    }

    if (this.props.barcode && variant.props.barcode) {
      return this.props.barcode.equals(variant.props.barcode);
    }

    if (this.props.ean && variant.props.ean) {
      return this.props.ean.equals(variant.props.ean);
    }

    if (this.props.upc && variant.props.upc) {
      return this.props.upc.equals(variant.props.upc);
    }

    if (this.props.isbn && variant.props.isbn) {
      return this.props.isbn.equals(variant.props.isbn);
    }

    // Compare by attributes if no unique identifiers are available
    return (
      JSON.stringify(this.props.attributes) ===
      JSON.stringify(variant.props.attributes)
    );
  }
}
