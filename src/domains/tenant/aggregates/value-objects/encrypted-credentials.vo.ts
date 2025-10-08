export class EncryptedCredentialsVO {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Encrypted credentials cannot be empty');
    }
  }

  static create(encryptedValue: string): EncryptedCredentialsVO {
    return new EncryptedCredentialsVO(encryptedValue);
  }

  toString(): string {
    return this.value;
  }

  equals(other: EncryptedCredentialsVO): boolean {
    return this.value === other.value;
  }
}
