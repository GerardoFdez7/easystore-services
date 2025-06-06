---
name: Pull Request de Back-End
about: Proponer cambios para la base de código del Back-End.
title: "[FEAT/FIX/CHORE]: Breve descripción del cambio"
labels: 'feature'
assignees: 'lfmendoza'

---

## ✨ Descripción

Por favor, describe clara y concisamente los cambios introducidos en este Pull Request. Explica el "porqué" detrás de los cambios.

* **Problema Resuelto / Característica Implementada:**
    * [Ej: Soluciona #123 (Enlace a la incidencia)]
    * [Ej: Implementa la creación de pedidos con lógica de stock.]

* **Impacto:**
    * Describe cualquier impacto potencial en la funcionalidad existente, rendimiento, seguridad o integridad de datos.
    * [Ej: nuevo`mutation { createOrder(items: [...], userId: "...") }` creado. Posible impacto en la base de datos si no se manejan las transacciones correctamente.]

## 🚀 Cambios

Enumera los cambios clave realizados en este PR. Usa viñetas para facilitar la lectura.

* [Ej: Creación del Dominio de `Orders` con su estructura DDD (Domain, Application, Infrastructure, Presentation).]
* [Ej: Implementación de `CreateOrderCommand` y `CreateOrderCommandHandler` siguiendo CQRS.]
* [Ej: Desarrollo del `OrderRepository` para la persistencia de datos.]
* [Ej: Creación del `OrderFactory` para la construcción de la entidad `Order`.]

## 🧪 Pruebas

Describe las pruebas que has realizado para asegurar la calidad y corrección de tus cambios.

* **Pruebas de Integración (Postman/Playground/Automáticas):**
    * Proporciona pasos claros para probar la funcionalidad manualmente a través de la API.
    * [Ej: `mutation { createOrder(items: [...], userId: "...") }`. Verificar respuesta correcta.]
    * [Ej: Probar escenarios de error: stock insuficiente, usuario no válido.]

* **Pruebas Automatizadas:**
    * [ ] Pruebas unitarias (Jest) añadidas/actualizadas para servicios, `CommandHandlers`, `QueryHandlers` y lógica de dominio.
    * [ ] Pruebas de integración (NestJS testing utilities) añadidas/actualizadas para controladores y flujos de módulos.
    * [ ] Pruebas E2E (End-to-End) añadidas/actualizadas.
    * Detalles sobre pruebas específicas ejecutadas:
        * [Ej: `npm run test:unit src/domain/order/`]
        * [Ej: `npm run test:integration src/application/commands/create-order.handler.spec.ts`]

## ✅ Checklist

Antes de enviar este Pull Request, por favor asegúrate de lo siguiente:

* [ ] He leído la guía [CONTRIBUTING.md](CONTRIBUTING.md).
* [ ] He realizado una auto-revisión de mi propio código.
* [ ] He comentado mi código, particularmente en áreas difíciles de entender.
* [ ] Mis cambios no generan nuevas advertencias.
* [ ] Todas las pruebas unitarias/de integración existentes y nuevas pasan localmente con mis cambios.
* [ ] Se ha respetado la **Arquitectura DDD** (Domain, Application, Infrastructure, Presentation) en la implementación.
* [ ] Los patrones **CQRS, Factory y Repository** han sido aplicados correctamente.
* [ ] Las transacciones y el manejo de errores han sido considerados y probados.
* [ ] Se han considerado las implicaciones de seguridad y rendimiento.

## 🤝 Incidencias / PRs Relacionados

Enlaza cualquier incidencia o Pull Request relevante.

* [Ej: Cierra #456]
* [Ej: Relacionado con #789]

## 🚨 Cambios Rompedores (si aplica)

Si este PR introduce algún cambio que rompa la compatibilidad (breaking change) con APIs existentes o estructuras de datos, descríbelo aquí.

* [Ej: El `query { userLogin()}` ahora requiere autenticación. Los clientes existentes deberán actualizar su lógica de llamada.]
* [Ej: Se ha eliminado el campo `old_field` de la entidad `Product`. Los consumidores deben migrar a `new_field`.]
