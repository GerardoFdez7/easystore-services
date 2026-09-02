import { CustomScalar, Scalar } from '@nestjs/graphql';
import { GraphQLError, Kind, ValueNode } from 'graphql';
import { Money } from '@shared/aggregates/value-objects';

/** Runtime marker used to associate GraphQL fields with the Decimal scalar. */
export abstract class DecimalValue {}

/** Exact decimal scalar serialized as a canonical JSON string. */
@Scalar('Decimal', () => DecimalValue)
export class DecimalScalar implements CustomScalar<string, string> {
  description =
    'An exact canonical decimal string without exponent notation, such as "123.45".';

  serialize(value: unknown): string {
    return this.normalize(value);
  }

  parseValue(value: unknown): string {
    return this.normalize(value);
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('Decimal values must be strings.');
    }

    return this.normalize(ast.value);
  }

  private normalize(value: unknown): string {
    if (typeof value !== 'string') {
      throw new GraphQLError('Decimal values must be strings.');
    }

    try {
      return Money.normalizeAmount(value);
    } catch {
      throw new GraphQLError('Invalid decimal value.');
    }
  }
}
