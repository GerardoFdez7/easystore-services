# Payment Credentials Management

Este documento describe cómo usar el sistema de gestión de credenciales de payment methods integrado en el módulo tenant.

## Características de Seguridad

- **Encriptación AES-256-GCM**: Las credenciales se almacenan usando encriptación de grado militar
- **Derivación de claves PBKDF2**: 100,000 iteraciones para máxima seguridad
- **Autenticación adicional**: Cada encriptación incluye datos de autenticación adicionales
- **Validación de integridad**: Verificación automática de la integridad de las credenciales

## Variables de Entorno Requeridas

```bash
# Clave de encriptación (32 bytes mínimo)
PAYMENT_CREDENTIALS_ENCRYPTION_KEY=your-super-secure-encryption-key-here

# Salt para derivación de claves (opcional, se genera automáticamente)
PAYMENT_CREDENTIALS_SALT=your-salt-here
```

## Mutaciones GraphQL

### 1. Crear Credenciales de Pagadito

```graphql
mutation CreatePagaditoCredentials {
  createPaymentCredentials(
    input: {
      tenantId: "tenant-123"
      providerType: "PAGADITO"
      pagaditoCredentials: {
        uid: "your-pagadito-uid"
        wsk: "your-pagadito-wsk"
        sandbox: true
      }
    }
  )
}
```

### 2. Crear Credenciales de VisaNet

```graphql
mutation CreateVisaNetCredentials {
  createPaymentCredentials(
    input: {
      tenantId: "tenant-123"
      providerType: "VISANET"
      visanetCredentials: {
        merchantId: "your-merchant-id"
        merchantKeyId: "your-key-id"
        merchantSecretKey: "your-secret-key"
        environment: "sandbox"
      }
    }
  )
}
```

### 3. Crear Credenciales de PayPal

```graphql
mutation CreatePayPalCredentials {
  createPaymentCredentials(
    input: {
      tenantId: "tenant-123"
      providerType: "PAYPAL"
      paypalCredentials: {
        clientId: "your-paypal-client-id"
        clientSecret: "your-paypal-client-secret"
      }
    }
  )
}
```

### 4. Actualizar Credenciales

```graphql
mutation UpdateCredentials {
  updatePaymentCredentials(
    input: {
      tenantId: "tenant-123"
      providerType: "PAGADITO"
      pagaditoCredentials: { uid: "new-uid", wsk: "new-wsk", sandbox: false }
    }
  )
}
```

### 5. Eliminar Credenciales

```graphql
mutation DeleteCredentials {
  deletePaymentCredentials(
    input: { tenantId: "tenant-123", providerType: "PAGADITO" }
  )
}
```

## Consultas GraphQL

### 1. Obtener Todas las Credenciales de un Tenant

```graphql
query GetTenantCredentials {
  getPaymentCredentials(tenantId: "tenant-123") {
    id
    tenantId
    providerType
    isActive
    createdAt
    updatedAt
  }
}
```

### 2. Obtener Credenciales de un Provider Específico

```graphql
query GetProviderCredentials {
  getPaymentCredentials(tenantId: "tenant-123", providerType: "PAGADITO") {
    id
    tenantId
    providerType
    isActive
    createdAt
    updatedAt
  }
}
```

## Reglas de Negocio

1. **Unicidad por Provider**: Un tenant solo puede tener un conjunto de credenciales por provider
2. **Validación de Credenciales**: Cada provider tiene validaciones específicas para sus credenciales
3. **Encriptación Automática**: Todas las credenciales se encriptan automáticamente antes de almacenarse
4. **Desencriptación Segura**: Las credenciales solo se desencriptan cuando se necesitan para procesar pagos

## Validaciones por Provider

### Pagadito

- `uid`: Requerido, string
- `wsk`: Requerido, string
- `sandbox`: Opcional, boolean (default: true)

### VisaNet

- `merchantId`: Requerido, string
- `merchantKeyId`: Requerido, string
- `merchantSecretKey`: Requerido, string
- `environment`: Requerido, "sandbox" | "production"

### PayPal

- `clientId`: Requerido, string
- `clientSecret`: Requerido, string

## Uso en Payment Gateway

Una vez configuradas las credenciales, el payment gateway las utilizará automáticamente:

```graphql
mutation ProcessPayment {
  initiatePayment(
    input: {
      tenantId: "tenant-123"
      providerType: "PAGADITO"
      amount: 100.50
      currency: "USD"
      orderId: "order-456"
    }
  ) {
    success
    transactionId
    checkoutUrl
    error
  }
}
```

## Consideraciones de Seguridad

1. **Nunca expongas las credenciales**: El sistema nunca devuelve las credenciales desencriptadas en las consultas
2. **Rotación de claves**: Cambia regularmente la clave de encriptación
3. **Monitoreo**: Implementa logging para detectar accesos no autorizados
4. **Backup seguro**: Asegúrate de tener backups seguros de las claves de encriptación

## Generación de Claves Seguras

```bash
# Generar clave de encriptación (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generar salt (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
