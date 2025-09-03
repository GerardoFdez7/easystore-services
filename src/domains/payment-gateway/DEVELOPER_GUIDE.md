# Payment Gateway Developer Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- TypeScript 5+
- PostgreSQL database
- Redis (for caching)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd easystore-services

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and provider credentials

# Run database migrations
npm run migration:run

# Start the development server
npm run start:dev
```

### Basic Usage

#### 1. Configure Provider Credentials
```typescript
// Save Pagadito credentials
const credentials = {
  uid: 'your-pagadito-uid',
  wsk: 'your-pagadito-wsk',
  sandbox: true
};

await paymentGatewayService.saveOrUpdateProviderKeys(
  'tenant-123',
  'PAGADITO',
  credentials
);
```

#### 2. Initiate a Payment
```typescript
const paymentParams = {
  amount: 100.50,
  currency: 'USD',
  orderId: 'order-456',
  details: [{
    quantity: 1,
    description: 'Premium Product',
    price: 100.50,
    urlProduct: 'https://example.com/product'
  }],
  allowPendingPayments: true
};

const result = await paymentGatewayService.initiatePayment(
  'tenant-123',
  'PAGADITO',
  paymentParams
);

if (result.success) {
  console.log('Checkout URL:', result.checkoutUrl);
  console.log('Transaction ID:', result.transactionId);
}
```

#### 3. Complete a Payment
```typescript
const result = await paymentGatewayService.completePayment(
  'tenant-123',
  'PAGADITO',
  { paymentId: 'ERN-1234567890' }
);

if (result.success) {
  console.log('Payment completed successfully');
}
```

## Domain Structure

### Core Concepts

#### Value Objects
Value Objects are immutable objects that represent domain concepts:

```typescript
// PaymentDetailsVO - Represents payment item details
const paymentDetails = PaymentDetailsVO.create({
  quantity: 2,
  description: 'Premium Widget',
  price: 49.99,
  urlProduct: 'https://example.com/widget'
});

// PagaditoCredentialsVO - Secure credential management
const credentials = PagaditoCredentialsVO.create({
  uid: 'your-uid',
  wsk: 'your-wsk',
  sandbox: true
});

// ExternalReferenceNumberVO - Unique payment reference
const ern = ExternalReferenceNumberVO.generate(); // ERN-1234567890
```

#### Provider Integration
The system uses the Adapter pattern to integrate with different payment providers:

```typescript
interface PaymentProvider {
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult>;
  completePayment(params: CompletePaymentParams): Promise<PaymentResult>;
  refundPayment?(params: RefundPaymentParams): Promise<PaymentResult>;
}

// Pagadito implementation
class PagaditoProvider implements PaymentProvider {
  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    // 1. Connect to Pagadito API
    const token = await this.connect();
    
    // 2. Execute transaction
    const response = await this.executeTransaction(token, params);
    
    // 3. Return checkout URL
    return {
      success: true,
      transactionId: params.externalReferenceNumber,
      checkoutUrl: decodeURIComponent(response.value)
    };
  }
}
```

#### Domain Events
Events are used for decoupled communication between components:

```typescript
// Payment initiated event
class PaymentInitiatedEvent {
  constructor(
    public readonly aggregateId: PaymentId,
    public readonly data: {
      amount: number;
      currency: string;
      providerType: string;
      tenantId: string;
    }
  ) {}
}

// Event handler
@EventHandler(PaymentInitiatedEvent)
class PaymentInitiatedHandler {
  async handle(event: PaymentInitiatedEvent): Promise<void> {
    // Update read models
    await this.paymentProjection.update(event);
    
    // Send notification
    await this.notificationService.send(event);
    
    // Log analytics
    await this.analyticsService.track(event);
  }
}
```

## API Usage Examples

### GraphQL Mutations

#### Initiate Payment
```graphql
mutation InitiatePayment {
  initiatePayment(
    tenantId: "tenant-123"
    providerType: "PAGADITO"
    amount: 150.00
    currency: "USD"
    orderId: "order-789"
    details: "[{\"quantity\":1,\"description\":\"Premium Package\",\"price\":150.00}]"
    allowPendingPayments: true
    externalReferenceNumber: "ERN-1234567890"
  )
}
```

#### Complete Payment
```graphql
mutation CompletePayment {
  completePayment(
    tenantId: "tenant-123"
    providerType: "PAGADITO"
    paymentId: "ERN-1234567890"
  )
}
```

#### Save Provider Credentials
```graphql
mutation SaveCredentials {
  saveOrUpdateProviderKeys(
    tenantId: "tenant-123"
    providerType: "PAGADITO"
    credentials: "{\"uid\":\"your-uid\",\"wsk\":\"your-wsk\",\"sandbox\":true}"
  )
}
```

### REST API

#### Initiate Payment
```bash
curl -X POST http://localhost:3000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-123",
    "providerType": "PAGADITO",
    "amount": 100.50,
    "currency": "USD",
    "orderId": "order-456",
    "details": [{
      "quantity": 1,
      "description": "Product Name",
      "price": 100.50
    }]
  }'
