import { ArgsOptions, Int, ReturnTypeFunc } from '@nestjs/graphql';

export function pageArg(defaultValue: number): ArgsOptions {
  return {
    defaultValue,
    nullable: true,
    type: () => Int,
  };
}

export function optionalArg(type: ReturnTypeFunc): ArgsOptions {
  return {
    nullable: true,
    type,
  };
}
