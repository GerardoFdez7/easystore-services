import { z } from 'zod';

const acceptedPaymentMethodSchema = z
  .string()
  .min(1, { message: 'Each payment method must be a non-empty string' });

const acceptedPaymentMethodsSchema = z
  .array(acceptedPaymentMethodSchema)
  .min(1, { message: 'At least one payment method must be provided' });

export class AcceptedPaymentMethods {
  private readonly methods: string[];

  private constructor(methods: string[]) {
    this.methods = methods;
  }

  public static create(methods: string[]): AcceptedPaymentMethods {
    acceptedPaymentMethodsSchema.parse(methods);
    return new AcceptedPaymentMethods(methods);
  }

  public getValue(): string[] {
    return this.methods;
  }

  public equals(otherMethods: AcceptedPaymentMethods): boolean {
    return (
      JSON.stringify(this.methods) === JSON.stringify(otherMethods.methods)
    );
  }
}