```

## Development Workflow

### Adding a New Payment Provider

#### 1. Create Provider Implementation
```typescript
// src/domains/payment-gateway/infrastructure/providers/new-provider/new-provider.provider.ts
export class NewProviderProvider implements PaymentProvider {
  constructor(private credentials: NewProviderCredentials) {}

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    // Implement provider-specific logic
    const response = await this.callProviderAPI(params);
    
    return {
      success: true,
      transactionId: response.transactionId,
      checkoutUrl: response.checkoutUrl
    };
  }

  async completePayment(params: CompletePaymentParams): Promise<PaymentResult> {
    // Implement payment completion logic
  }
}
```

#### 2. Add Provider Type
```typescript
// src/domains/payment-gateway/aggregates/value-objects/provider/provider-type.vo.ts
export enum ProviderType {
  PAGADITO = 'PAGADITO',
  PAYPAL = 'PAYPAL',
  NEW_PROVIDER = 'NEW_PROVIDER' // Add new provider
}
```

#### 3. Update Factory
```typescript
// src/domains/payment-gateway/application/services/payment-provider-factory.service.ts
class PaymentProviderFactoryService {
  createProvider(type: ProviderType, credentials: ProviderCredentials): PaymentProvider {
    switch (type) {
      case ProviderType.PAGADITO:
        return new PagaditoProvider(credentials);
      case ProviderType.NEW_PROVIDER: // Add new case
        return new NewProviderProvider(credentials);
      default:
        throw new UnsupportedProviderError(type);
    }
  }
}
```

#### 4. Add Tests
```typescript
// src/domains/payment-gateway/infrastructure/providers/new-provider/new-provider.provider.spec.ts
describe('NewProviderProvider', () => {
  let provider: NewProviderProvider;

  beforeEach(() => {
    provider = new NewProviderProvider(mockCredentials);
  });

  it('should initiate payment successfully', async () => {
    const result = await provider.initiatePayment(mockParams);
    
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
    expect(result.checkoutUrl).toBeDefined();
  });
});
```

### Testing Strategy

#### Unit Tests
```typescript
// Test value objects
describe('PaymentDetailsVO', () => {
  it('should create valid payment details', () => {
    const details = PaymentDetailsVO.create({
      quantity: 2,
      description: 'Test Product',
      price: 25.00
    });

    expect(details.quantity).toBe(2);
    expect(details.description).toBe('Test Product');
    expect(details.price).toBe(25.00);
  });

  it('should validate positive quantities', () => {
    expect(() => PaymentDetailsVO.create({
      quantity: -1,
      description: 'Test',
      price: 25.00
    })).toThrow();
  });
});
```

#### Integration Tests
```typescript
// Test provider integration
describe('PagaditoProvider Integration', () => {
  it('should connect to Pagadito API', async () => {
    const provider = new PagaditoProvider(testCredentials);
    const result = await provider.initiatePayment(testParams);
    
    expect(result.success).toBe(true);
    expect(result.checkoutUrl).toContain('pagadito.com');
  });
});
```

#### End-to-End Tests
```typescript
// Test complete payment flow
describe('Payment Flow E2E', () => {
  it('should process payment end-to-end', async () => {
    // 1. Save credentials
    await saveCredentials(tenantId, 'PAGADITO', credentials);
    
    // 2. Initiate payment
    const initiateResult = await initiatePayment(tenantId, 'PAGADITO', params);
    expect(initiateResult.success).toBe(true);
    
    // 3. Complete payment
    const completeResult = await completePayment(tenantId, 'PAGADITO', {
      paymentId: initiateResult.transactionId
    });
    expect(completeResult.success).toBe(true);
  });
});
```

## Error Handling

### Error Types
```typescript
// Domain Errors
class PaymentFailedError extends DomainError {
  constructor(message: string, public readonly paymentId: string) {
    super(message);
  }
}

// Application Errors
class ProviderUnavailableError extends ApplicationError {
  constructor(public readonly providerType: string) {
    super(`Provider ${providerType} is currently unavailable`);
  }
}

// Infrastructure Errors
class ExternalAPIError extends InfrastructureError {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}
```

### Error Handling Patterns
```typescript
// Retry with exponential backoff
class RetryService {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await this.sleep(delay);
      }
    }
  }
}

