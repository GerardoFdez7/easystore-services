import { ArgsType, Field, Int } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';

export const maxPaginationPage = 10_000;
export const maxPaginationLimit = 100;

export function assertPagination(
  page: number | undefined,
  limit: number | undefined,
): void {
  if (
    page !== undefined &&
    (!Number.isSafeInteger(page) || page < 1 || page > maxPaginationPage)
  ) {
    throw new BadRequestException(
      `page must be an integer between 1 and ${maxPaginationPage}`,
    );
  }
  if (
    limit !== undefined &&
    (!Number.isSafeInteger(limit) || limit < 1 || limit > maxPaginationLimit)
  ) {
    throw new BadRequestException(
      `limit must be an integer between 1 and ${maxPaginationLimit}`,
    );
  }
}

@ArgsType()
export class PaginationArgs {
  private _page?: number;
  private _limit?: number;

  @Field(() => Int, { defaultValue: 1, nullable: true })
  get page(): number | undefined {
    return this._page;
  }

  set page(value: number | undefined) {
    assertPagination(value, undefined);
    this._page = value;
  }

  @Field(() => Int, { defaultValue: 10, nullable: true })
  get limit(): number | undefined {
    return this._limit;
  }

  set limit(value: number | undefined) {
    assertPagination(undefined, value);
    this._limit = value;
  }
}

@ArgsType()
export class NamedPaginationArgs extends PaginationArgs {
  @Field(() => String, { nullable: true })
  name?: string;
}
