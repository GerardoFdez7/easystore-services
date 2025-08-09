export class UpdatePasswordDTO {
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {}
}
