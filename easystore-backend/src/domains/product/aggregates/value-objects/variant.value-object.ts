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

const variantSchema = z.object({
  attributes: z.array(z.object({})),
  stockPerWarehouse: z.array(z.object({})),
  price: z.number(),
  currency: z.string(),
  variantMedia: z.array(z.string()).optional(),
  personalizationOptions: z.array(z.string()).optional(),
  weight: z.number().optional(),
  dimensions: z.object({}).optional(),
  condition: z.string(),
  sku: z.string().optional(),
  upc: z.string().optional(),
  ean: z.string().optional(),
  isbn: z.string().optional(),
  barcode: z.string().optional(),
});

type VariantProps = {
  attributes: Attribute[];
  stockPerWarehouse: StockPerWarehouse[];
  price: Price;
  currency: Currency;
  variantMedia?: VariantMedia[];
  personalizationOptions?: PersonalizationOptions[];
  weight?: Weight;
  dimensions?: Dimension;
  condition: Condition;
  sku?: SKU;
  upc?: UPC;
  ean?: EAN;
  isbn?: ISBN;
  barcode?: Barcode;
};

export class Variant {
  private readonly props: VariantProps;

  private constructor(props: VariantProps) {
    this.props = props;
  }

  public static create(variantProps: unknown): Variant {
    const typedProps = variantProps as VariantProps;
    variantSchema.parse(variantProps);
    return new Variant(typedProps);
  }

  public getAttributes(): Attribute[] {
    return this.props.attributes;
  }

  public getSku(): SKU | undefined {
    return this.props.sku;
  }

  public getBarcode(): Barcode | undefined {
    return this.props.barcode;
  }

  public getPrice(): Price {
    return this.props.price;
  }

  public getCurrency(): Currency {
    return this.props.currency;
  }

  public getDimensions(): Dimension | undefined {
    return this.props.dimensions;
  }

  public getWeight(): Weight | undefined {
    return this.props.weight;
  }

  public getVariantMedia(): VariantMedia[] | undefined {
    return this.props.variantMedia;
  }

  public getPersonalizationOptions(): PersonalizationOptions[] | undefined {
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
