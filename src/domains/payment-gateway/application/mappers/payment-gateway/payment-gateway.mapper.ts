export class PaymentGatewayMapper {
  static toDto(_entity: unknown): Record<string, unknown> {
    // This mapper is not needed for the current implementation
    // as we're using GraphQL directly without DTOs
    return {};
  }
}
