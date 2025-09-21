// Shared
export { Entity, EntityProps } from '@shared/entity.base';

// Product entity
export { Product, IProductProps } from './product/product.entity';
export {
  IProductType,
  IProductBase,
  IProductSystem,
  IVariantInitData,
  IMediaInitData,
  IProductCategoryInitData,
  ISustainabilityInitData,
} from './product/product.attributes';

// Variant entity
export { Variant, IVariantProps } from './variant/variant.entity';
export {
  IVariantType,
  IVariantBase,
  IVariantSystem,
  IWarrantyInitData,
  IInstallmentPaymentInitData,
} from './variant/variant.attributes';

// Installment payment entity
export {
  InstallmentPayment,
  IInstallmentPaymentProps,
} from './installment-payment/installment-payment.entity';
export {
  IInstallmentPaymentType,
  IInstallmentPaymentBase,
  IInstallmentPaymentSystem,
} from './installment-payment/installment-payment.attributes';

// Media entity
export { Media, IMediaProps } from './media/media.entity';
export { IMediaType, IMediaBase, IMediaSystem } from './media/media.attributes';

// Sustainability entity
export {
  Sustainability,
  ISustainabilityProps,
} from './sustainability/sustainability.entity';
export {
  ISustainabilityType,
  ISustainabilityBase,
  ISustainabilitySystem,
} from './sustainability/sustainability.attributes';

// Warranty entity
export { Warranty, IWarrantyProps } from './warranty/warranty.entity';
export {
  IWarrantyType,
  IWarrantyBase,
  IWarrantySystem,
} from './warranty/warranty.attributes';

// ProductCategories entity
export {
  ProductCategories,
  IProductCategoriesProps,
} from './categories/categories.entity';
export {
  IProductCategoriesType,
  IProductCategoriesBase,
  IProductCategoriesSystem,
} from './categories/categories.attributes';
