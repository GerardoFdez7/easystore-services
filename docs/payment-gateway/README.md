# Payment Gateway Module Documentation

## Overview

The Payment Gateway module is a comprehensive payment processing system designed to handle multiple payment service providers (PSPs) through a unified, domain-driven architecture. This module provides secure, scalable, and maintainable payment processing capabilities following enterprise-grade software engineering principles.

## Architecture

### Domain-Driven Design (DDD) Structure

```
src/domains/payment-gateway/
├── aggregates/
│   ├── entities/
│   │   └── payment/
│   │       ├── payment.entity.ts
│   │       └── payment.attributes.ts
│   ├── value-objects/
│   │   ├── payment/
│   │   │   ├── payment-id.vo.ts
│   │   │   ├── payment-amount.vo.ts
│   │   │   ├── payment-status.vo.ts
│   │   │   └── currency.vo.ts
│   │   └── provider/
│   │       ├── payment-provider-type.vo.ts
│   │       ├── pagadito-credentials.vo.ts
│   │       ├── visanet-credentials.vo.ts
│   │       └── paypal-credentials.vo.ts
│   ├── repositories/
│   │   └── payment.repository.interface.ts
│   └── events/
│       └── payment/
│           ├── payment-initiated.event.ts
│           ├── payment-completed.event.ts
│           ├── payment-failed.event.ts
│           └── payment-refunded.event.ts
├── application/
│   ├── commands/
│   │   ├── create/
│   │   │   ├── initiate-payment.dto.ts
│   │   │   └── initiate-payment.handler.ts
│   │   ├── complete/
│   │   │   ├── complete-payment.dto.ts
│   │   │   └── complete-payment.handler.ts
│   │   └── refund/
│   │       ├── refund-payment.dto.ts
│   │       └── refund-payment.handler.ts
│   ├── queries/
│   │   ├── get-payment/
│   │   │   ├── get-payment.dto.ts
│   │   │   └── get-payment.handler.ts
│   │   └── list-payments/
│   │       ├── list-payments.dto.ts
│   │       └── list-payments.handler.ts
│   ├── events/
│   │   ├── payment-initiated.handler.ts
│   │   ├── payment-completed.handler.ts
│   │   ├── payment-failed.handler.ts
│   │   └── payment-refunded.handler.ts
│   ├── mappers/
│   │   └── payment.mapper.ts
│   └── services/
│       ├── payment-gateway.service.ts
│       ├── payment-provider-factory.service.ts
│       └── pagadito.service.ts
├── infrastructure/
│   ├── persistence/
│   │   └── postgres/
│   │       └── payment.repository.ts
│   └── providers/
│       ├── pagadito/
│       │   └── pagadito.provider.ts
│       ├── visanet/
│       │   └── visanet.provider.ts
│       └── paypal/
│           └── paypal.provider.ts
└── presentation/
    └── graphql/
        ├── payment-gateway.resolver.ts
        └── types/
            └── payment.types.ts
```

### CQRS Implementation

The module follows Command Query Responsibility Segregation (CQRS) pattern:

- **Commands**: Handle write operations (initiate, complete, refund payments)
- **Queries**: Handle read operations (get payment, list payments)
- **Events**: Handle domain events (payment initiated, completed, failed, refunded)

### Key Components

#### Entities

- **PaymentEntity**: Core payment entity with business logic and state management

#### Value Objects

- **PaymentIdVO**: Unique payment identifier with validation
- **PaymentAmountVO**: Payment amount with business rules
- **PaymentStatusVO**: Payment status with state transition logic
- **CurrencyVO**: Currency with symbol and decimal place handling
- **PaymentProviderTypeVO**: Provider type enumeration

#### Repositories

- **PaymentRepository**: Interface for payment persistence
- **PaymentPostgresRepository**: PostgreSQL implementation

#### Events

- **PaymentInitiatedEvent**: Fired when payment is created
- **PaymentCompletedEvent**: Fired when payment succeeds
- **PaymentFailedEvent**: Fired when payment fails
- **PaymentRefundedEvent**: Fired when payment is refunded

## Supported Payment Providers

### 1. Pagadito

- **Type**: `PAGADITO`
- **Features**: Full payment processing, refunds
- **Credentials**: API key, secret key, environment

### 2. VisaNet (CyberSource)

- **Type**: `VISANET`
- **Features**: Credit card processing, captures, refunds
- **Credentials**: Merchant ID, key ID, secret key, environment

### 3. PayPal

- **Type**: `PAYPAL`
- **Features**: PayPal payments, refunds
- **Credentials**: Client ID, client secret, environment

## API Usage

### GraphQL Mutations

#### Initiate Payment

