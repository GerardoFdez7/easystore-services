export class ExternalReferenceNumberVO {
  constructor(public readonly value: string) {}

  static generate(): ExternalReferenceNumberVO {
    return new ExternalReferenceNumberVO(`ERN-${Date.now()}`);
  }

  static create(value: string): ExternalReferenceNumberVO {
    return new ExternalReferenceNumberVO(value);
  }

  toString(): string {
    return this.value;
  }
}
