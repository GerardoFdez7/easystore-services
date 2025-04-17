export class RegisterClientCommand {
  constructor(
    public readonly businessName: string,
    public readonly ownerName: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
