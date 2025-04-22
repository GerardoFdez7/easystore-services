export class FindClientByEmailQuery {
  constructor(public readonly email: string) {}
}

export class FindClientByBusinessNameQuery {
  constructor(public readonly businessName: string) {}
}
