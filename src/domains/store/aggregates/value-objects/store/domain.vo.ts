import { z } from 'zod';

function isDomainLabel(label: string): boolean {
  return (
    label.length > 0 &&
    label.length <= 63 &&
    !label.startsWith('-') &&
    !label.endsWith('-') &&
    Array.from(label).every((character) => /[a-z0-9-]/.test(character))
  );
}

const DomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => {
    const labels = value.split('.');
    return (
      value.length <= 253 &&
      labels.length >= 2 &&
      labels.every(isDomainLabel) &&
      /^[a-z]{2,63}$/.test(labels[labels.length - 1] ?? '')
    );
  }, 'Invalid domain format. Example: example.com');

export class Domain {
  private constructor(private readonly value: string) {}

  static create(value: string): Domain {
    return new Domain(DomainSchema.parse(value));
  }

  getValue(): string {
    return this.value;
  }
}
