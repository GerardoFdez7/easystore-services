import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { z } from 'zod';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import {
  DatabaseOperationError,
  ResourceNotFoundError,
} from '@shared/infrastructure/postgres';
import { PublicBadRequestException } from '@shared/application/exceptions/public-bad-request.exception';
import { formatGraphqlError } from '../error-formatter';

function wrapResolverError(error: Error): GraphQLError {
  return new GraphQLError(error.message, {
    originalError: error,
    path: ['operation'],
  });
}

const formattedError: GraphQLFormattedError = {
  message: 'sensitive original message',
  path: ['operation'],
  extensions: { code: 'INTERNAL_SERVER_ERROR', stacktrace: ['secret'] },
};

describe('formatGraphqlError', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps authentication failures without exposing the original message', () => {
    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(new UnauthorizedException('cookie token expired')),
    );

    expect(result).toEqual({
      message: 'Authentication required',
      locations: undefined,
      path: ['operation'],
      extensions: { code: 'UNAUTHENTICATED' },
    });
  });

  it('maps invalid input and tenant-safe not-found failures to stable responses', () => {
    const badInput = formatGraphqlError(
      formattedError,
      wrapResolverError(new BadRequestException('invalid internal field')),
    );
    const notFound = formatGraphqlError(
      formattedError,
      wrapResolverError(
        new ResourceNotFoundError('Warehouse', 'another-tenant-id'),
      ),
    );

    expect(badInput).toMatchObject({
      message: 'Invalid request',
      extensions: { code: 'BAD_USER_INPUT' },
    });
    expect(notFound).toMatchObject({
      message: 'Resource not found',
      extensions: { code: 'NOT_FOUND' },
    });
  });

  it('exposes the message of client-safe bad requests', () => {
    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(new PublicBadRequestException('Domain is required')),
    );

    expect(result).toMatchObject({
      message: 'Domain is required',
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('exposes Zod validation issues as bad user input', () => {
    const parsed = z.object({ email: z.email() }).safeParse({ email: 'x' });
    if (parsed.success) throw new Error('expected a Zod failure');

    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(parsed.error),
    );

    expect(result).toMatchObject({
      message: expect.stringContaining('email:') as string,
      extensions: { code: 'BAD_USER_INPUT' },
    });
    expect(Logger.prototype.error).not.toHaveBeenCalled();
  });

  it('logs the original stack for unexpected failures without exposing it', () => {
    const failure = new Error('boom secret');

    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(failure),
    );

    expect(result).toMatchObject({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Unexpected GraphQL execution failure',
      failure.stack,
    );
  });

  it('keeps original messages and stacktraces when exposeDetails is on', () => {
    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(new Error('boom secret')),
      { exposeDetails: true },
    );

    expect(result).toMatchObject({
      message: 'sensitive original message',
      extensions: { code: 'INTERNAL_SERVER_ERROR', stacktrace: ['secret'] },
    });
  });

  it('masks database details without logging the same failure again', () => {
    const databaseError = new DatabaseOperationError(
      'find',
      'SELECT secret FROM customer',
      new Error('database credential leaked'),
    );

    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(databaseError),
    );

    expect(result).toMatchObject({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(Logger.prototype.error).not.toHaveBeenCalled();
  });

  it('masks internal HTTP exception details without logging the same failure again', () => {
    const result = formatGraphqlError(
      formattedError,
      wrapResolverError(
        new InternalServerErrorException('upstream credential leaked'),
      ),
    );

    expect(result).toMatchObject({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
    expect(JSON.stringify(result)).not.toContain('credential');
    expect(Logger.prototype.error).not.toHaveBeenCalled();
  });

  it('preserves safe GraphQL validation failures without extra extensions', () => {
    const validationError = new GraphQLError('Operation is too deep', {
      extensions: { code: 'QUERY_DEPTH_LIMIT_EXCEEDED', detail: 'private' },
    });

    const result = formatGraphqlError(
      validationError.toJSON(),
      validationError,
    );

    expect(result).toEqual({
      message: 'Operation is too deep',
      locations: undefined,
      path: undefined,
      extensions: { code: 'QUERY_DEPTH_LIMIT_EXCEEDED' },
    });
  });
});
