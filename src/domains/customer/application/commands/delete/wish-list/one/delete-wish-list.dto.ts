import { Command } from '@nestjs/cqrs';

export class DeleteWishListDto extends Command<void> {
  constructor(
    public readonly customerId: string,
    public readonly variantId: string,
    public readonly tenantId: string,
  ) {
    super();
  }
}
