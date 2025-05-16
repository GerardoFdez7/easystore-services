import { z } from 'zod';

const DomainSchema = z
  .string()
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
    'Invalid domain format. Example of valid domain: example.com',
  );

export class Domain {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Domain {
    DomainSchema.parse(value);
    return new Domain(value);
  }

  public static createDefault(businessName: string): Domain {
    // Convert business name to a valid domain format
    const sanitizedName = businessName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .substring(0, 63); // Ensure domain segment isn't too long

    const defaultDomain = `${sanitizedName}.easystore.com`;
    return Domain.create(defaultDomain);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(other: Domain): boolean {
    return this.value === other.getValue();
  }
}
