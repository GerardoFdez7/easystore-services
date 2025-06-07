# Contributing to EasyStore
Thank you for considering contributing to EasyStore! This document outlines the guidelines and standards we follow to maintain code quality and consistency. By adhering to these rules, you help us ensure a stable and efficient development process.

## ESLint Rules

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

## Gitflow

We follow a Simplified Gitflow workflow:

### Main Branches

- **Main**: Production-ready code
- **Development**: Integration branch for features

### Workflow

1. Each team member creates a feature branch from Development
2. Work is completed on the feature branch following our branch naming convention
3. When finished, the feature branch is merged into Development
4. At the end of each sprint, Development undergoes final review
5. After approval, Development is merged into Main for production deployment

### Hotfixes

- If a bug occurs in production, a hotfix branch is created from Main
- After the fix is implemented, it's merged into both Main and Development to keep branches synchronized

> [!NOTE]
> This workflow ensures stable production code while allowing continuous development.

## Commit Rules

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

## Branch Rules

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

## Getting Started
For detailed setup instructions, please refer to the Getting Started section in our [README.md](./README.md).
