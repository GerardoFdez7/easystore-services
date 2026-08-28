import {
  FragmentDefinitionNode,
  GraphQLError,
  Kind,
  SelectionSetNode,
  ValidationRule,
} from 'graphql';

interface OperationLimits {
  maxDepth: number;
  maxFields: number;
}

interface OperationMeasurements {
  depth: number;
  fields: number;
}

function measureSelectionSet(
  selectionSet: SelectionSetNode,
  fragments: ReadonlyMap<string, FragmentDefinitionNode>,
  currentDepth: number,
  activeFragments: ReadonlySet<string>,
): OperationMeasurements {
  let depth = currentDepth;
  let fields = 0;

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const fieldDepth = currentDepth + 1;
      depth = Math.max(depth, fieldDepth);
      fields += 1;

      if (selection.selectionSet) {
        const nested = measureSelectionSet(
          selection.selectionSet,
          fragments,
          fieldDepth,
          activeFragments,
        );
        depth = Math.max(depth, nested.depth);
        fields += nested.fields;
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      const nested = measureSelectionSet(
        selection.selectionSet,
        fragments,
        currentDepth,
        activeFragments,
      );
      depth = Math.max(depth, nested.depth);
      fields += nested.fields;
    } else if (!activeFragments.has(selection.name.value)) {
      const fragment = fragments.get(selection.name.value);

      if (fragment) {
        const nextActiveFragments = new Set(activeFragments);
        nextActiveFragments.add(selection.name.value);
        const nested = measureSelectionSet(
          fragment.selectionSet,
          fragments,
          currentDepth,
          nextActiveFragments,
        );
        depth = Math.max(depth, nested.depth);
        fields += nested.fields;
      }
    }
  }

  return { depth, fields };
}

function hasOnlyRootIntrospectionFields(
  selectionSet: SelectionSetNode,
  fragments: ReadonlyMap<string, FragmentDefinitionNode>,
  activeFragments: ReadonlySet<string>,
): boolean {
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      if (!selection.name.value.startsWith('__')) {
        return false;
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      if (
        !hasOnlyRootIntrospectionFields(
          selection.selectionSet,
          fragments,
          activeFragments,
        )
      ) {
        return false;
      }
    } else if (!activeFragments.has(selection.name.value)) {
      const fragment = fragments.get(selection.name.value);

      if (fragment) {
        const nextActiveFragments = new Set(activeFragments);
        nextActiveFragments.add(selection.name.value);

        if (
          !hasOnlyRootIntrospectionFields(
            fragment.selectionSet,
            fragments,
            nextActiveFragments,
          )
        ) {
          return false;
        }
      }
    }
  }

  return selectionSet.selections.length > 0;
}

export function createOperationLimitRule(
  limits: OperationLimits,
): ValidationRule {
  return (context) => {
    const fragments = new Map<string, FragmentDefinitionNode>();

    for (const definition of context.getDocument().definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(definition.name.value, definition);
      }
    }

    return {
      OperationDefinition(node): void {
        if (
          hasOnlyRootIntrospectionFields(
            node.selectionSet,
            fragments,
            new Set<string>(),
          )
        ) {
          return;
        }

        const measurements = measureSelectionSet(
          node.selectionSet,
          fragments,
          0,
          new Set<string>(),
        );

        if (measurements.depth > limits.maxDepth) {
          context.reportError(
            new GraphQLError(
              `Operation exceeds maximum depth of ${limits.maxDepth}`,
              {
                nodes: node,
                extensions: { code: 'QUERY_DEPTH_LIMIT_EXCEEDED' },
              },
            ),
          );
        }

        if (measurements.fields > limits.maxFields) {
          context.reportError(
            new GraphQLError(
              `Operation exceeds maximum field count of ${limits.maxFields}`,
              {
                nodes: node,
                extensions: { code: 'QUERY_COMPLEXITY_LIMIT_EXCEEDED' },
              },
            ),
          );
        }
      },
    };
  };
}
