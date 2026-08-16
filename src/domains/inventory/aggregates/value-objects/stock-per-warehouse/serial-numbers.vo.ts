import { z } from 'zod';

const serialNumberSchema = z
  .string()
  .min(1, { message: 'Each serial number must be a non-empty string' })
  .max(100, { message: 'Each serial number must not exceed 100 characters' })
  .trim();

const serialNumbersSchema = z
  .array(serialNumberSchema)
  .max(1000, { message: 'Cannot have more than 1000 serial numbers' });

export class SerialNumbers {
  private readonly values: string[];

  private constructor(values: string[]) {
    this.values = values;
  }

  public static create(values: string[]): SerialNumbers {
    const validatedValues = serialNumbersSchema.parse(values);
    return new SerialNumbers(validatedValues);
  }

  public static createEmpty(): SerialNumbers {
    return new SerialNumbers([]);
  }

  public getValue(): string[] {
    return [...this.values]; // Return a copy to maintain immutability
  }

  public equals(otherSerialNumbers: SerialNumbers): boolean {
    if (this.values.length !== otherSerialNumbers.values.length) {
      return false;
    }
    return this.values.every(
      (value, index) => value === otherSerialNumbers.values[index],
    );
  }

  public isEmpty(): boolean {
    return this.values.length === 0;
  }

  public hasValues(): boolean {
    return this.values.length > 0;
  }

  public count(): number {
    return this.values.length;
  }

  public add(serialNumber: string): SerialNumbers {
    const newValues = [...this.values, serialNumber];
    return SerialNumbers.create(newValues);
  }

  public remove(serialNumber: string): SerialNumbers {
    const newValues = this.values.filter((value) => value !== serialNumber);
    return SerialNumbers.create(newValues);
  }

  public contains(serialNumber: string): boolean {
    return this.values.includes(serialNumber);
  }
}
