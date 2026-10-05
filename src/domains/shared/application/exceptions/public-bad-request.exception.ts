import { BadRequestException } from '@nestjs/common';

/**
 * Bad request whose message is safe to show to API clients.
 * The GraphQL error formatter passes the message through instead of masking it.
 */
export class PublicBadRequestException extends BadRequestException {}
