import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import {
  aggregateRoots,
  allowedAggregateDependencies,
} from './architecture.config.mjs';

const repositoryRoot = resolve(import.meta.dirname, '..');
const domainsRoot = join(repositoryRoot, 'src', 'domains');
const errors = [];

const allowedExternalImports = new Set(allowedAggregateDependencies);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function display(path) {
  return relative(repositoryRoot, path).split(sep).join('/');
}

function report(path, message) {
  errors.push(`${display(path)}: ${message}`);
}

function isInside(path, parent) {
  const pathFromParent = relative(parent, path);
  return (
    pathFromParent === '' ||
    (!pathFromParent.startsWith('..') && !pathFromParent.startsWith(sep))
  );
}

function validateImports(file, aggregateRoot) {
  const source = readFileSync(file, 'utf8');
  const imports = source.matchAll(
    /\b(?:import|export)\s[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g,
  );

  for (const [, specifier] of imports) {
    if (specifier.startsWith('.')) {
      const target = resolve(dirname(file), specifier);
      if (!isInside(target, aggregateRoot)) {
        report(
          file,
          `relative import "${specifier}" leaves this domain's aggregates layer`,
        );
      }
      continue;
    }

    if (specifier.startsWith('@shared/')) continue;
    if (allowedExternalImports.has(specifier)) continue;

    report(
      file,
      `import "${specifier}" is not an approved aggregate dependency; use aggregate-local or @shared modules`,
    );
  }
}

function validateEntity(entityFile, entitiesRoot, isAggregateRoot) {
  const source = readFileSync(entityFile, 'utf8');
  const entityName = entityFile.slice(0, -'.entity.ts'.length);
  const attributesFile = `${entityName}.attributes.ts`;
  const barrelFile = join(entitiesRoot, 'index.ts');
  const hasEntityBaseImport = [
    ...source.matchAll(
      /import\s*{([^}]*)}\s*from\s*['"]@shared\/entity\.base['"]/g,
    ),
  ].some((match) => {
    const imports = match[1].split(',').map((name) => name.trim());
    return imports.includes('Entity') && imports.includes('EntityProps');
  });
  const hasDomainEntityBaseImport = [
    ...source.matchAll(
      /import\s*{([^}]*)}\s*from\s*['"]@shared\/domain-entity\.base['"]/g,
    ),
  ].some((match) => {
    const imports = match[1].split(',').map((name) => name.trim());
    return (
      imports.includes('DomainEntity') && imports.includes('DomainEntityProps')
    );
  });

  if (isAggregateRoot) {
    if (!hasEntityBaseImport) {
      report(
        entityFile,
        'aggregate root must import Entity and EntityProps directly from @shared/entity.base',
      );
    }

    if (!/export\s+class\s+\w+\s+extends\s+Entity\s*</.test(source)) {
      report(entityFile, 'aggregate root must extend Entity<TProps>');
    }
  } else {
    if (!hasDomainEntityBaseImport) {
      report(
        entityFile,
        'nested entity must import DomainEntity and DomainEntityProps directly from @shared/domain-entity.base',
      );
    }

    if (!/export\s+class\s+\w+\s+extends\s+DomainEntity\s*</.test(source)) {
      report(
        entityFile,
        'nested entity must extend DomainEntity<TProps>, not the aggregate-root Entity base',
      );
    }
  }

  if (!/private\s+constructor\s*\(/.test(source)) {
    report(
      entityFile,
      'factory-managed entity must have a private constructor',
    );
  }

  if (!/static\s+create\s*\(/.test(source)) {
    report(entityFile, 'factory-managed entity must define static create(...)');
  }

  if (!/static\s+reconstitute\s*\(/.test(source)) {
    report(
      entityFile,
      'factory-managed entity must define static reconstitute(...)',
    );
  }

  if (/\.get\(\s*['"][^'"]+['"]\s*\)/.test(source)) {
    report(
      entityFile,
      'entity implementations must use typed props/getters instead of string-key get(...) calls',
    );
  }

  if (!existsSync(attributesFile)) {
    report(entityFile, `is missing sibling ${display(attributesFile)}`);
  } else if (
    !/export\s+interface\s+\w+/.test(readFileSync(attributesFile, 'utf8'))
  ) {
    report(attributesFile, 'must export at least one attributes interface');
  }

  if (!existsSync(barrelFile)) {
    report(entityFile, `is missing entities barrel ${display(barrelFile)}`);
    return;
  }

  const barrel = readFileSync(barrelFile, 'utf8');
  const exports = new Set(
    [...barrel.matchAll(/\bexport\s[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g)].map(
      (match) => match[1],
    ),
  );
  const entityExport = `./${relative(entitiesRoot, entityFile).split(sep).join('/').replace(/\.ts$/, '')}`;
  const attributesExport = `./${relative(entitiesRoot, attributesFile).split(sep).join('/').replace(/\.ts$/, '')}`;

  if (!exports.has(entityExport))
    report(barrelFile, `must export ${entityExport}`);
  if (existsSync(attributesFile) && !exports.has(attributesExport)) {
    report(barrelFile, `must export ${attributesExport}`);
  }
}

for (const domainName of readdirSync(domainsRoot)) {
  const aggregateRoot = join(domainsRoot, domainName, 'aggregates');
  if (!existsSync(aggregateRoot)) continue;

  const files = walk(aggregateRoot).filter((file) => file.endsWith('.ts'));
  for (const file of files) validateImports(file, aggregateRoot);

  const entitiesRoot = join(aggregateRoot, 'entities');
  if (!existsSync(entitiesRoot)) continue;
  const configuredRoot = aggregateRoots[domainName];
  if (!configuredRoot) {
    report(
      entitiesRoot,
      `domain "${domainName}" must declare its aggregate root in tools/architecture.config.mjs`,
    );
    continue;
  }
  const configuredRootFile = join(entitiesRoot, configuredRoot);
  if (!existsSync(configuredRootFile)) {
    report(
      entitiesRoot,
      `configured aggregate root does not exist: ${display(configuredRootFile)}`,
    );
  }

  for (const entityFile of files.filter((file) =>
    file.endsWith('.entity.ts'),
  )) {
    const entityRelativePath = relative(entitiesRoot, entityFile)
      .split(sep)
      .join('/');
    validateEntity(
      entityFile,
      entitiesRoot,
      entityRelativePath === configuredRoot,
    );
  }
}

if (errors.length > 0) {
  console.error('Architecture validation failed:\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exitCode = 1;
} else {
  console.log('Architecture validation passed.');
}
