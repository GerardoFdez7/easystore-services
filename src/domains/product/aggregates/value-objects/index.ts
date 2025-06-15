// Shared value objects
export { Months } from './shared/months.vo';
export {
  Id,
  IdSchema,
  Name,
  Cover,
  ShortDescription,
  MediumDescription,
  LongDescription,
  SortBy,
  SortOrder,
} from '@domains/value-objects';

// Product value objects
export { Type, TypeEnum } from './product/type.vo';
export { Tags } from './product/tags.vo';
export { Brand } from './product/brand.vo';
export { Manufacturer } from './product/manufacturer.vo';

// Variant value objects
export { Price } from './variant/price.vo';
export { PersonalizationOptions } from './variant/personalization-option.vo';
export { Weight } from './variant/weight.vo';
export { Dimension, DimensionProps } from './variant/dimension.vo';
export { Condition, ConditionEnum } from './variant/condition.vo';
export { SKU } from './variant/sku.vo';
export { UPC } from './variant/upc.vo';
export { EAN } from './variant/ean.vo';
export { ISBN } from './variant/isbn.vo';
export { Barcode } from './variant/barcode.vo';
export { Attribute, AttributeProps } from './variant/attribute.vo';

// Installment payment value objects
export { InterestRate } from './installment-payment/interest-rate.vo';

// Sustainability value objects
export { Certification } from './sustainability/certification.vo';
export { RecycledPercentage } from './sustainability/recycled-percentage.vo';

// Media value objects
export { Url } from './media/url.vo';
export { Position } from './media/position.vo';
export { MediaType, MediaTypeEnum } from './media/media-type.vo';
