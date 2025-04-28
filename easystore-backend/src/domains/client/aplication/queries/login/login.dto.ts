export class LoginClientDTO {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
  ) {}
}
