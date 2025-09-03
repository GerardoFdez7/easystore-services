export class PaymentDetailsVO {
  constructor(
    public readonly quantity: number,
    public readonly description: string,
    public readonly price: number,
    public readonly urlProduct?: string,
  ) {}

  static create(params: {
    quantity: number;
    description: string;
    price: number;
    urlProduct?: string;
  }): PaymentDetailsVO {
    return new PaymentDetailsVO(
      params.quantity,
      params.description,
      params.price,
      params.urlProduct,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      quantity: this.quantity,
      description: this.description,
      price: this.price,
      ...(this.urlProduct && { url_product: this.urlProduct }),
    };
  }
}
