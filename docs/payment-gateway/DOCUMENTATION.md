# Payment Gateway - Documentación Completa

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Tecnologías](#tecnologías)
4. [Configuración](#configuración)
5. [Uso y Ejemplos](#uso-y-ejemplos)
6. [Flujo de Trabajo](#flujo-de-trabajo)
7. [API GraphQL](#api-graphql)
8. [Manejo de Errores](#manejo-de-errores)
9. [Testing](#testing)
10. [Despliegue](#despliegue)
11. [Troubleshooting](#troubleshooting)

---

## Descripción General

El Payment Gateway es un sistema integral de procesamiento de pagos diseñado para manejar múltiples proveedores de servicios de pago (PSP) a través de una arquitectura unificada basada en Domain-Driven Design. El sistema proporciona capacidades de procesamiento de pagos seguras, escalables y mantenibles siguiendo principios de ingeniería de software de nivel empresarial.

### Características Principales

- ✅ **Múltiples Proveedores**: Soporte para Pagadito, VisaNet/CyberSource y PayPal
- ✅ **Arquitectura Limpia**: Implementación basada en DDD y Clean Architecture
- ✅ **API GraphQL**: Interfaz moderna y type-safe
- ✅ **Manejo de Errores**: Gestión comprehensiva de errores y logging
- ✅ **TypeScript**: Implementación completamente tipada
- ✅ **Seguridad**: Autenticación HTTP Signature y manejo seguro de credenciales
- ✅ **Escalabilidad**: Diseño preparado para alto volumen de transacciones

---

## Arquitectura

### Principios Arquitectónicos

#### 1. Domain-Driven Design (DDD)

- **Bounded Context**: Payment Gateway como dominio distinto con límites claros
- **Aggregates**: Payment, Provider y Credential con límites de consistencia definidos
- **Value Objects**: Objetos inmutables representando conceptos del dominio
- **Domain Events**: Eventos para comunicación orientada a eventos

#### 2. Clean Architecture

- **Dependency Inversion**: Módulos de alto nivel no dependen de módulos de bajo nivel
- **Single Responsibility**: Cada clase tiene una razón para cambiar
- **Open/Closed Principle**: Abierto para extensión, cerrado para modificación
- **Interface Segregation**: Los clientes dependen solo de las interfaces que usan

#### 3. Event Sourcing & CQRS

- **Event Store**: Todos los cambios de estado capturados como eventos
- **Command/Query Separation**: Operaciones de escritura separadas de lectura
- **Projections**: Múltiples modelos de lectura para diferentes casos de uso

### Estructura del Dominio

```
src/domains/payment-gateway/
├── aggregates/
│   ├── entities/           # Entidades del dominio
│   ├── events/            # Eventos de dominio
│   ├── repositories/       # Interfaces de repositorio
│   └── value-objects/     # Objetos de valor
├── application/
│   ├── commands/          # Handlers de comandos
│   ├── queries/           # Handlers de consultas
│   ├── services/          # Servicios de aplicación
│   └── mappers/           # Mappers entre capas
├── infrastructure/
│   ├── persistence/       # Implementaciones de repositorio
│   └── providers/         # Implementaciones de proveedores
└── presentation/
    └── graphql/           # Resolvers y tipos GraphQL
```

### Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "Presentation Layer"
        GQL[GraphQL Resolver]
        TYPES[GraphQL Types]
    end

    subgraph "Application Layer"
        SERVICE[Payment Gateway Service]
        FACTORY[Provider Factory]
        HANDLERS[Command Handlers]
    end

    subgraph "Domain Layer"
        ENTITIES[Payment Entities]
        VO[Value Objects]
        EVENTS[Domain Events]
        REPO_INT[Repository Interfaces]
    end

    subgraph "Infrastructure Layer"
        REPO_IMPL[PostgreSQL Repository]
        PAGADITO[Pagadito Provider]
        VISANET[VisaNet Provider]
        PAYPAL[PayPal Provider]
    end

    subgraph "External Services"
        CS[CyberSource API]
        PG[Pagadito API]
        PP[PayPal API]
    end

    GQL --> SERVICE
    SERVICE --> FACTORY
    FACTORY --> PAGADITO
    FACTORY --> VISANET
    FACTORY --> PAYPAL
    VISANET --> CS
    PAGADITO --> PG
    PAYPAL --> PP
    SERVICE --> REPO_INT
    REPO_INT --> REPO_IMPL
```

---

## Tecnologías

### Stack Principal

- **Node.js 20+**: Runtime de JavaScript
- **NestJS**: Framework de Node.js para aplicaciones escalables
- **TypeScript 5+**: Lenguaje de programación tipado
- **GraphQL**: API query language
- **PostgreSQL**: Base de datos relacional
- **Prisma**: ORM para TypeScript

### Proveedores de Pago

- **CyberSource/VisaNet**: `cybersource-rest-client@0.0.70`
- **Pagadito**: API REST personalizada
- **PayPal**: API REST (implementación básica)

### Herramientas de Desarrollo

- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Jest**: Framework de testing
- **Husky**: Git hooks
- **Winston**: Logging

---

## Configuración

### Variables de Entorno Requeridas

```bash
# ===========================================
# CONFIGURACIÓN DE APLICACIÓN
# ===========================================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# ===========================================
# BASE DE DATOS
# ===========================================
DATABASE_URL=postgresql://username:password@localhost:5432/easystore_db

# ===========================================
# JWT (REQUERIDO)
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# ===========================================
# VISA/CYBERSOURCE
# ===========================================
CS_ENV=sandbox                    # sandbox o prod
CS_MERCHANT_ID=your_merchant_id
CS_MERCHANT_KEY_ID=your_key_id
CS_MERCHANT_SECRET=your_secret_key_base64

# ===========================================
# PAGADITO
# ===========================================
PAGADITO_UID=your_pagadito_uid
PAGADITO_WSK=your_pagadito_wsk
PAGADITO_SANDBOX=true

# ===========================================
# PAYPAL
# ===========================================
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox        # sandbox o live

# ===========================================
# EMAIL
# ===========================================
EMAIL_FROM=noreply@easystore.com
EMAIL_SERVICE_API_KEY=your_email_api_key

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug
LOG_DIRECTORY=logs
```

### Configuración de CyberSource/VisaNet

#### Credenciales Sandbox

```bash
CS_ENV=sandbox
CS_MERCHANT_ID=uvg_easy_store_1758917707
CS_MERCHANT_KEY_ID=7ddbd204-48b7-4b8c-9751-0e428533a46c
CS_MERCHANT_SECRET=l6zSxUXsuJzM6yDS6bJ26AsQ+P5cOs9onEbl15TcVZ8=
```

#### Credenciales Producción

```bash
CS_ENV=prod
CS_MERCHANT_ID=your_production_merchant_id
CS_MERCHANT_KEY_ID=your_production_key_id
CS_MERCHANT_SECRET=your_production_secret_key_base64
```

### Configuración de Pagadito

```bash
PAGADITO_UID=your_pagadito_uid
PAGADITO_WSK=your_pagadito_wsk
PAGADITO_SANDBOX=true  # false para producción
```

---

## Uso y Ejemplos

### 1. Configurar Credenciales de Proveedor

```graphql
mutation SaveVisaNetCredentials {
  saveOrUpdateProviderKeys(
    tenantId: "tenant-123"
    providerType: "VISANET"
    credentials: "{\"merchantId\":\"uvg_easy_store_1758917707\",\"merchantKeyId\":\"7ddbd204-48b7-4b8c-9751-0e428533a46c\",\"merchantSecretKey\":\"l6zSxUXsuJzM6yDS6bJ26AsQ+P5cOs9onEbl15TcVZ8=\",\"environment\":\"sandbox\"}"
  )
}
```

```graphql
mutation SavePagaditoCredentials {
  saveOrUpdateProviderKeys(
    tenantId: "tenant-123"
    providerType: "PAGADITO"
    credentials: "{\"uid\":\"your-uid\",\"wsk\":\"your-wsk\",\"sandbox\":true}"
  )
}
```

### 2. Procesar Pago con VisaNet

#### Venta Completa (Autorización + Captura)

```graphql
mutation ProcessVisaNetSale {
  initiatePayment(
    input: {
      tenantId: "tenant-123"
      providerType: "VISANET"
      amount: 100.50
      currency: "USD"
      orderId: "ORDER-001"
      externalReferenceNumber: "REF-123456"
      visanetCard: {
        cardNumber: "4111111111111111"
        expirationDate: "12/2031"
        cvv: "123"
        capture: true
        firstName: "John"
        lastName: "Doe"
        email: "john.doe@example.com"
        address: "123 Main Street"
        city: "San Francisco"
        state: "CA"
        postalCode: "94105"
        country: "US"
        phoneNumber: "4155551234"
      }
    }
  ) {
    success
    transactionId
    correlationId
    status
    environment
    error
  }
}
```

#### Solo Autorización

```graphql
mutation ProcessVisaNetAuth {
  initiatePayment(
    input: {
      tenantId: "tenant-123"
      providerType: "VISANET"
      amount: 100.50
      currency: "USD"
      orderId: "ORDER-002"
      visanetCard: {
        cardNumber: "4111111111111111"
        expirationDate: "12/2031"
        cvv: "123"
        capture: false
        firstName: "Jane"
        lastName: "Smith"
        email: "jane.smith@example.com"
      }
    }
  ) {
    success
    transactionId
    correlationId
    status
    environment
    error
  }
}
```

### 3. Capturar Autorización

```graphql
mutation CaptureVisaNetPayment {
  completePayment(
    tenantId: "tenant-123"
    providerType: "VISANET"
    paymentId: "payment-id-from-authorization"
  ) {
    success
    transactionId
    correlationId
    status
    environment
    error
  }
}
```

### 4. Procesar Reembolso

```graphql
mutation RefundVisaNetPayment {
  refundPayment(
    tenantId: "tenant-123"
    providerType: "VISANET"
    paymentId: "payment-id-to-refund"
    amount: 50.25
  ) {
    success
    transactionId
    correlationId
    status
    environment
    error
  }
}
```

### 5. Procesar Pago con Pagadito

```graphql
mutation ProcessPagaditoPayment {
  initiatePayment(
    input: {
      tenantId: "tenant-123"
      providerType: "PAGADITO"
      amount: 100.50
      currency: "USD"
      orderId: "ORDER-003"
      details: [{ quantity: 1, description: "Product Name", price: 100.50 }]
      allowPendingPayments: true
    }
  ) {
    success
    transactionId
    checkoutUrl
    error
  }
}
```

---

## Flujo de Trabajo

### Flujo de Pago Completo

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as GraphQL API
    participant Service as Payment Service
    participant Factory as Provider Factory
    participant Provider as Payment Provider
    participant External as External API

    Client->>API: initiatePayment(input)
    API->>Service: initiatePayment(tenantId, providerType, params)
    Service->>Factory: getProvider(tenantId, providerType)
    Factory->>Provider: new Provider(credentials)
    Service->>Provider: initiatePayment(params)
    Provider->>External: API Call
    External-->>Provider: Response
    Provider-->>Service: PaymentResult
    Service-->>API: PaymentResult
    API-->>Client: PaymentResultOutput
```

### Estados de Pago

1. **INITIATED**: Pago iniciado
2. **AUTHORIZED**: Pago autorizado (solo auth)
3. **CAPTURED**: Pago capturado (sale completo)
4. **COMPLETED**: Pago completado
5. **FAILED**: Pago fallido
6. **REFUNDED**: Pago reembolsado

### Flujo de Autorización + Captura

```mermaid
graph LR
    A[Iniciar Pago] --> B{Autorización}
    B -->|Exitosa| C[Capturar]
    B -->|Fallida| D[Pago Fallido]
    C -->|Exitosa| E[Pago Completado]
    C -->|Fallida| F[Reversar Autorización]
```

---

## API GraphQL

### Tipos de Entrada

#### VisanetCardInput

```graphql
input VisanetCardInput {
  cardNumber: String!
  expirationDate: String! # Formato: MM/YYYY
  cvv: String!
  capture: Boolean # true para venta, false para auth
  firstName: String
  lastName: String
  email: String
  address: String
  city: String
  state: String
  postalCode: String
  country: String
  phoneNumber: String
}
```

#### InitiatePaymentInput

```graphql
input InitiatePaymentInput {
  tenantId: String!
  providerType: String!
  amount: Float!
  currency: String!
  orderId: String!
  details: [PaymentDetailInput!]
  customParams: String
  allowPendingPayments: Boolean
  externalReferenceNumber: String
  visanetCard: VisanetCardInput
}
```

### Tipos de Salida

#### PaymentResultOutput

```graphql
type PaymentResultOutput {
  success: Boolean!
  transactionId: String
  checkoutUrl: String
  error: String
  correlationId: String
  status: String
  environment: String
}
```

### Mutaciones Disponibles

#### initiatePayment

```graphql
mutation InitiatePayment($input: InitiatePaymentInput!) {
  initiatePayment(input: $input) {
    success
    transactionId
    checkoutUrl
    error
    correlationId
    status
    environment
  }
}
```

#### completePayment

```graphql
mutation CompletePayment(
  $tenantId: String!
  $providerType: String!
  $paymentId: String!
) {
  completePayment(
    tenantId: $tenantId
    providerType: $providerType
    paymentId: $paymentId
  ) {
    success
    transactionId
    error
    correlationId
    status
    environment
  }
}
```

#### refundPayment

```graphql
mutation RefundPayment(
  $tenantId: String!
  $providerType: String!
  $paymentId: String!
  $amount: Float
) {
  refundPayment(
    tenantId: $tenantId
    providerType: $providerType
    paymentId: $paymentId
    amount: $amount
  ) {
    success
    transactionId
    error
    correlationId
    status
    environment
  }
}
```

#### saveOrUpdateProviderKeys

```graphql
mutation SaveProviderKeys(
  $tenantId: String!
  $providerType: String!
  $credentials: String!
) {
  saveOrUpdateProviderKeys(
    tenantId: $tenantId
    providerType: $providerType
    credentials: $credentials
  )
}
```

---

## Manejo de Errores

### Tipos de Errores

#### Errores de Validación

```json
{
  "success": false,
  "error": "Missing required card information (cardNumber, expirationDate, cvv)"
}
```

#### Errores de API Externa

```json
{
  "success": false,
  "error": "Invalid card number",
  "correlationId": "abc123def456",
  "environment": "apitest.cybersource.com"
}
```

#### Errores de Configuración

```json
{
  "success": false,
  "error": "Missing required VisaNet credentials"
}
```

### Códigos de Estado Comunes

| Código | Descripción            | Acción Recomendada             |
| ------ | ---------------------- | ------------------------------ |
| 200    | Pago exitoso           | Continuar con el flujo         |
| 400    | Error de validación    | Revisar datos de entrada       |
| 401    | Credenciales inválidas | Verificar configuración        |
| 402    | Pago rechazado         | Informar al usuario            |
| 500    | Error interno          | Reintentar o contactar soporte |

### Logging y Monitoreo

El sistema genera logs detallados en:

- **Archivo**: `logs/cybs.log` (CyberSource)
- **Nivel**: Debug, Info, Warn, Error
- **Información**: Correlation ID, timestamps, request/response data

---

## Testing

### Tarjetas de Prueba (Sandbox)

#### Visa

- **Número**: `4111111111111111`
- **CVV**: `123`
- **Expiración**: `12/2031`

#### Mastercard

- **Número**: `5555555555554444`
- **CVV**: `123`
- **Expiración**: `12/2031`

#### American Express

- **Número**: `378282246310005`
- **CVV**: `1234`
- **Expiración**: `12/2031`

### Escenarios de Prueba

#### Pago Exitoso

```graphql
mutation TestSuccessfulPayment {
  initiatePayment(
    input: {
      tenantId: "test-tenant"
      providerType: "VISANET"
      amount: 10.00
      currency: "USD"
      orderId: "TEST-001"
      visanetCard: {
        cardNumber: "4111111111111111"
        expirationDate: "12/2031"
        cvv: "123"
        capture: true
        firstName: "Test"
        lastName: "User"
        email: "test@example.com"
      }
    }
  ) {
    success
    transactionId
    status
  }
}
```

#### Pago Rechazado

```graphql
mutation TestDeclinedPayment {
  initiatePayment(
    input: {
      tenantId: "test-tenant"
      providerType: "VISANET"
      amount: 10.00
      currency: "USD"
      orderId: "TEST-002"
      visanetCard: {
        cardNumber: "4000000000000002" # Tarjeta de prueba rechazada
        expirationDate: "12/2031"
        cvv: "123"
        capture: true
      }
    }
  ) {
    success
    error
  }
}
```

### Testing Automatizado

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch
```

---

## Despliegue

### Requisitos del Sistema

- **Node.js**: 20.0.0+
- **npm**: 10.0.0+
- **PostgreSQL**: 13+
- **Redis**: 6+ (opcional)
- **Memoria**: Mínimo 2GB RAM
- **Disco**: Mínimo 10GB espacio libre

### Variables de Entorno de Producción

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-db:5432/easystore_prod
JWT_SECRET=your-production-jwt-secret

# CyberSource Producción
CS_ENV=prod
CS_MERCHANT_ID=your_production_merchant_id
CS_MERCHANT_KEY_ID=your_production_key_id
CS_MERCHANT_SECRET=your_production_secret_key_base64

# Pagadito Producción
PAGADITO_UID=your_production_uid
PAGADITO_WSK=your_production_wsk
PAGADITO_SANDBOX=false
```

### Docker

```bash
# Construir imagen
docker build -f Dockerfile.prod -t easystore-services .

# Ejecutar contenedor
docker run -d \
  --name easystore-services \
  -p 3000:3000 \
  --env-file .env.production \
  easystore-services
```

### Docker Compose

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Problemas Comunes

#### 1. Error de Credenciales

```
Error: Missing required VisaNet credentials
```

**Solución**: Verificar que las variables de entorno `CS_MERCHANT_ID`, `CS_MERCHANT_KEY_ID` y `CS_MERCHANT_SECRET` estén configuradas correctamente.

#### 2. Error de Conexión a CyberSource

```
Error: Payment API error: ECONNREFUSED
```

**Solución**: Verificar conectividad de red y configuración de firewall.

#### 3. Error de Validación de Tarjeta

```
Error: Invalid card number
```

**Solución**: Verificar formato de número de tarjeta y usar tarjetas de prueba válidas en sandbox.

#### 4. Error de JWT

```
Error: JWT_SECRET environment variable is required
```

**Solución**: Configurar la variable de entorno `JWT_SECRET`.

### Logs y Debugging

#### Habilitar Logs Detallados

```bash
LOG_LEVEL=debug
CS_LOG_ENABLED=true
```

#### Verificar Logs de CyberSource

```bash
tail -f logs/cybs.log
```

#### Verificar Estado del Servicio

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}'
```

### Monitoreo

#### Métricas Importantes

- Tiempo de respuesta de pagos
- Tasa de éxito de transacciones
- Errores por proveedor
- Uso de memoria y CPU

#### Alertas Recomendadas

- Tasa de error > 5%
- Tiempo de respuesta > 5 segundos
- Fallos de conexión a APIs externas
- Errores de autenticación

---

## Soporte y Contribución

### Documentación Adicional

- [CyberSource Developer Portal](https://developer.cybersource.com/)
- [Pagadito API Documentation](https://pagadito.com/)
- [PayPal Developer Documentation](https://developer.paypal.com/)

### Contacto

Para soporte técnico o preguntas sobre la implementación, contactar al equipo de desarrollo.

### Contribución

Para contribuir al proyecto, seguir las guías establecidas en `CONTRIBUTING.md`.

---

_Esta documentación está actualizada y cubre todos los aspectos del Payment Gateway. Para actualizaciones o mejoras, contactar al equipo de desarrollo._
