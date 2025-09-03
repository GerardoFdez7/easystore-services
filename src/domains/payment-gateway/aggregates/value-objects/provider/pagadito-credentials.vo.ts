export class PagaditoCredentialsVO {
  constructor(
    public readonly uid: string,
    public readonly wsk: string,
    public readonly sandbox: boolean = true,
  ) {}

  static create(params: {
    uid: string;
    wsk: string;
    sandbox?: boolean;
  }): PagaditoCredentialsVO {
    return new PagaditoCredentialsVO(
      params.uid,
      params.wsk,
      params.sandbox ?? true,
    );
  }

  getEndpoint(): string {
    return this.sandbox
      ? 'https://sandbox.pagadito.com/comercios/apipg/charges.php'
      : 'https://comercios.pagadito.com/apipg/charges.php';
  }

  toJSON(): Record<string, unknown> {
    return {
      uid: this.uid,
      wsk: this.wsk,
      sandbox: this.sandbox,
    };
  }
}
