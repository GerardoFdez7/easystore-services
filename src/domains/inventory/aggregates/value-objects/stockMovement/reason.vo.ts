import { z } from 'zod';

const reasonSchema = z
  .string()
  .min(1, { message: 'Reason must be a non-empty string' })
  .max(10000, { message: 'Reason must not exceed 10,000 characters' })
  .trim();

export class Reason {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Reason {
    const validatedValue = reasonSchema.parse(value);
    return new Reason(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherReason: Reason): boolean {
    return this.value === otherReason.value;
  }

  public isEmpty(): boolean {
    return this.value.trim().length === 0;
  }

  public length(): number {
    return this.value.length;
  }

  public contains(text: string): boolean {
    return this.value.toLowerCase().includes(text.toLowerCase());
  }

  public startsWith(prefix: string): boolean {
    return this.value.toLowerCase().startsWith(prefix.toLowerCase());
  }

  public endsWith(suffix: string): boolean {
    return this.value.toLowerCase().endsWith(suffix.toLowerCase());
  }
} 