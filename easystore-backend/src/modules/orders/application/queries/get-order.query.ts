export class GetOrderQuery {
  constructor(
    public readonly orderNumber: string,
    public readonly userId: number,
  ) {}
}
