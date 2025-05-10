import { z } from 'zod';

const shippingRestrictionSchema = z
  .string()
  .min(1, { message: 'Each restriction must be a non-empty string' });

export class ShippingRestriction {
  private readonly restriction: string;

  private constructor(restriction: string) {
    this.restriction = restriction;
  }

  public static create(restriction: string): ShippingRestriction {
    shippingRestrictionSchema.parse(restriction);
    return new ShippingRestriction(restriction);
  }

  public getValue(): string {
    return this.restriction;
  }

  public equals(otherRestrictions: ShippingRestriction): boolean {
    return (
      JSON.stringify(this.restriction) ===
      JSON.stringify(otherRestrictions.restriction)
    );
  }
}
