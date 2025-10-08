# Payment Gateway Testing Guide

## Overview

This guide provides comprehensive testing instructions for the Payment Gateway module, covering all aspects from configuration to payment processing, refunds, and monitoring.

## Prerequisites

### Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:run

# Start the development server
npm run start:dev
```

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payments

# Encryption
PAYMENT_CREDENTIALS_ENCRYPTION_KEY=your-32-character-encryption-key
PAYMENT_CREDENTIALS_SALT=your-16-character-salt

# JWT
JWT_SECRET=your-jwt-secret-key

# Provider URLs (optional, defaults provided)
PAGADITO_API_URL=https://sandbox.pagadito.com
VISANET_API_URL=https://apitest.cybersource.com
PAYPAL_API_URL=https://api.sandbox.paypal.com
```

## Test Scenarios

### 1. Provider Credential Configuration

#### 1.1 Configure Pagadito Credentials

```graphql
mutation SavePagaditoCredentials {
  saveOrUpdateProviderKeys(
    tenantId: "test-tenant-001"
    providerType: "PAGADITO"
    credentials: "{\"apiKey\":\"test-api-key\",\"secretKey\":\"test-secret-key\",\"environment\":\"sandbox\"}"
  )
}
```

**Expected Result**: Success response with encrypted credentials stored.

#### 1.2 Configure VisaNet Credentials

```graphql
mutation SaveVisaNetCredentials {
  saveOrUpdateProviderKeys(
    tenantId: "test-tenant-001"
    providerType: "VISANET"
    credentials: "{\"merchantId\":\"test-merchant-id\",\"merchantKeyId\":\"test-key-id\",\"merchantSecretKey\":\"test-secret-key\",\"environment\":\"sandbox\"}"
  )
}
```

**Expected Result**: Success response with encrypted credentials stored.

#### 1.3 Configure PayPal Credentials

```graphql
mutation SavePayPalCredentials {
  saveOrUpdateProviderKeys(
    tenantId: "test-tenant-001"
    providerType: "PAYPAL"
    credentials: "{\"clientId\":\"test-client-id\",\"clientSecret\":\"test-client-secret\",\"environment\":\"sandbox\"}"
  )
}
```

**Expected Result**: Success response with encrypted credentials stored.

#### 1.4 Verify Credential Retrieval

```graphql
query GetProviderCredentials {
  getProviderCredentials(
    tenantId: "test-tenant-001"
    providerType: "PAGADITO"
  ) {
    providerType
    isActive
    createdAt
    updatedAt
  }
}
```

**Expected Result**: Returns credential metadata (not the actual credentials for security).

### 2. Payment Processing Tests

#### 2.1 Pagadito Payment Processing

```graphql
mutation ProcessPagaditoPayment {
  initiatePayment(
    input: {
      tenantId: "test-tenant-001"
      providerType: "PAGADITO"
      amount: 100.50
      currency: "USD"
      orderId: "order-001"
      externalReferenceNumber: "ext-ref-001"
      details: {
        customerEmail: "test@example.com"
        customerName: "John Doe"
        description: "Test payment"
      }
      allowPendingPayments: false
    }
  ) {
    paymentId
    status
    transactionId
    error
  }
}
```

**Expected Result**:

- `paymentId`: Generated payment ID
- `status`: "COMPLETED" or "FAILED"
- `transactionId`: Provider transaction ID (if successful)
- `error`: Error message (if failed)

#### 2.2 VisaNet Payment Processing

```graphql
mutation ProcessVisaNetPayment {
  initiatePayment(
    input: {
      tenantId: "test-tenant-001"
      providerType: "VISANET"
      amount: 250.00
      currency: "USD"
      orderId: "order-002"
      details: {
        cardNumber: "4111111111111111"
        expirationDate: "12/2031"
        cvv: "123"
        firstName: "Jane"
        lastName: "Smith"
        email: "jane@example.com"
        capture: true
      }
    }
  ) {
    paymentId
    status
    transactionId
    error
  }
}
```

**Expected Result**:

- `paymentId`: Generated payment ID
- `status`: "COMPLETED" or "FAILED"
- `transactionId`: CyberSource transaction ID (if successful)
- `error`: Error message (if failed)

#### 2.3 PayPal Payment Processing

```graphql
mutation ProcessPayPalPayment {
  initiatePayment(
    input: {
      tenantId: "test-tenant-001"
      providerType: "PAYPAL"
      amount: 75.25
      currency: "USD"
      orderId: "order-003"
      details: {
        returnUrl: "https://example.com/success"
        cancelUrl: "https://example.com/cancel"
        description: "PayPal test payment"
      }
    }
  ) {
    paymentId
    status
    transactionId
    error
  }
}
```

