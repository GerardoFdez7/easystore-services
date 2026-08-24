import { z } from 'zod';

function isDomainLabel(value: string): boolean {
  if (value.length === 0 || value.length > 63) {
    return false;
  }

  if (value.startsWith('-') || value.endsWith('-')) {
    return false;
  }

  return Array.from(value).every((character) => {
    const isLowercaseLetter = character >= 'a' && character <= 'z';
    const isDigit = character >= '0' && character <= '9';
    return isLowercaseLetter || isDigit || character === '-';
  });
}

function isDomain(value: string): boolean {
  const normalizedValue = value.toLowerCase();
  const labels = normalizedValue.split('.');

  return (
    normalizedValue.length <= 253 &&
    labels.length >= 2 &&
    labels.every(isDomainLabel)
  );
}

const DomainSchema = z
  .string()
  .refine(
    isDomain,
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
