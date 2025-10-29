import { z } from 'zod';

export enum ProductFilterModeEnum {
  ALL = 'all',
  ACTIVES = 'actives',
  ARCHIVES = 'archives',
}

const ProductFilterModeSchema = z.enum(ProductFilterModeEnum);

export class ProductFilterMode {
  private constructor(private readonly value: ProductFilterModeEnum) {}

  static create(value: ProductFilterModeEnum): ProductFilterMode {
    const validatedValue = ProductFilterModeSchema.parse(value);
    return new ProductFilterMode(validatedValue);
  }

  getValue(): ProductFilterModeEnum {
    return this.value;
  }

  equals(other: ProductFilterMode): boolean {
    return this.value === other.value;
  }

  isAll(): boolean {
    return this.value === ProductFilterModeEnum.ALL;
  }

  isActives(): boolean {
    return this.value === ProductFilterModeEnum.ACTIVES;
  }

  isArchives(): boolean {
    return this.value === ProductFilterModeEnum.ARCHIVES;
  }
}
