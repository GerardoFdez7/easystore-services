/**
 * Aggregate invariant broken by a user action (e.g. duplicate cart item, limit exceeded).
 * Its message is safe to show to API clients: the GraphQL error formatter exposes it
 * as BAD_USER_INPUT instead of masking it as an internal error.
 */
export class BusinessRuleViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleViolationError';
    Object.setPrototypeOf(this, BusinessRuleViolationError.prototype);
  }
}
