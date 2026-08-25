import { HttpException, Logger } from '@nestjs/common';
import { unwrapResolverError } from '@apollo/server/errors';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { DomainError } from '@shared/errors';

interface PublicErrorClassification {
  code: string;
  message: string;
}

const protocolErrorCodes = new Set([
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'OPERATION_RESOLUTION_FAILURE',
  'BAD_REQUEST',
  'PERSISTED_QUERY_NOT_FOUND',
  'PERSISTED_QUERY_NOT_SUPPORTED',
  'QUERY_DEPTH_LIMIT_EXCEEDED',
  'QUERY_COMPLEXITY_LIMIT_EXCEEDED',
]);

const graphqlLogger = new Logger('GraphqlErrorFormatter');

function classifyHttpException(
  error: HttpException,
): PublicErrorClassification {
  const status = error.getStatus();

  switch (status) {
    case 401:
      return { code: 'UNAUTHENTICATED', message: 'Authentication required' };
    case 403:
      return { code: 'FORBIDDEN', message: 'Operation not permitted' };
    case 404:
      return { code: 'NOT_FOUND', message: 'Resource not found' };
    case 409:
      return { code: 'CONFLICT', message: 'Resource already exists' };
    case 429:
      return { code: 'RATE_LIMITED', message: 'Too many requests' };
    default:
      return status >= 500
        ? { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }
        : { code: 'BAD_USER_INPUT', message: 'Invalid request' };
  }
}

function classifyDomainError(error: DomainError): PublicErrorClassification {
  switch (error.code) {
    case 'RESOURCE_NOT_FOUND':
      return { code: 'NOT_FOUND', message: 'Resource not found' };
    case 'UNIQUE_CONSTRAINT_VIOLATION':
      return { code: 'CONFLICT', message: 'Resource already exists' };
    case 'FOREIGN_KEY_CONSTRAINT_VIOLATION':
      return { code: 'BAD_USER_INPUT', message: 'Invalid request' };
    case 'DATABASE_OPERATION_ERROR':
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      };
    default:
      return {
        code: 'BAD_USER_INPUT',
        message: 'Request could not be completed',
      };
  }
}

function classifyGraphqlError(
  error: GraphQLError,
): PublicErrorClassification | undefined {
  const code = error.extensions.code;

  if (typeof code === 'string' && protocolErrorCodes.has(code)) {
    return { code, message: error.message };
  }

  return undefined;
}

function toFormattedError(
  formattedError: GraphQLFormattedError,
  classification: PublicErrorClassification,
): GraphQLFormattedError {
  return {
    message: classification.message,
    locations: formattedError.locations,
    path: formattedError.path,
    extensions: { code: classification.code },
  };
}

export function formatGraphqlError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const originalError = unwrapResolverError(error);

  if (originalError instanceof HttpException) {
    const classification = classifyHttpException(originalError);

    if (classification.code === 'INTERNAL_SERVER_ERROR') {
      graphqlLogger.error('Unexpected GraphQL HTTP failure');
    }

    return toFormattedError(formattedError, classification);
  }

  if (originalError instanceof DomainError) {
    const classification = classifyDomainError(originalError);

    if (classification.code === 'INTERNAL_SERVER_ERROR') {
      graphqlLogger.error(
        'Unexpected GraphQL domain or infrastructure failure',
      );
    }

    return toFormattedError(formattedError, classification);
  }

  if (originalError instanceof GraphQLError) {
    const classification = classifyGraphqlError(originalError);

    if (classification) {
      return toFormattedError(formattedError, classification);
    }
  }

  graphqlLogger.error('Unexpected GraphQL execution failure');

  return toFormattedError(formattedError, {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
}
