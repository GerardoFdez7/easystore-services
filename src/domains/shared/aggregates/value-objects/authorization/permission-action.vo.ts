import { z } from 'zod/v4';

export enum PermissionActionEnum {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

const permissionActionSchema = z.enum(PermissionActionEnum);

export class PermissionAction {
  private readonly value: PermissionActionEnum;

  private constructor(value: PermissionActionEnum) {
    this.value = value;
  }

  public static create(action: string): PermissionAction {
    const validatedAction = permissionActionSchema.parse(action);
    return new PermissionAction(validatedAction);
  }

  public getValue(): PermissionActionEnum {
    return this.value;
  }

  public equals(action: PermissionAction): boolean {
    return this.value === action.value;
  }
}
