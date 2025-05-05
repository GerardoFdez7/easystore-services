import { z } from 'zod';

const shippingMethodSchema = z
  .string()
  .min(1, { message: 'Shipping method must be a non-empty string' });

export class ShippingMethod {
  private readonly method: string;

  private constructor(method: string) {
    this.method = method;
  }

  public static create(method: string): ShippingMethod {
    shippingMethodSchema.parse(method);
    return new ShippingMethod(method);
  }

  public getValue(): string {
    return this.method;
  }

  public equals(otherMethods: ShippingMethod): boolean {
    return JSON.stringify(this.method) === JSON.stringify(otherMethods.method);
  }
}
