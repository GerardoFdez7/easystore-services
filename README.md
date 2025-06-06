<p align="center">
<a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="40" height="40"/>
  </a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="40" alt="Nest Logo" /></a>
  <a href="https://graphql.org/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/graphql/graphql-icon.svg" alt="graphql" width="40" height="40"/>
  </a>      
  <a href="https://kafka.apache.org/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/apache_kafka/apache_kafka-icon.svg" alt="kafka" width="60" height="40"/>
  </a>
  <a href="https://www.elastic.co/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/elastic/elastic-icon.svg" alt="elasticsearch" width="40" height="40"/>
  </a>
  <a href="https://www.elastic.co/logstash/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/elasticco_logstash/elasticco_logstash-icon.svg" alt="logstash" width="40" height="40"/>
  </a>
  <a href="https://www.elastic.co/kibana/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/elasticco_kibana/elasticco_kibana-icon.svg" alt="kibana" width="40" height="40"/>
  </a>
  <a href="https://redis.io/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/gilbarbara/logos/92bb74e98bca1ea1ad794442676ebc4e75038adc/logos/redis.svg" alt="redis" width="40" height="40"/>
  </a>
  <a href="https://grpc.io/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/grpcio/grpcio-ar21.svg" alt="grpc" width="80" height="40"/>
  </a>
  <a href="https://www.docker.com/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/docker/docker-icon.svg" alt="docker" width="50" height="50"/>
  </a>
  <a href="https://www.postgresql.org/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/postgresql/postgresql-icon.svg" alt="postgresql" width="40" height="40"/>
  </a>
  <a href="https://www.prisma.io/" target="_blank" rel="noreferrer">
    <img src="https://cdn.worldvectorlogo.com/logos/prisma-3.svg" alt="prisma" width="40" height="40"/>
  </a>
  <a href="https://jestjs.io/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/jestjsio/jestjsio-icon.svg" alt="jest" width="40" height="40"/>
  </a>
  <a href="https://nodejs.org/en" target="_blank" rel="noreferrer">
    <img src="https://upload.vectorlogo.zone/logos/nodejs/images/eca9ff97-5734-46c4-b8a1-621819eaeaa9.svg" alt="nodejs" width="50" height="50"/>
  </a>
  <a href="https://www.npmjs.com/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/npmjs/npmjs-ar21.svg" alt="npm" width="60" height="40"/>
  </a> 
</p>

# EasyStore Backend Repository

## Table of Contents

- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Production Environment](#production-environment)
  - [Documentation](#documentation)
- [Architecture and Patterns](#architecture-and-patterns)
  - [Core Architecture](#core-architecture)
  - [Key Patterns](#key-patterns)
  - [Database ERD](#database-entity-relationship-diagram-erd)

## Getting Started

Follow these instructions to set up and run the EasyStore backend application:

### Development Environment

1. Navigate to the application directory:

   ```bash
   cd easystore-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Run database migrations to create PostgreSQL models:

   ```bash
   npm run database
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

> [!TIP]
> Alternatively, you can use Docker for development:

```bash
npm run docker:dev
```

#### Testing Kafka

1. Start services:

```bash
  npm run docker:kafka:up
```

2. Send test messages:

```bash
npm run kafka:producer:test
```

3. Verify processing:

```bash
npm run kafka:consumer:test
```

### Production Environment

To run the application in production mode:

```bash
npm run build
npm run start
```

> [!TIP]
> Alternatively, you can use Docker for production:

```bash
npm run docker
```

> [!NOTE]
> Prisma schemas are located at src/infrastructure/database containing PostgreSQL models.

### Documentation
The following endpoint will be available for API exploration:

GraphQL Playground & Documentation: /gql

The Apollo Playground provides an interactive environment to:

- Explore the GraphQL schema
- Test queries and mutations
- View documentation for all types and fields

## Architecture and Patterns

### Core Architecture
- **Domain-Driven Design (DDD)**
  - Strategic patterns: Bounded Contexts, Ubiquitous Language
  - Tactical patterns: Aggregates, Entities, Value Objects
  - Layered architecture with clear separation between:
    - Domain layer (business logic)
    - Application layer (use cases/coordination)
    - Infrastructure layer (technical implementations)
    - Presentation layer (graphql resolvers and types)

### Key Patterns
1. **Command Query Responsibility Segregation (CQRS)**
   - Separate models for:
     - Commands (write operations with business validation)
     - Queries (read operations with optimized projections)
   - Event sourcing for critical domain operations

2. **Repository Pattern**
   - Abstract data access through `IRepository` interfaces
   - Database-agnostic domain layer
   - Concrete implementations in infrastructure layer

3. **Factory Pattern**
   - Domain object creation through dedicated factories
   - Complex aggregate construction
   - Validation during object creation
   - Pattern implementations:
     - Static factory methods for simple objects
     - Builder pattern for complex aggregates

### Database Entity-Relationship Diagram (ERD)
<div align="center">
  <img src="easystore-backend/src/infrastructure/database/erd.svg" alt="Database ERD"/>
</div>