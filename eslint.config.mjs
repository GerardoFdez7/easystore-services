import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintJs from '@eslint/js';
import graphqlPlugin from '@graphql-eslint/eslint-plugin';
import security from 'eslint-plugin-security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslintJs.configs.recommended,
});
const sourceFilePatterns = ['**/*.{js,jsx,mjs,cjs,ts,tsx}'];
const ignorePatterns = [
  '*.config.js',
  '*.config.ts',
  '*.config.mjs',
  'tools/*',
  'dist',
  'node_modules',
  'test/',
  'src/infrastructure/database/seeds/**',
  '**/*.spec.ts',
  '.roo/*',
];

const eslintConfig = [
  { ignores: ignorePatterns },
  { ...security.configs.recommended, files: sourceFilePatterns },
  ...compat
    .extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
    )
    .map((config) => ({ ...config, files: sourceFilePatterns })),
  {
    files: sourceFilePatterns,
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    rules: {
      // Base rules
      'no-console': 'error',
      curly: 'error',
      eqeqeq: ['error', 'always'],

      // Prohibit import * and export *
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportNamespaceSpecifier',
          message:
            'Wildcard imports are disallowed. Please import specific named exports.',
        },
        {
          selector: 'ExportAllDeclaration',
          message:
            'Wildcard exports are disallowed. Please export specific named exports.',
        },
      ],

      // TypeScript enhanced rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      // Code organization
      'padding-line-between-statements': [
        'error',
        // Variable declarations
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: '*', next: ['const', 'let', 'var'] },

        // Functions
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'function', next: '*' },

        // Classes
        { blankLine: 'always', prev: '*', next: 'class' },
        { blankLine: 'always', prev: 'class', next: '*' },

        // Imports/exports
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'export', next: '*' },
        { blankLine: 'any', prev: 'export', next: 'export' },
      ],

      // NestJS specific rules
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
  {
    files: [
      'src/domains/shared/aggregates/entities/domain-entity.base.ts',
      'src/domains/shared/aggregates/entities/entity.base.ts',
    ],
    rules: {
      // These generic, type-constrained accessors only read aggregate-owned props.
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: [
      'src/infrastructure/database/seeders/development.seed.ts',
      'src/infrastructure/database/seeders/production.seed.ts',
    ],
    rules: {
      // Seeder paths are resolved from the repository's controlled seed directories.
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    files: ['src/infrastructure/graphql/schema.gql'],
    languageOptions: {
      parser: graphqlPlugin.parser,
      parserOptions: {
        graphQLConfig: {
          schema: './src/infrastructure/graphql/schema.gql',
        },
      },
    },
    plugins: {
      '@graphql-eslint': graphqlPlugin,
    },
    rules: {
      ...graphqlPlugin.configs['flat/schema-recommended'].rules,
      '@graphql-eslint/description-style': 'off',
      '@graphql-eslint/naming-convention': [
        'error',
        {
          types: 'PascalCase',
          FieldDefinition: 'camelCase',
          InputValueDefinition: 'camelCase',
          Argument: 'camelCase',
          DirectiveDefinition: 'camelCase',
          EnumValueDefinition: 'UPPER_CASE',
        },
      ],
      '@graphql-eslint/no-typename-prefix': 'off',
      '@graphql-eslint/require-description': 'off',
      '@graphql-eslint/strict-id-in-types': 'off',
    },
  },
  ...compat
    .config({
      extends: ['plugin:prettier/recommended'],
      plugins: ['@typescript-eslint/eslint-plugin'],
    })
    .map((config) => ({ ...config, files: sourceFilePatterns })),
];

export default eslintConfig;
