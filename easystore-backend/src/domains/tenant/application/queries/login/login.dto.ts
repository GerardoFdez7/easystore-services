export class TenantLoginDTO {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
  ) {}
}
