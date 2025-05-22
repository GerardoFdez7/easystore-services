import { z } from 'zod';

export enum TypeEnum {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
}

const typeSchema = z.nativeEnum(TypeEnum);

export class Type {
  private readonly value: TypeEnum;

  private constructor(value: TypeEnum) {
    this.value = value;
  }

  public static create(type: string): Type {
    const validatedType = typeSchema.parse(type);
    return new Type(validatedType);
  }

  public getValue(): TypeEnum {
    return this.value;
  }

  public equals(type: Type): boolean {
    return this.value === type.value;
  }
}
