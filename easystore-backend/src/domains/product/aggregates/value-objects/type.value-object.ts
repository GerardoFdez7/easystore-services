import { z } from 'zod';

const typeSchema = z.enum(['PHYSICAL', 'DIGITAL']);

export class Type {
  private readonly value: 'PHYSICAL' | 'DIGITAL';

  private constructor(value: 'PHYSICAL' | 'DIGITAL') {
    this.value = value;
  }

  public static create(type: string): Type {
    const validatedType = typeSchema.parse(type as 'PHYSICAL' | 'DIGITAL');
    return new Type(validatedType);
  }

  public getValue(): 'PHYSICAL' | 'DIGITAL' {
    return this.value;
  }

  public equals(type: Type): boolean {
    return this.value === type.value;
  }
}
