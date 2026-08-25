import { buildSchema, parse, specifiedRules, validate } from 'graphql';
import { createOperationLimitRule } from '../validation-rules';

const schema = buildSchema(`
  type Query {
    root: Node!
  }

  type Node {
    child: Node!
    value: String!
  }
`);

describe('createOperationLimitRule', () => {
  it('rejects operations that exceed the maximum depth through fragments', () => {
    const document = parse(`
      query DeepOperation {
        root {
          ...NodeFields
        }
      }

      fragment NodeFields on Node {
        child {
          child {
            value
          }
        }
      }
    `);

    const errors = validate(schema, document, [
      ...specifiedRules,
      createOperationLimitRule({ maxDepth: 3, maxFields: 20 }),
    ]);

    expect(errors).toEqual([
      expect.objectContaining({
        extensions: { code: 'QUERY_DEPTH_LIMIT_EXCEEDED' },
      }),
    ]);
  });

  it('counts repeated aliased fields as query work', () => {
    const document = parse(`
      query WideOperation {
        first: root { value }
        second: root { value }
      }
    `);

    const errors = validate(schema, document, [
      ...specifiedRules,
      createOperationLimitRule({ maxDepth: 5, maxFields: 3 }),
    ]);

    expect(errors).toEqual([
      expect.objectContaining({
        extensions: { code: 'QUERY_COMPLEXITY_LIMIT_EXCEEDED' },
      }),
    ]);
  });

  it('accepts bounded operations', () => {
    const document = parse(`
      query BoundedOperation {
        root { value }
      }
    `);

    const errors = validate(schema, document, [
      ...specifiedRules,
      createOperationLimitRule({ maxDepth: 3, maxFields: 3 }),
    ]);

    expect(errors).toEqual([]);
  });
});
