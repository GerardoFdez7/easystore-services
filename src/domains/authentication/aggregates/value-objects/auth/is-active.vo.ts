export class IsActive {
  private constructor(private readonly value: boolean) {}

  public static create(value: boolean): IsActive {
    return new IsActive(value);
  }

  public getValue(): boolean {
    return this.value;
  }

  public toggle(): IsActive {
    return new IsActive(!this.value);
  }

  public equals(other: IsActive): boolean {
    return this.value === other.getValue();
  }
}