```graphql
mutation InitiatePayment($input: InitiatePaymentInput!) {
  initiatePayment(input: $input) {
    paymentId
    status
    transactionId
    error
  }
}
```

#### Refund Payment

```graphql
mutation RefundPayment($input: RefundPaymentInput!) {
  refundPayment(input: $input) {
    paymentId
    status
    refundAmount
    isPartialRefund
    error
  }
}
```

### GraphQL Queries

#### Get Payment

```graphql
query GetPayment($paymentId: String!, $tenantId: String!) {
  getPayment(paymentId: $paymentId, tenantId: $tenantId) {
    id
    amount
    currency
    status
    orderId
    transactionId
    createdAt
    completedAt
  }
}
```

#### List Payments

```graphql
query ListPayments($tenantId: String!, $filters: PaymentFilters) {
  listPayments(tenantId: $tenantId, filters: $filters) {
    payments {
      id
      amount
      currency
      status
      orderId
      createdAt
    }
    total
    page
    limit
    totalPages
  }
}
```

## Payment Flow

### 1. Payment Initiation

1. Create `PaymentEntity` with PENDING status
2. Save to repository
3. Start processing (status → PROCESSING)
4. Call provider API
5. Update status based on result:
   - SUCCESS → COMPLETED
   - FAILURE → FAILED
6. Publish domain events
7. Trigger event handlers

### 2. Payment Completion

1. Validate payment can be completed
2. Call provider completion API
3. Update payment status
4. Publish completion event
5. Trigger fulfillment processes

### 3. Payment Refund

1. Validate payment can be refunded
2. Call provider refund API
3. Update payment status (REFUNDED or PARTIALLY_REFUNDED)
4. Publish refund event
5. Trigger inventory adjustments

## Error Handling

### Payment Status Transitions

- **PENDING** → PROCESSING, CANCELLED
- **PROCESSING** → COMPLETED, FAILED, CANCELLED
- **COMPLETED** → REFUNDED, PARTIALLY_REFUNDED
- **FAILED** → (no transitions)
- **CANCELLED** → (no transitions)
- **REFUNDED** → (no transitions)
- **PARTIALLY_REFUNDED** → REFUNDED

### Error Types

- **Validation Errors**: Invalid input data
- **Business Rule Violations**: Invalid state transitions
- **Provider Errors**: External API failures
- **System Errors**: Infrastructure issues

## Security

### Credential Management

- Credentials stored encrypted using AES-256-GCM
- PBKDF2 key derivation for additional security
- Environment-based key management
- Tenant isolation for credentials

### Data Protection

- PCI DSS compliance considerations
- Sensitive data encryption at rest
- Secure transmission protocols
- Audit logging for all operations

## Performance Considerations

### Database Optimization

- Indexed queries on tenant_id, status, created_at
- Pagination for large result sets
- Connection pooling
- Query optimization

### Caching Strategy

- Provider credential caching
- Payment status caching
- Rate limiting per tenant

### Monitoring

- Payment success/failure rates
- Provider response times
- Error rate tracking
- Performance metrics

## Testing

### Unit Tests

- Entity business logic
- Value object validation
- Repository operations
- Command/Query handlers

### Integration Tests

- Provider API integration
- Database operations
- Event handling
- End-to-end payment flows

### Load Testing

- Concurrent payment processing
- Database performance under load
- Provider API rate limits
- Memory usage optimization

## Deployment

### Environment Variables

```bash
# Payment Gateway Configuration
PAYMENT_CREDENTIALS_ENCRYPTION_KEY=your-encryption-key
PAYMENT_CREDENTIALS_SALT=your-salt-value

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/payments

# Provider Configuration
PAGADITO_API_URL=https://api.pagadito.com
VISANET_API_URL=https://api.cybersource.com
PAYPAL_API_URL=https://api.paypal.com
```

### Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Monitoring and Observability

### Logging

- Structured logging with Winston
- Payment lifecycle events
- Error tracking and alerting
- Performance metrics

### Metrics

- Payment volume by provider
- Success/failure rates
- Average processing time
- Revenue tracking

### Health Checks

- Database connectivity
- Provider API availability
- Encryption service status
- Queue processing status

## Contributing

### Code Standards

- Follow Domain-Driven Design principles
- Maintain Clean Architecture layers
- Use TypeScript strict mode
- Write comprehensive tests
- Document all public APIs

### Development Workflow

1. Create feature branch from `main`
2. Implement changes following DDD patterns
3. Add tests for new functionality
4. Update documentation
5. Submit pull request with detailed description

## Support

For questions or issues:

- **Documentation**: See this comprehensive guide
- **Issues**: Create GitHub issue with detailed description
- **Architecture Questions**: Contact the development team

---

_This module follows enterprise-grade software engineering principles and is designed for high-scale, mission-critical payment processing._
