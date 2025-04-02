# EasyStore Backend Repository
Welcome to the backend repository of EasyStore, the web application that empowers you to build your own e-commerce platform without any programming knowledge. This user-friendly solution provides all the tools you need to create, manage, and grow your online store with ease.

## Table of Contents
- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Production Environment](#production-environment)
  - [Environment Configuration](#environment-configuration)
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

4. Start the development server:

   ```bash
   npm run dev
   ```
 
 > [!TIP]
 > Alternatively, you can use Docker for development:

   ```bash
   npm run docker:dev
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

### Environment Configuration
.env file documentation:

```ini
# PostgreSQL (Relational DB)
DATABASE_URL="postgresql://user:password@localhost:5432/easystore"

# MongoDB (Product Catalog)
MONGODB_URI="mongodb://localhost:27017/easystore-catalog"

# Application Security
JWT_SECRET=your_secure_jwt_secret_here
API_PORT=3000
```
> [!TIP]
> See .env.example for full configuration reference.

> [!NOTE]
> Prisma schemas are located at prisma/postgres.prisma and prisma/mongodb.prisma containing both PostgreSQL models and MongoDB product catalog.

### Documentation

To explore our tRPC api documentation:

```bash
npm run docs
```

> [!NOTE]
> OpenAPI documentation will be available at /docs endpoint.

## Repository Rules

### ESLint Rules

Our codebase follows strict linting rules to ensure code quality and consistency:

- Base Rules :

  - No console logs in production code
  - Curly braces required for all control statements
  - Strict equality checks ( === and !== )

- TypeScript Rules :

  - No explicit any types
  - No non-null assertions
  - Proper promise handling
  - Unused variables must be prefixed with underscore

- Naming Conventions :

  - Variables: camelCase or PascalCase
  - Types/Interfaces: PascalCase
  - Functions: camelCase or PascalCase

- Code Organization :
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

- feat : New features
- fix : Bug fixes
- docs : Documentation changes
- style : Code style changes (formatting, etc.)
- refactor : Code changes that neither fix bugs nor add features
- test : Adding or modifying tests
- chore : Changes to the build process or auxiliary tools
- revert : Reverting previous changes
- perf : Performance improvements
- build : Changes affecting build system
- ci : Changes to CI configuration
- wip : Work in progress
> [!WARNING]
> Commit descriptions must be in lowercase. For example, use "feat: add login feature" instead of "feat: Add Login Feature".

### Branch Rules

Branches must follow this naming convention:

```plaintext
<type>/<kebab-case-description>
```

Supported types :

- feat : Feature branches
- fix : Bug fix branches
- docs : Documentation branches
- style : Style change branches
- refactor : Refactoring branches
- test : Test-related branches
- chore : Maintenance branches
- revert : Revert branches
- perf : Performance improvement branches
- build : Build-related branches
- ci : CI configuration branches
> [!CAUTION]
> Branches that don't follow this convention will be rejected during push.

> [!TIP] 
> To rename a branch, use: git branch -m <type/new-name>

## Architecture

EasyStore backend is built using the following architecture and technologies:

- Design Pattern: Command Query Responsibility Segregation ( CQRS ) pattern
- Programming Language: TypeScript
- Framework: NestJS
- API: tRPC
- Databases: 
  - PostgreSQL: Core transactional data and user management
  - MongoDB: Flexible product catalog storage with nested categories
- ORM: Prisma
- Testing: Jest
- Documentation: open-api
> [!NOTE] 
> The CQRS (Command Query Responsibility Segregation) pattern separates read and write operations 
> into distinct models:
> - **Commands**: Handle write operations, business logic, and data mutations through dedicated handlers
> - **Queries**: Optimized read operations returning DTOs specifically tailored for client needs
> - **Domain Events**: Capture state changes through events that trigger downstream processes
> This architecture enables:
>   - Independent scaling of read/write workloads
>   - Optimized data models for each operation type
>   - Improved audit capabilities through event sourcing
>   - Reduced concurrency conflicts in complex domains
