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
  <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/mongodb/mongodb-icon.svg" alt="mongodb" width="40" height="40"/>
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

Welcome to the backend repository of EasyStore, the web application that empowers you to build your own e-commerce platform without any programming knowledge. This user-friendly solution provides all the tools you need to create, manage, and grow your online store with ease.

## Table of Contents

- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Production Environment](#production-environment)
  - [Documentation](#documentation)
- [Repository Rules](#repository-rules)
  - [ESLint Rules](#eslint-rules)
  - [Gitflow](#gitflow)
    - [Main Branches](#main-branches)
    - [Workflow](#workflow)
    - [Hotfixes](#hotfixes)
  - [Commit Rules](#commit-rules)
  - [Branch Rules](#branch-rules)
- [Architecture](#architecture)

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
> Prisma schemas are located at src/infrastructure/database containing both PostgreSQL and MongoDB models.

### Documentation

> [!NOTE]
> The following endpoints will be available for API exploration:

- GraphQL Playground & Documentation: /gql
- GraphQL Schema Visualization: /voyager

The Apollo Playground provides an interactive environment to:

- Explore the GraphQL schema
- Test queries and mutations
- View documentation for all types and fields

The Voyager interface offers:

- Visual representation of your GraphQL schema
- Interactive graph of type relationships
- Easy navigation through schema connections

## Repository Rules

### ESLint Rules

Our codebase follows strict linting rules to ensure code quality and consistency:

- Base Rules:

  - No console logs in production code
  - Curly braces required for all control statements
  - Strict equality checks ( === and !== )

- TypeScript Rules:

  - No explicit any types
  - No non-null assertions
  - Proper promise handling
  - Unused variables must be prefixed with underscore

- Naming Conventions:

  - Variables: camelCase or PascalCase
  - Types/Interfaces: PascalCase
  - Functions: camelCase or PascalCase

- Code Organization:
  - Proper spacing between declarations, functions, and classes
  - Organized imports and exports
    > [!IMPORTANT]
    > All code must pass ESLint checks before being committed.

> [!CAUTION]
> The ESLint and Prettier extensions are mandatory for this project. Please ensure you have them installed in your code editor.

### Gitflow

We follow a Simplified Gitflow workflow:

#### Main Branches

- **Main**: Production-ready code
- **Development**: Integration branch for features

#### Workflow

1. Each team member creates a feature branch from Development
2. Work is completed on the feature branch following our branch naming convention
3. When finished, the feature branch is merged into Development
4. At the end of each sprint, Development undergoes final review
5. After approval, Development is merged into Main for production deployment

#### Hotfixes

- If a bug occurs in production, a hotfix branch is created from Main
- After the fix is implemented, it's merged into both Main and Development to keep branches synchronized

> [!NOTE]
> This workflow ensures stable production code while allowing continuous development.

### Commit Rules

We follow the Conventional Commits specification for commit messages:

```plaintext
<type>: <description>
```

> [!TIP]
> For this purpose we recommend using the conventional commits extension or commitizen tool.

Supported types :

- feat: New features
- fix: Bug fixes
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- test: Adding or modifying tests
- chore: Changes to the build process or auxiliary tools
- revert: Reverting previous changes
- perf: Performance improvements
- build: Changes affecting build system
- ci: Changes to CI configuration
- wip: Work in progress
  > [!WARNING]
  > Commit descriptions must be in lowercase. For example, use "feat: add login feature" instead of "feat: Add Login Feature".

### Branch Rules

Branches must follow this naming convention:

```plaintext
<type>/<kebab-case-description>
```

Supported types :

- feat: Feature branches
- fix: Bug fix branches
- docs: Documentation branches
- style: Style change branches
- refactor: Refactoring branches
- test: Test-related branches
- chore: Maintenance branches
- revert: Revert branches
- perf: Performance improvement branches
- build: Build-related branches
- ci: CI configuration branches
  > [!CAUTION]
  > Branches that don't follow this convention will be rejected during push.

> [!TIP]
> To rename a branch, use: git branch -m <type/new-name>

## Architecture

EasyStore backend is built using the following clean architecture and technologies:

- Architectural Approach: Domain-Driven Design (DDD)
- Design Pattern: Command Query Responsibility Segregation ( CQRS ) pattern
- Programming Language: TypeScript
- Framework: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Testing: Jest
- Message Broker: Kafka
- Search Engine: ElasticSearch
- Log Management: LogStash and Kibana
- Cache: Redis
- Containerization: Docker

  > [!TIP]
  > **Domain-Driven Design (DDD):**
  >
  > EasyStore backend applies DDD principles to model complex business logic and ensure maintainability:
  > - **Domains**: The codebase is organized by business domains (e.g., Tenant, Product), each encapsulating its logic.
  > - **Aggregates & Entities**: Core business objects are represented as entities and aggregates, enforcing invariants and encapsulating state.
  > - **Value Objects**: Immutable objects that represent descriptive aspects of the domain (e.g., Email, BusinessName).
  > - **Repositories**: Abstractions for data access, allowing domain logic to remain persistence-agnostic.
  > - **Application Layer**: Coordinates use cases via commands, queries, and handlers, orchestrating domain logic.
  > - **Infrastructure Layer**: Implements technical details (e.g., database, messaging) and integrates with external systems.
  >
  > This DDD approach, combined with CQRS, ensures that business rules are explicit, code is modular, and the system is adaptable to evolving requirements.

  > [!NOTE]
  > The CQRS (Command Query Responsibility Segregation) pattern separates read and write operations
  > into distinct models:
  >
  > - **Commands**: Handle write operations, business logic, and data mutations through dedicated handlers
  > - **Queries**: Optimized read operations returning DTOs specifically tailored for client needs
  > - **Domain Events**: Capture state changes through events that trigger downstream processes
  >   This architecture enables:
  >   - Independent scaling of read/write workloads
  >   - Optimized data models for each operation type
  >   - Improved audit capabilities through event sourcing
  >   - Reduced concurrency conflicts in complex domains
