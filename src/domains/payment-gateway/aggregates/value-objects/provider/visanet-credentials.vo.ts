export interface VisanetCredentialsProps {
  merchantId: string;
  merchantKeyId: string;
  merchantSecretKey: string;
  environment: 'sandbox' | 'production';
}

export class VisanetCredentialsVO {
  constructor(
    public readonly merchantId: string,
    public readonly merchantKeyId: string,
    public readonly merchantSecretKey: string,
    public readonly environment: 'sandbox' | 'production',
  ) {}

  get isProduction(): boolean {
    return this.environment === 'production';
  }

  get runEnvironment(): string {
    return this.isProduction
      ? 'api.cybersource.com'
      : 'apitest.cybersource.com';
  }

  static create(props: VisanetCredentialsProps): VisanetCredentialsVO {
    if (!props.merchantId || !props.merchantKeyId || !props.merchantSecretKey) {
      throw new Error('Missing required VisaNet credentials');
    }

    if (!['sandbox', 'production'].includes(props.environment)) {
      throw new Error('Environment must be either "sandbox" or "production"');
    }

    return new VisanetCredentialsVO(
      props.merchantId,
      props.merchantKeyId,
      props.merchantSecretKey,
      props.environment,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      merchantId: this.merchantId,
      merchantKeyId: this.merchantKeyId,
      merchantSecretKey: this.merchantSecretKey,
      environment: this.environment,
    };
  }
}
