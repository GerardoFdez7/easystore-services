export class EmailVerified {
  private constructor(private readonly value: boolean) {}

  public static create(value: boolean): EmailVerified {
    return new EmailVerified(value);
  }

  public getValue(): boolean {
    return this.value;
  }

  public verify(): EmailVerified {
    return new EmailVerified(true);
  }

  public equals(other: EmailVerified): boolean {
    return this.value === other.getValue();
  }
}
