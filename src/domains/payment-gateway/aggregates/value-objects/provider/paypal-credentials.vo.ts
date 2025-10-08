export interface PaypalCredentialsProps {
  clientId: string;
  clientSecret: string;
  environment?: 'sandbox' | 'production';
}

export class PaypalCredentialsVO {
  constructor(
    public readonly clientId: string,
    public readonly clientSecret: string,
    public readonly environment: 'sandbox' | 'production' = 'sandbox',
  ) {}

  get isProduction(): boolean {
    return this.environment === 'production';
  }

  get baseUrl(): string {
    return this.isProduction
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  static create(props: PaypalCredentialsProps): PaypalCredentialsVO {
    if (!props.clientId || !props.clientSecret) {
      throw new Error('Missing required PayPal credentials');
    }

    return new PaypalCredentialsVO(
      props.clientId,
      props.clientSecret,
      props.environment || 'sandbox',
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      environment: this.environment,
    };
  }
}
