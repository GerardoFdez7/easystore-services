import { z } from 'zod';

const deliveryNumSchema = z
  .string()
  .min(1, { message: 'Delivery number must be at least 1 character' })
  .max(100, { message: 'Delivery number must be at most 100 characters' })
  .nullable();

export class DeliveryNum {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(deliveryNum: string): DeliveryNum {
    deliveryNumSchema.parse(deliveryNum);
    return new DeliveryNum(deliveryNum);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(deliveryNum: DeliveryNum): boolean {
    return this.value === deliveryNum.value;
  }
}
