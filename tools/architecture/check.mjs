import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import {
  aggregateRoots,
  allowedAggregateDependencies,
  persistenceRepositoryContractExceptions,
  specializedMutationDtos,
} from './config.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

const domainsRoot = process.env.ARCHITECTURE_DOMAINS_ROOT
  ? resolve(process.env.ARCHITECTURE_DOMAINS_ROOT)
  : join(repositoryRoot, 'src', 'domains');
const errors = [];

const allowedExternalImports = new Set(allowedAggregateDependencies);
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kebabCaseFile = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)+$/;
const requiredDomainDirectories = [
  'aggregates/entities',
  'aggregates/events',
  'aggregates/repositories',
  'aggregates/value-objects',
  'application/commands',
  'application/events',
  'application/mappers',
  'application/queries',
  'infrastructure/persistence/postgres',
  'presentation/graphql',
  'presentation/graphql/types',
];
const requiredBarrelDirectories = [
  'aggregates/entities',
  'aggregates/events',
  'aggregates/repositories',
  'aggregates/value-objects',
  'application/commands',
  'application/events',
  'application/mappers',
  'application/queries',
  'presentation/graphql/types',
];
const optionalBarrelDirectories = [
  'application/ports',
  'infrastructure/adapters',
  'infrastructure/persistence/mappers',
];
const groupedCodeDirectories = [
  'aggregates/entities',
  'aggregates/events',
  'application/commands',
  'application/events',
  'application/mappers',
  'application/queries',
];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function walkDirectories(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (!statSync(path).isDirectory()) return [];
    return [path, ...walkDirectories(path)];
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

function importSpecifiers(source) {
  return [
    ...source.matchAll(
      /\b(?:import|export)\s[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g,
    ),
    ...source.matchAll(/\bimport\s+['"]([^'"]+)['"]/g),
    ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ...source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
  ].map((match) => match[1]);
}

function targetsPresentationLayer(file, specifier) {
  if (specifier.startsWith('.')) {
    const target = resolve(dirname(file), specifier);
    return (
      [...target.split(sep)].includes('presentation') &&
      isInside(target, domainsRoot) &&
      !isInside(target, join(domainsRoot, 'shared'))
    );
  }

  return (
    /^@[^/]+\/presentation(?:\/|$)/.test(specifier) ||
    /(?:^|\/)src\/domains\/[^/]+\/presentation(?:\/|$)/.test(specifier)
  );
}

function hasJsDocBefore(source, declarationPattern) {
  return new RegExp(
    String.raw`\/\*\*[\s\S]*?\*\/\s*${declarationPattern}`,
  ).test(source);
}

function domainImportTarget(file, specifier) {
  if (specifier.startsWith('.')) {
    const target = resolve(dirname(file), specifier);
    if (!isInside(target, domainsRoot)) return null;

    const domain = relative(domainsRoot, target).split(sep)[0];
    return domain === 'shared' ? null : { domain, target };
  }

  const aliasMatch = specifier.match(/^@([^/]+)((?:\/.*)?)$/);
  if (aliasMatch && aliasMatch[1] !== 'shared') {
    const domain = aliasMatch[1];
    if (existsSync(join(domainsRoot, domain))) {
      return {
        domain,
        target: join(domainsRoot, domain, aliasMatch[2] ?? ''),
      };
    }
  }

  const pathMatch = specifier.match(
    /(?:^|\/)src\/domains\/([^/]+)((?:\/.*)?)$/,
  );
  if (!pathMatch || pathMatch[1] === 'shared') return null;

  return {
    domain: pathMatch[1],
    target: join(domainsRoot, pathMatch[1], pathMatch[2] ?? ''),
  };
}

function validateDomainIsolation(domainRoot, domainName) {
  const adaptersRoot = join(domainRoot, 'infrastructure', 'adapters');

  for (const file of walk(domainRoot).filter((candidate) =>
    candidate.endsWith('.ts'),
  )) {
    const source = readFileSync(file, 'utf8');
    for (const specifier of importSpecifiers(source)) {
      const importTarget = domainImportTarget(file, specifier);
      if (!importTarget || importTarget.domain === domainName) continue;

      if (isInside(file, adaptersRoot)) {
        const providerApplicationRoot = join(
          domainsRoot,
          importTarget.domain,
          'application',
        );
        if (!isInside(importTarget.target, providerApplicationRoot)) {
          report(
            file,
            `adapter must translate only public application contracts from domain "${importTarget.domain}" through "${specifier}"`,
          );
        }
        continue;
      }

      report(
        file,
        `domain "${domainName}" must not import domain "${importTarget.domain}" through "${specifier}"; define an application/ports contract and implement it in infrastructure/adapters`,
      );
    }
  }
}

function domainRelative(file) {
  return relative(domainsRoot, file).split(sep).join('/');
}

function validateLayerImports(domainRoot) {
  for (const layerName of ['aggregates', 'application', 'infrastructure']) {
    const layerRoot = join(domainRoot, layerName);
    if (!existsSync(layerRoot)) continue;

    for (const file of walk(layerRoot).filter(
      (candidate) =>
        candidate.endsWith('.ts') &&
        !candidate.split(sep).includes('__tests__'),
    )) {
      const source = readFileSync(file, 'utf8');
      for (const specifier of importSpecifiers(source)) {
        if (targetsPresentationLayer(file, specifier)) {
          report(
            file,
            `${layerName} code must not import presentation module "${specifier}"`,
          );
        }
      }
    }
  }
}

function validateAggregateArtifacts(aggregateRoot) {
  const entitiesRoot = join(aggregateRoot, 'entities');
  if (existsSync(entitiesRoot)) {
    for (const attributesFile of walk(entitiesRoot).filter((file) =>
      file.endsWith('.attributes.ts'),
    )) {
      const source = readFileSync(attributesFile, 'utf8');
      const interfaces = [
        ...source.matchAll(/export\s+interface\s+(\w+)/g),
      ].map((match) => match[1]);
      if (!interfaces.some((name) => name.includes('Base'))) {
        report(
          attributesFile,
          'entity attributes must export a reusable *Base or *BaseType interface',
        );
      }
      if (!interfaces.some((name) => name.endsWith('Type'))) {
        report(
          attributesFile,
          'entity attributes must export a complete *Type interface',
        );
      }
    }
  }

  const eventsRoot = join(aggregateRoot, 'events');
  if (existsSync(eventsRoot)) {
    for (const eventFile of walk(eventsRoot).filter((file) =>
      file.endsWith('.event.ts'),
    )) {
      const source = readFileSync(eventFile, 'utf8');
      if (!/export\s+class\s+\w+Event\s+implements\s+IEvent\b/.test(source)) {
        report(
          eventFile,
          'domain event must export a *Event class implementing IEvent',
        );
      }
      if (
        !/import\s*{[^}]*\bIEvent\b[^}]*}\s*from\s*['"]@nestjs\/cqrs['"]/.test(
          source,
        )
      ) {
        report(eventFile, 'domain event must import IEvent from @nestjs/cqrs');
      }
    }
  }

  const repositoriesRoot = join(aggregateRoot, 'repositories');
  if (existsSync(repositoriesRoot)) {
    for (const repositoryFile of walk(repositoriesRoot).filter((file) =>
      file.endsWith('.interface.ts'),
    )) {
      const source = readFileSync(repositoryFile, 'utf8');
      const declaration = String.raw`export\s+(?:default\s+)?interface\s+I\w+Repository\b`;
      if (!new RegExp(declaration).test(source)) {
        report(
          repositoryFile,
          'repository contract must export an I*Repository interface',
        );
      } else if (!hasJsDocBefore(source, declaration)) {
        report(
          repositoryFile,
          'repository interface must have an immediately preceding JSDoc contract',
        );
      }
    }
  }

  const valueObjectsRoot = join(aggregateRoot, 'value-objects');
  if (existsSync(valueObjectsRoot)) {
    for (const valueObjectFile of walk(valueObjectsRoot).filter((file) =>
      file.endsWith('.vo.ts'),
    )) {
      const source = readFileSync(valueObjectFile, 'utf8');
      if (/export\s+class\s+\w+/.test(source)) {
        if (!/private\s+constructor\s*\(/.test(source)) {
          report(
            valueObjectFile,
            'value object class must have a private constructor',
          );
        }
        if (!/static\s+(?:create|generate)\s*\(/.test(source)) {
          report(
            valueObjectFile,
            'value object class must expose a create/generate factory',
          );
        }
        if (!/(?:public\s+)?getValue\s*\(/.test(source)) {
          report(valueObjectFile, 'value object class must expose getValue()');
        }
      } else if (!/export\s+enum\s+\w+/.test(source)) {
        report(
          valueObjectFile,
          'value-object file must export a class or enum',
        );
      }
    }
  }
}

function validateCqrsHandlers(root, kind, decorator, handlerInterface) {
  if (!existsSync(root)) return;
  for (const handlerFile of walk(root).filter(
    (file) =>
      file.endsWith('.handler.ts') && !file.split(sep).includes('__tests__'),
  )) {
    const source = readFileSync(handlerFile, 'utf8');
    if (!new RegExp(`@${decorator}\\s*\\(`).test(source)) {
      report(handlerFile, `${kind} handler must use @${decorator}(...)`);
    }
    if (!new RegExp(`implements\\s+${handlerInterface}\\s*<`).test(source)) {
      report(
        handlerFile,
        `${kind} handler must implement ${handlerInterface}<T>`,
      );
    }

    if (kind !== 'event') {
      const dtoFile = handlerFile.replace(/\.handler\.ts$/, '.dto.ts');
      if (!existsSync(dtoFile)) {
        report(
          handlerFile,
          `${kind} handler is missing sibling ${display(dtoFile)}`,
        );
      }
    }
  }
}

function baseContractsImportedBy(source, file, entitiesRoot) {
  const contracts = [];
  for (const match of source.matchAll(
    /import\s*{([^}]*)}\s*from\s*['"]([^'"]+)['"]/g,
  )) {
    const [, members, specifier] = match;
    const target = specifier.startsWith('.')
      ? resolve(dirname(file), specifier)
      : null;
    const importsEntities = target
      ? isInside(target, entitiesRoot)
      : /\/aggregates\/entities(?:\/|$)/.test(specifier);
    if (!importsEntities) continue;

    for (const member of members.split(',')) {
      const importedName = member
        .trim()
        .split(/\s+as\s+/)[0]
        .replace(/^type\s+/, '');
      if (/^I?\w*Base(?:Type)?$/.test(importedName)) {
        contracts.push(importedName);
      }
    }
  }
  return contracts;
}

function validateApplicationLayer(domainRoot) {
  const applicationRoot = join(domainRoot, 'application');
  if (!existsSync(applicationRoot)) return;

  const commandsRoot = join(applicationRoot, 'commands');
  const queriesRoot = join(applicationRoot, 'queries');
  const applicationEventsRoot = join(applicationRoot, 'events');
  validateCqrsHandlers(
    commandsRoot,
    'command',
    'CommandHandler',
    'ICommandHandler',
  );
  validateCqrsHandlers(queriesRoot, 'query', 'QueryHandler', 'IQueryHandler');
  validateCqrsHandlers(
    applicationEventsRoot,
    'event',
    'EventsHandler',
    'IEventHandler',
  );

  if (existsSync(commandsRoot)) {
    const entitiesRoot = join(domainRoot, 'aggregates', 'entities');
    for (const dtoFile of walk(commandsRoot).filter((file) =>
      file.endsWith('.dto.ts'),
    )) {
      const operation = relative(commandsRoot, dtoFile).split(sep)[0];
      if (!['create', 'update'].includes(operation)) continue;

      const source = readFileSync(dtoFile, 'utf8');
      if (baseContractsImportedBy(source, dtoFile, entitiesRoot).length > 0) {
        continue;
      }

      const exceptionReason = specializedMutationDtos[domainRelative(dtoFile)];
      if (!exceptionReason) {
        report(
          dtoFile,
          'create/update DTO must reuse an aggregate *Base/*BaseType contract or declare a reasoned exception in architecture.config.mjs',
        );
      }
    }
  }

  const mappersRoot = join(applicationRoot, 'mappers');
  if (existsSync(mappersRoot)) {
    for (const mapperFile of walk(mappersRoot).filter((file) =>
      file.endsWith('.mapper.ts'),
    )) {
      const source = readFileSync(mapperFile, 'utf8');
      const declaration = String.raw`export\s+(?:default\s+)?class\s+\w+Mapper\b`;
      if (!new RegExp(declaration).test(source)) {
        report(mapperFile, 'mapper must export a *Mapper class');
      } else if (!hasJsDocBefore(source, declaration)) {
        report(
          mapperFile,
          'mapper class must have an immediately preceding JSDoc contract',
        );
      }

      const dtoFile = mapperFile.replace(/\.mapper\.ts$/, '.dto.ts');
      if (!existsSync(dtoFile)) {
        report(mapperFile, `mapper is missing sibling ${display(dtoFile)}`);
      }
    }
  }

  const portsRoot = join(applicationRoot, 'ports');
  if (existsSync(portsRoot)) {
    for (const portFile of walk(portsRoot).filter((file) =>
      file.endsWith('.port.ts'),
    )) {
      const source = readFileSync(portFile, 'utf8');
      const declaration = String.raw`export\s+interface\s+I\w+\b`;
      if (!new RegExp(declaration).test(source)) {
        report(portFile, 'port must export an I* interface');
      } else if (!hasJsDocBefore(source, declaration)) {
        report(
          portFile,
          'port interface must have an immediately preceding JSDoc contract',
        );
      }

      const adapterFile = join(
        domainRoot,
        'infrastructure',
        'adapters',
        portFile
          .split(sep)
          .at(-1)
          .replace(/\.port\.ts$/, '.adapter.ts'),
      );
      if (!existsSync(adapterFile)) {
        report(portFile, `port is missing adapter ${display(adapterFile)}`);
      }
    }
  }
}

function validateInfrastructureLayer(domainRoot) {
  const infrastructureRoot = join(domainRoot, 'infrastructure');
  if (!existsSync(infrastructureRoot)) return;

  const adaptersRoot = join(infrastructureRoot, 'adapters');
  if (existsSync(adaptersRoot)) {
    for (const adapterFile of walk(adaptersRoot).filter((file) =>
      file.endsWith('.adapter.ts'),
    )) {
      const source = readFileSync(adapterFile, 'utf8');
      if (!/@Injectable\s*\(\s*\)/.test(source)) {
        report(adapterFile, 'adapter must use @Injectable()');
      }
      if (!/class\s+\w+Adapter\s+implements\s+I\w+/.test(source)) {
        report(
          adapterFile,
          'adapter must be a *Adapter class implementing its port',
        );
      }
      if (!/["'][^"']*application\/ports(?:\/[^"]*)?["']/.test(source)) {
        report(
          adapterFile,
          'adapter must import its contract from application/ports',
        );
      }
    }
  }

  const postgresRoot = join(infrastructureRoot, 'persistence', 'postgres');
  if (existsSync(postgresRoot)) {
    for (const repositoryFile of walk(postgresRoot).filter((file) =>
      file.endsWith('.repository.ts'),
    )) {
      const source = readFileSync(repositoryFile, 'utf8');
      if (!/@Injectable\s*\(\s*\)/.test(source)) {
        report(repositoryFile, 'persistence repository must use @Injectable()');
      }
      if (!/class\s+\w+Repository\b/.test(source)) {
        report(
          repositoryFile,
          'persistence repository class must end in Repository',
        );
      }
      if (
        !/implements\s+I\w+Repository\b/.test(source) &&
        !persistenceRepositoryContractExceptions[domainRelative(repositoryFile)]
      ) {
        report(
          repositoryFile,
          'persistence repository must implement an aggregate I*Repository contract or declare a reasoned exception',
        );
      }
    }
  }
}

function validatePresentationLayer(domainRoot) {
  const graphqlRoot = join(domainRoot, 'presentation', 'graphql');
  if (!existsSync(graphqlRoot)) return;

  for (const resolverFile of walk(graphqlRoot).filter((file) =>
    file.endsWith('.resolver.ts'),
  )) {
    const source = readFileSync(resolverFile, 'utf8');
    if (!/@Resolver\s*\(/.test(source)) {
      report(resolverFile, 'GraphQL resolver must use @Resolver(...)');
    }
    if (!/class\s+\w+Resolver\b/.test(source)) {
      report(resolverFile, 'GraphQL resolver class must end in Resolver');
    }
  }

  const typesRoot = join(graphqlRoot, 'types');
  if (existsSync(typesRoot)) {
    for (const typesFile of walk(typesRoot).filter((file) =>
      file.endsWith('.types.ts'),
    )) {
      const source = readFileSync(typesFile, 'utf8');
      if (
        !/@(?:ObjectType|InputType|ArgsType|InterfaceType)\s*\(/.test(source)
      ) {
        report(
          typesFile,
          'GraphQL types file must declare an object, input, args, or interface type decorator',
        );
      }
    }
  }
}

function validateDomainModule(domainRoot, domainName) {
  const moduleFile = join(domainRoot, `${domainName}.module.ts`);
  if (!existsSync(moduleFile)) return;
  const source = readFileSync(moduleFile, 'utf8');
  if (!/@Module\s*\(/.test(source)) {
    report(moduleFile, 'domain composition root must use @Module(...)');
  }
  if (!/export\s+class\s+\w+Domain\b/.test(source)) {
    report(moduleFile, 'domain module must export a *Domain class');
  }
}

function validateConfiguredExceptions(exceptions, label) {
  const configFile = join(repositoryRoot, 'tools', 'architecture' , 'config.mjs');
  for (const [path, reason] of Object.entries(exceptions)) {
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      report(configFile, `${label} exception "${path}" requires a reason`);
    }
    if (!existsSync(join(domainsRoot, path))) {
      report(configFile, `${label} exception points to missing file "${path}"`);
    }
  }
}

validateConfiguredExceptions(
  specializedMutationDtos,
  'specialized mutation DTO',
);
validateConfiguredExceptions(
  persistenceRepositoryContractExceptions,
  'persistence repository contract',
);

function validateDomainStructure(domainRoot, domainName) {
  if (!kebabCase.test(domainName)) {
    report(domainRoot, 'domain folder name must use kebab-case');
  }

  for (const directory of walkDirectories(domainRoot)) {
    const name = directory.split(sep).at(-1);
    if (name !== '__tests__' && !kebabCase.test(name)) {
      report(directory, 'folder name must use kebab-case');
    }
  }

  for (const file of walk(domainRoot)) {
    const name = file.split(sep).at(-1);
    if (!kebabCaseFile.test(name)) {
      report(file, 'file name must use kebab-case with a descriptive suffix');
    }
  }

  for (const relativeDirectory of requiredDomainDirectories) {
    const directory = join(domainRoot, relativeDirectory);
    if (!existsSync(directory)) {
      report(domainRoot, `is missing required ${relativeDirectory}/ directory`);
    }
  }

  const moduleFile = join(domainRoot, `${domainName}.module.ts`);
  if (!existsSync(moduleFile)) {
    report(domainRoot, `is missing domain module ${display(moduleFile)}`);
  }

  for (const relativeDirectory of requiredBarrelDirectories) {
    const barrelFile = join(domainRoot, relativeDirectory, 'index.ts');
    if (!existsSync(barrelFile)) {
      report(domainRoot, `is missing required barrel ${display(barrelFile)}`);
    }
  }

  for (const relativeDirectory of optionalBarrelDirectories) {
    const directory = join(domainRoot, relativeDirectory);
    const barrelFile = join(directory, 'index.ts');
    if (existsSync(directory) && !existsSync(barrelFile)) {
      report(
        directory,
        `optional component must provide barrel ${display(barrelFile)}`,
      );
    }
  }

  for (const relativeDirectory of [
    ...requiredBarrelDirectories,
    ...optionalBarrelDirectories,
  ]) {
    const directory = join(domainRoot, relativeDirectory);
    const barrelFile = join(directory, 'index.ts');
    if (!existsSync(barrelFile)) continue;

    const barrel = readFileSync(barrelFile, 'utf8');
    const exportedTargets = new Set(
      [...barrel.matchAll(/\bexport\s[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g)]
        .map((match) => match[1])
        .filter((specifier) => specifier.startsWith('.'))
        .map((specifier) => resolve(directory, specifier)),
    );

    for (const implementationFile of walk(directory).filter(
      (file) =>
        file.endsWith('.ts') &&
        file !== barrelFile &&
        !file.endsWith('.spec.ts') &&
        !file.split(sep).includes('__tests__') &&
        !file.split(sep).includes('shared'),
    )) {
      const exportTarget = implementationFile.replace(/\.ts$/, '');
      if (!exportedTargets.has(exportTarget)) {
        report(
          barrelFile,
          `must explicitly export ${display(implementationFile)} (wildcard exports are prohibited)`,
        );
      }
    }
  }

  const portsDirectory = join(domainRoot, 'application/ports');
  const adaptersDirectory = join(domainRoot, 'infrastructure/adapters');
  if (existsSync(portsDirectory) !== existsSync(adaptersDirectory)) {
    report(
      domainRoot,
      'application/ports and infrastructure/adapters must be introduced together',
    );
  }

  for (const relativeDirectory of groupedCodeDirectories) {
    const directory = join(domainRoot, relativeDirectory);
    if (!existsSync(directory)) continue;
    for (const name of readdirSync(directory)) {
      const file = join(directory, name);
      if (statSync(file).isFile() && name !== 'index.ts') {
        report(
          file,
          `${relativeDirectory} files must be grouped in a kebab-case entity or use-case folder`,
        );
      }
    }
  }

  for (const relativeDirectory of [
    'application/commands',
    'application/queries',
  ]) {
    const root = join(domainRoot, relativeDirectory);
    if (!existsSync(root)) continue;
    for (const directory of [root, ...walkDirectories(root)]) {
      if (directory.split(sep).includes('__tests__')) continue;
      const children = readdirSync(directory);
      const hasUseCaseFolders = children.some((name) => {
        const child = join(directory, name);
        return name !== '__tests__' && statSync(child).isDirectory();
      });
      if (!hasUseCaseFolders) continue;

      for (const name of children) {
        const file = join(directory, name);
        if (statSync(file).isFile() && name !== 'index.ts') {
          report(
            file,
            'a command/query grouping folder cannot also contain implementation files; place them in an entity or use-case subfolder',
          );
        }
      }
    }
  }

  const commandsRoot = join(domainRoot, 'application/commands');
  if (existsSync(commandsRoot)) {
    for (const handlerFile of walk(commandsRoot).filter(
      (file) =>
        file.endsWith('.handler.ts') && !file.split(sep).includes('__tests__'),
    )) {
      const useCaseDirectory = dirname(handlerFile);
      const handlerName = handlerFile.split(sep).at(-1).replace(/\.ts$/, '');
      const testsDirectory = join(useCaseDirectory, '__tests__');
      const specFile = join(testsDirectory, `${handlerName}.spec.ts`);

      if (!existsSync(testsDirectory)) {
        report(
          handlerFile,
          `command use case is missing ${display(testsDirectory)}/`,
        );
      } else if (!existsSync(specFile)) {
        report(
          handlerFile,
          `command handler requires matching test ${display(specFile)}`,
        );
      }
    }
  }
}

function validateImports(file, aggregateRoot) {
  const source = readFileSync(file, 'utf8');
  const sharedRoot = join(domainsRoot, 'shared');
  const imports = source.matchAll(
    /\b(?:import|export)\s[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g,
  );

  for (const [, specifier] of imports) {
    if (specifier.startsWith('.')) {
      const target = resolve(dirname(file), specifier);
      if (!isInside(target, aggregateRoot) && !isInside(target, sharedRoot)) {
        report(
          file,
          `relative import "${specifier}" leaves this domain's aggregates layer without targeting the shared domain`,
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
      /import\s*{([^}]*)}\s*from\s*['"]@shared\/aggregates\/entities\/entity\.base['"]/g,
    ),
  ].some((match) => {
    const imports = match[1].split(',').map((name) => name.trim());
    return imports.includes('Entity') && imports.includes('EntityProps');
  });
  const hasDomainEntityBaseImport = [
    ...source.matchAll(
      /import\s*{([^}]*)}\s*from\s*['"]@shared\/aggregates\/entities\/domain-entity\.base['"]/g,
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
        'aggregate root must import Entity and EntityProps directly from @shared/aggregates/entities/entity.base',
      );
    }

    if (!/export\s+class\s+\w+\s+extends\s+Entity\s*</.test(source)) {
      report(entityFile, 'aggregate root must extend Entity<TProps>');
    }
  } else {
    if (!hasDomainEntityBaseImport) {
      report(
        entityFile,
        'nested entity must import DomainEntity and DomainEntityProps directly from @shared/aggregates/entities/domain-entity.base',
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
  if (domainName === 'shared') continue;
  const domainRoot = join(domainsRoot, domainName);
  if (!statSync(domainRoot).isDirectory()) continue;
  validateDomainStructure(domainRoot, domainName);
  validateDomainIsolation(domainRoot, domainName);
  validateLayerImports(domainRoot);
  validateApplicationLayer(domainRoot);
  validateInfrastructureLayer(domainRoot);
  validatePresentationLayer(domainRoot);
  validateDomainModule(domainRoot, domainName);

  const aggregateRoot = join(domainRoot, 'aggregates');
  if (!existsSync(aggregateRoot)) continue;
  validateAggregateArtifacts(aggregateRoot);

  const files = walk(aggregateRoot).filter((file) => file.endsWith('.ts'));
  for (const file of files) validateImports(file, aggregateRoot);

  const entitiesRoot = join(aggregateRoot, 'entities');
  if (!existsSync(entitiesRoot)) continue;
  const configuredRoot = aggregateRoots[domainName];
  if (!configuredRoot) {
    report(
      entitiesRoot,
      `domain "${domainName}" must declare its aggregate root in tools/architecture/config.mjs`,
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
