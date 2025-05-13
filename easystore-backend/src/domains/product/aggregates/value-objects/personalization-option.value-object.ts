import { z } from 'zod';

const personalizationOptionSchema = z.string().min(1, {
  message: 'Each personalization option must be a non-empty string',
});

export class PersonalizationOptions {
  private readonly options: string;

  private constructor(options: string) {
    this.options = options;
  }

  public static create(options: string): PersonalizationOptions {
    personalizationOptionSchema.parse(options);
    return new PersonalizationOptions(options);
  }

  public getValue(): string {
    return this.options;
  }

  public equals(otherOptions: PersonalizationOptions): boolean {
    return (
      JSON.stringify(this.options) === JSON.stringify(otherOptions.options)
    );
  }
}
