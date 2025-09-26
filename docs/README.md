# EasyStore Services - Documentación Centralizada

## 📚 Índice General de Documentación

Esta es la documentación centralizada de EasyStore Services. Todos los documentos están organizados por módulos para facilitar el rastreo y la indexación.

### Módulos Disponibles

| Módulo              | Descripción                             | Documentación                                    |
| ------------------- | --------------------------------------- | ------------------------------------------------ |
| **Payment Gateway** | Sistema de procesamiento de pagos       | [Ver Documentación](./payment-gateway/README.md) |
| **Authentication**  | Sistema de autenticación y autorización | _En desarrollo_                                  |
| **Product**         | Gestión de productos y catálogo         | _En desarrollo_                                  |
| **Inventory**       | Control de inventario                   | _En desarrollo_                                  |
| **Tenant**          | Gestión multi-tenant                    | _En desarrollo_                                  |

### Estructura de Documentación

```
docs/
├── README.md                    # Este archivo - Índice general
└── payment-gateway/
    ├── README.md               # Índice del módulo Payment Gateway
    ├── DOCUMENTATION.md        # Guía completa del desarrollador
    ├── ARCHITECTURE.md         # Arquitectura y principios
    └── DEVELOPER_GUIDE.md      # Guía técnica de implementación
```

### Acceso Rápido por Rol

#### 👨‍💻 Desarrolladores

- **Payment Gateway**: [Documentación Completa](./payment-gateway/DOCUMENTATION.md)
- **Configuración**: [Variables de Entorno](./payment-gateway/DOCUMENTATION.md#configuración)
- **Ejemplos**: [Casos de Uso](./payment-gateway/DOCUMENTATION.md#uso-y-ejemplos)
- **API**: [GraphQL Reference](./payment-gateway/DOCUMENTATION.md#api-graphql)

#### 🏗️ Arquitectos

- **Payment Gateway**: [Arquitectura](./payment-gateway/ARCHITECTURE.md)
- **Patrones**: [DDD y Clean Architecture](./payment-gateway/DOCUMENTATION.md#arquitectura)
- **Diagramas**: [Flujos de Trabajo](./payment-gateway/DOCUMENTATION.md#flujo-de-trabajo)

#### 🔧 DevOps

- **Despliegue**: [Guías de Despliegue](./payment-gateway/DOCUMENTATION.md#despliegue)
- **Configuración**: [Variables de Entorno](./payment-gateway/DOCUMENTATION.md#configuración)
- **Troubleshooting**: [Solución de Problemas](./payment-gateway/DOCUMENTATION.md#troubleshooting)

#### 🧪 QA/Testing

- **Testing**: [Escenarios de Prueba](./payment-gateway/DOCUMENTATION.md#testing)
- **Tarjetas de Prueba**: [Datos de Test](./payment-gateway/DOCUMENTATION.md#testing)

### Tecnologías Principales

- **Node.js 20+**: Runtime de JavaScript
- **NestJS**: Framework de Node.js
- **TypeScript 5+**: Lenguaje tipado
- **GraphQL**: API query language
- **PostgreSQL**: Base de datos
- **Prisma**: ORM
- **CyberSource**: Procesamiento de pagos VisaNet
- **Pagadito**: Procesamiento de pagos local

### Estado del Proyecto

#### ✅ Completado

- Payment Gateway con VisaNet y Pagadito
- API GraphQL completa
- Documentación centralizada
- Arquitectura DDD implementada

#### 🚧 En Desarrollo

- PayPal Provider
- Webhooks de pagos
- Sistema de analytics

#### 📋 Planificado

- Stripe Provider
- Sistema de notificaciones
- Dashboard de administración

### Contribución

Para contribuir al proyecto:

1. Revisar la documentación del módulo correspondiente
2. Seguir las guías de desarrollo establecidas
3. Actualizar la documentación según sea necesario
4. Crear pull request con descripción detallada

### Contacto

- **Issues**: Crear issue en GitHub
- **Documentación**: Revisar módulos específicos
- **Desarrollo**: Seguir guías técnicas

---

_Documentación centralizada de EasyStore Services_
_Última actualización: $(date)_
