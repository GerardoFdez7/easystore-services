import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class ClientResolver {
  @Query(() => String)
  client(): string {
    return 'Hi Client';
  }
}