// Circuit breaker pattern
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitBreakerOpenError();
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## Performance Considerations

### Caching Strategy
```typescript
// Redis caching for provider credentials
class CachedCredentialRepository implements PaymentProviderCredentialRepository {
  constructor(
    private redis: Redis,
    private fallbackRepo: PaymentProviderCredentialRepository
  ) {}

  async getCredentials(tenantId: string, providerType: string): Promise<ProviderCredentials> {
    const cacheKey = `credentials:${tenantId}:${providerType}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fallback to database
    const credentials = await this.fallbackRepo.getCredentials(tenantId, providerType);
    
    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, JSON.stringify(credentials));
    
    return credentials;
  }
}
```

### Connection Pooling
```typescript
// Database connection pooling
class DatabaseConnectionPool {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // Maximum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getConnection(): Promise<PoolClient> {
    return this.pool.connect();
  }
}
```

## Security Best Practices

### Input Validation
```typescript
// Comprehensive input validation
class PaymentValidationService {
  validatePaymentParams(params: InitiatePaymentParams): void {
    // Amount validation
    if (params.amount <= 0 || params.amount > MAX_PAYMENT_AMOUNT) {
      throw new InvalidAmountError(params.amount);
    }

    // Currency validation
    if (!SUPPORTED_CURRENCIES.includes(params.currency)) {
      throw new UnsupportedCurrencyError(params.currency);
    }

    // Order ID validation
    if (!this.isValidOrderId(params.orderId)) {
      throw new InvalidOrderIdError(params.orderId);
    }

    // Details validation
    if (params.details) {
      params.details.forEach(detail => {
        if (detail.quantity <= 0) {
          throw new InvalidQuantityError(detail.quantity);
        }
        if (detail.price <= 0) {
          throw new InvalidPriceError(detail.price);
        }
      });
    }
  }
}
```

### Credential Encryption
```typescript
// AES-256 encryption for sensitive data
class CredentialEncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  async encrypt(data: unknown): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  async decrypt(encryptedData: string): Promise<unknown> {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Provider Connection Failures
```typescript
// Debug provider connection
class ProviderDebugService {
  async debugConnection(providerType: string, credentials: ProviderCredentials): Promise<DebugResult> {
    try {
      const provider = this.factory.createProvider(providerType, credentials);
      const result = await provider.initiatePayment(testParams);
      
      return {
        success: true,
        responseTime: result.responseTime,
        providerVersion: result.providerVersion
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        suggestions: this.getSuggestions(error)
      };
    }
  }
}
```

#### 2. Payment Status Issues
```typescript
// Payment status checker
class PaymentStatusChecker {
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = await this.paymentRepository.findById(paymentId);
    
    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }
    
    // Check with provider
    const provider = await this.getProvider(payment.providerType);
    const status = await provider.completePayment({ paymentId });
    
    return {
      paymentId,
      status: status.success ? 'COMPLETED' : 'FAILED',
      lastChecked: new Date(),
      providerResponse: status.raw
    };
  }
}
```

### Debugging Tools

#### Logging
```typescript
// Structured logging
class PaymentLogger {
  private logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'payment-gateway.log' })
    ]
  });

  logPaymentInitiated(paymentId: string, params: InitiatePaymentParams): void {
    this.logger.info('Payment initiated', {
      paymentId,
      amount: params.amount,
      currency: params.currency,
      providerType: params.providerType,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### Metrics
```typescript
// Prometheus metrics
class PaymentMetrics {
  private paymentCounter = new Counter({
    name: 'payment_attempts_total',
    help: 'Total number of payment attempts',
    labelNames: ['provider', 'status']
  });

  private paymentDuration = new Histogram({
    name: 'payment_duration_seconds',
    help: 'Payment processing duration',
    labelNames: ['provider']
  });

  recordPaymentAttempt(provider: string, success: boolean): void {
    this.paymentCounter.inc({ provider, status: success ? 'success' : 'failure' });
  }

  recordPaymentDuration(provider: string, duration: number): void {
    this.paymentDuration.observe({ provider }, duration);
  }
}
```

## Contributing

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write comprehensive JSDoc comments
- Maintain 90%+ test coverage
- Follow conventional commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Run linting and tests
5. Submit PR with detailed description
6. Address review feedback
7. Merge after approval

### Development Environment Setup
```bash
# Install development dependencies
npm install --save-dev @types/jest @types/node

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Generate documentation
npm run docs:generate
```

---

*This developer guide provides comprehensive information for working with the Payment Gateway domain. For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
