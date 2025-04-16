import { RegisterClientInput } from '../../dto/register-client.input';

export class RegisterClientCommand {
  constructor(public readonly input: RegisterClientInput) {}
}
