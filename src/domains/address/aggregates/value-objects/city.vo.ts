import { z } from 'zod';

const citySchema = z
  .string()
  .min(2, { message: 'City must be at least 2 characters' })
  .max(100, { message: 'City must be at most 100 characters' });

export class City {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(city: string): City {
    citySchema.parse(city);
    return new City(city);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(city: City): boolean {
    return this.value === city.value;
  }
}
