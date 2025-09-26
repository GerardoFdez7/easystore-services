# Payment Gateway - Documentación Centralizada

## 📚 Índice de Documentación

Esta es la documentación centralizada del módulo Payment Gateway. Todos los documentos están organizados en el directorio `docs/payment-gateway/` para facilitar el rastreo y la indexación.

### Documentos Principales

| Documento                                                      | Descripción                         | Ubicación                                 |
| -------------------------------------------------------------- | ----------------------------------- | ----------------------------------------- |
| **[DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md)**     | Guía completa del desarrollador     | `docs/payment-gateway/DOCUMENTATION.md`   |
| **[ARCHITECTURE.md](./payment-gateway/ARCHITECTURE.md)**       | Arquitectura y principios de diseño | `docs/payment-gateway/ARCHITECTURE.md`    |
| **[DEVELOPER_GUIDE.md](./payment-gateway/DEVELOPER_GUIDE.md)** | Guía de implementación técnica      | `docs/payment-gateway/DEVELOPER_GUIDE.md` |

### Estructura de Documentación

```
docs/
└── payment-gateway/
    ├── DOCUMENTATION.md      # Guía completa (uso, configuración, ejemplos)
    ├── ARCHITECTURE.md       # Arquitectura y principios
    └── DEVELOPER_GUIDE.md    # Guía técnica de implementación
```

### Acceso Rápido

#### Para Desarrolladores

- **Configuración**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#configuración)
- **Ejemplos de Uso**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#uso-y-ejemplos)
- **API GraphQL**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#api-graphql)

#### Para Arquitectos

- **Principios de Diseño**: Ver [ARCHITECTURE.md](./payment-gateway/ARCHITECTURE.md)
- **Patrones Utilizados**: Ver [ARCHITECTURE.md](./payment-gateway/ARCHITECTURE.md)
- **Diagramas**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#arquitectura)

#### Para DevOps

- **Variables de Entorno**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#configuración)
- **Despliegue**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#despliegue)
- **Troubleshooting**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md#troubleshooting)

### Tecnologías y Dependencias

- **CyberSource/VisaNet**: `cybersource-rest-client@0.0.70`
- **Pagadito**: API REST personalizada
- **PayPal**: API REST (implementación básica)
- **GraphQL**: API moderna y type-safe
- **TypeScript**: Implementación completamente tipada

### Estado del Proyecto

- ✅ **VisaNet Provider**: Implementación completa
- ✅ **Pagadito Provider**: Implementación completa
- ✅ **GraphQL API**: Mutaciones disponibles
- ✅ **Documentación**: Centralizada y completa
- 🚧 **PayPal Provider**: Implementación básica
- 📋 **Webhooks**: En desarrollo
- 📋 **Analytics**: Planificado

### Contacto y Soporte

Para preguntas o problemas:

- **Documentación Completa**: Ver [DOCUMENTATION.md](./payment-gateway/DOCUMENTATION.md)
- **Issues**: Crear issue en GitHub con descripción detallada
- **Desarrollo**: Seguir guías en [DEVELOPER_GUIDE.md](./payment-gateway/DEVELOPER_GUIDE.md)

---

_Última actualización: $(date)_
_Versión: 1.0.0_
