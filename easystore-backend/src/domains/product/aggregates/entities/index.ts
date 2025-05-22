// Product entity
export { Product, ProductProps } from './product/product.entity';
export {
  IProductType,
  IProductBase,
  IProductSystem,
  IVariantInitData,
  IMediaInitData,
  IProductCategoryInitData,
  IWarrantyInitData,
  IInstallmentPaymentInitData,
  ISustainabilityInitData,
} from './product/product.attributes';

// Variant entity
export { Variant, VariantProps } from './variant/variant.entity';
export {
  IVariantType,
  IVariantBase,
  IVariantSystem,
} from './variant/variant.attributes';

// Installment payment entity
export {
  InstallmentPayment,
  InstallmentPaymentProps,
} from './installment-payment/installment-payment.entity';
export {
  IInstallmentPaymentType,
  IInstallmentPaymentBase,
  IInstallmentPaymentSystem,
} from './installment-payment/installment-payment.attributes';

// Media entity
export { Media, MediaProps } from './media/media.entity';
export { IMediaType, IMediaBase, IMediaSystem } from './media/media.attributes';

// Sustainability entity
export {
  Sustainability,
  SustainabilityProps,
} from './sustainability/sustainability.entity';
export {
  ISustainabilityType,
  ISustainabilityBase,
  ISustainabilitySystem,
} from './sustainability/sustainability.attributes';

// Warranty entity
export { Warranty, WarrantyProps } from './warranty/warranty.entity';
export {
  IWarrantyType,
  IWarrantyBase,
  IWarrantySystem,
} from './warranty/warranty.attributes';

// ProductCategories entity
export {
  ProductCategories,
  ProductCategoriesProps,
  IProductCategoriesType,
  IProductCategoriesBase,
  IProductCategoriesSystem,
} from '@domains/entities';