**Expected Result**:

- `paymentId`: Generated payment ID
- `status`: "COMPLETED" or "FAILED"
- `transactionId`: PayPal transaction ID (if successful)
- `error`: Error message (if failed)

### 3. Payment Query Tests

#### 3.1 Get Single Payment

```graphql
query GetPayment {
  getPayment(paymentId: "pay_1234567890_abc123", tenantId: "test-tenant-001") {
    id
    tenantId
    providerType
    amount
    currency
    status
    orderId
    transactionId
    externalReferenceNumber
    metadata
    createdAt
    updatedAt
    completedAt
    failedAt
    refundedAt
    failureReason
  }
}
```

**Expected Result**: Complete payment details or null if not found.

#### 3.2 List Payments by Tenant

```graphql
query ListPayments {
  listPayments(tenantId: "test-tenant-001", filters: { page: 1, limit: 10 }) {
    payments {
      id
      amount
      currency
      status
      orderId
      transactionId
      createdAt
      completedAt
    }
    total
    page
    limit
    totalPages
  }
}
```

**Expected Result**: Paginated list of payments for the tenant.

#### 3.3 List Payments by Status

```graphql
query ListCompletedPayments {
  listPayments(
    tenantId: "test-tenant-001"
    filters: { status: "COMPLETED", page: 1, limit: 5 }
  ) {
    payments {
      id
      amount
      status
      orderId
      completedAt
    }
    total
  }
}
```

**Expected Result**: List of completed payments only.

#### 3.4 List Payments by Provider

```graphql
query ListPagaditoPayments {
  listPayments(
    tenantId: "test-tenant-001"
    filters: { providerType: "PAGADITO", page: 1, limit: 5 }
  ) {
    payments {
      id
      providerType
      amount
      status
      orderId
    }
    total
  }
}
```

**Expected Result**: List of Pagadito payments only.

### 4. Refund Tests

#### 4.1 Full Refund

```graphql
mutation FullRefund {
  refundPayment(
    input: {
      paymentId: "pay_1234567890_abc123"
      tenantId: "test-tenant-001"
      reason: "Customer requested refund"
    }
  ) {
    paymentId
    status
    refundAmount
    isPartialRefund
    error
  }
}
```

**Expected Result**:

- `paymentId`: Original payment ID
- `status`: "REFUNDED"
- `refundAmount`: Full payment amount
- `isPartialRefund`: false
- `error`: null (if successful)

#### 4.2 Partial Refund

```graphql
mutation PartialRefund {
  refundPayment(
    input: {
      paymentId: "pay_1234567890_abc123"
      tenantId: "test-tenant-001"
      amount: 50.00
      reason: "Partial refund for damaged item"
    }
  ) {
    paymentId
    status
    refundAmount
    isPartialRefund
    error
  }
}
```

**Expected Result**:

- `paymentId`: Original payment ID
- `status`: "PARTIALLY_REFUNDED"
- `refundAmount`: 50.00
- `isPartialRefund`: true
- `error`: null (if successful)

### 5. Error Handling Tests

#### 5.1 Invalid Payment Amount

```graphql
mutation InvalidAmount {
  initiatePayment(
    input: {
      tenantId: "test-tenant-001"
      providerType: "PAGADITO"
      amount: -10.00
      currency: "USD"
      orderId: "order-error-001"
    }
  ) {
    paymentId
    status
    error
  }
}
```

**Expected Result**:

- `status`: "FAILED"
- `error`: "Payment amount must be greater than 0"

#### 5.2 Invalid Currency

```graphql
mutation InvalidCurrency {
  initiatePayment(
    input: {
      tenantId: "test-tenant-001"
      providerType: "PAGADITO"
      amount: 100.00
      currency: "INVALID"
      orderId: "order-error-002"
    }
  ) {
    paymentId
    status
    error
  }
}
```

**Expected Result**:

- `status`: "FAILED"
- `error`: "Invalid currency: INVALID"

#### 5.3 Missing Provider Credentials

```graphql
mutation MissingCredentials {
  initiatePayment(
    input: {
      tenantId: "test-tenant-999"
      providerType: "PAGADITO"
      amount: 100.00
      currency: "USD"
      orderId: "order-error-003"
    }
  ) {
    paymentId
    status
    error
  }
}
```

**Expected Result**:

- `status`: "FAILED"
- `error`: "No credentials found for provider PAGADITO"

#### 5.4 Refund Non-Refundable Payment

```graphql
mutation RefundFailedPayment {
  refundPayment(
    input: { paymentId: "pay_failed_payment_id", tenantId: "test-tenant-001" }
  ) {
    paymentId
    status
    error
  }
}
```

