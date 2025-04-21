export class UpdateInventoryCommand {
  constructor(
    public readonly productId: string,
    public readonly warehouseId: number,
    public readonly quantity: number,
    public readonly reason: string,
    public readonly updatedById: number,
  ) {}
}
