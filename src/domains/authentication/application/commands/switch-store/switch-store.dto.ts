import { AuthenticatedContext } from '../../ports';

/** Trusted authentication context plus the only client-controlled switch input. */
export class SwitchStoreDTO {
  constructor(
    public readonly storeId: string,
    public readonly user: AuthenticatedContext,
  ) {}
}