**Expected Result**:

- `status`: "FAILED"
- `error`: "Payment cannot be refunded in status: FAILED"

### 6. Performance Tests

#### 6.1 Concurrent Payment Processing

```bash
# Run multiple payment requests simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:3000/graphql \
    -H "Content-Type: application/json" \
    -d '{
      "query": "mutation { initiatePayment(input: { tenantId: \"test-tenant-001\", providerType: \"PAGADITO\", amount: 100.00, currency: \"USD\", orderId: \"order-concurrent-'$i'\" }) { paymentId status error } }"
    }' &
done
wait
```

**Expected Result**: All payments should be processed successfully without conflicts.

#### 6.2 Large Payment Amounts

```graphql
mutation LargePayment {
  initiatePayment(
    input: {
      tenantId: "test-tenant-001"
      providerType: "PAGADITO"
      amount: 999999.99
      currency: "USD"
      orderId: "order-large-001"
    }
  ) {
    paymentId
    status
    error
  }
}
```

**Expected Result**: Should handle large amounts within business rules.

### 7. Security Tests

#### 7.1 Tenant Isolation

```graphql
query CrossTenantAccess {
  getPayment(
    paymentId: "pay_1234567890_abc123"
    tenantId: "different-tenant-001"
  ) {
    id
    amount
    status
  }
}
```

**Expected Result**: Should return null or error for cross-tenant access.

#### 7.2 Credential Encryption Verification

```graphql
query VerifyEncryption {
  getProviderCredentials(
    tenantId: "test-tenant-001"
    providerType: "PAGADITO"
  ) {
    providerType
    isActive
  }
}
```

**Expected Result**: Should not expose actual credential values.

### 8. Monitoring and Observability Tests

#### 8.1 Check Application Health

```bash
curl http://localhost:3000/health
```

**Expected Result**: Health status with database and provider connectivity.

#### 8.2 Verify Logging

```bash
# Check application logs for payment events
tail -f logs/application.log | grep "Payment"
```

**Expected Result**: Structured logs for payment lifecycle events.

### 9. Database Tests

#### 9.1 Verify Payment Persistence

```sql
-- Connect to PostgreSQL and verify payment records
SELECT
  id,
  tenant_id,
  provider_type,
  amount,
  status,
  created_at
FROM payments
WHERE tenant_id = 'test-tenant-001'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result**: Payment records with proper data types and constraints.

#### 9.2 Check Indexes

```sql
-- Verify database indexes are working
EXPLAIN ANALYZE
SELECT * FROM payments
WHERE tenant_id = 'test-tenant-001'
AND status = 'COMPLETED';
```

**Expected Result**: Query should use indexes for optimal performance.

## Test Data Cleanup

### Cleanup Test Payments

```graphql
mutation CleanupTestData {
  # Note: This would require implementing a cleanup mutation
  # For now, use direct database queries
}
```

### Database Cleanup

```sql
-- Clean up test data
DELETE FROM payments WHERE tenant_id LIKE 'test-tenant-%';
DELETE FROM payment_credentials WHERE tenant_id LIKE 'test-tenant-%';
```

## Automated Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov
```

### Integration Tests

```bash
# Run integration tests
npm run test:e2e
```

### Load Tests

```bash
# Run load tests
npm run test:load
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure database exists and migrations are applied

#### 2. Encryption Key Errors

- Verify `PAYMENT_CREDENTIALS_ENCRYPTION_KEY` is 32 characters
- Verify `PAYMENT_CREDENTIALS_SALT` is 16 characters
- Check key format (hex or base64)

#### 3. Provider API Errors

- Verify provider credentials are correct
- Check network connectivity
- Verify provider API endpoints are accessible
- Check rate limits

#### 4. GraphQL Errors

- Verify GraphQL schema is up to date
- Check input validation rules
- Verify required fields are provided

### Debug Mode

```bash
# Enable debug logging
DEBUG=payment-gateway:* npm run start:dev
```

### Log Analysis

```bash
# Analyze payment processing logs
grep "Payment" logs/application.log | jq '.'
```

## Performance Benchmarks

### Expected Performance Metrics

- **Payment Processing**: < 2 seconds average
- **Database Queries**: < 100ms average
- **Provider API Calls**: < 1 second average
- **Concurrent Payments**: 100+ per second
- **Memory Usage**: < 512MB under normal load

### Monitoring Commands

```bash
# Monitor application performance
npm run monitor

# Check database performance
npm run db:analyze

# Monitor provider API response times
npm run providers:monitor
```
