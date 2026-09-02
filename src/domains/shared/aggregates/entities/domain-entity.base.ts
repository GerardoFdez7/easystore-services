import { Mapper } from '../../application/mappers/mapper';

export interface DomainEntityProps {
  [key: string]: unknown;
}

/**
 * Base class for entities that live inside an aggregate but are not aggregate roots.
 * It deliberately has no CQRS event-publishing behavior.
 */
export abstract class DomainEntity<T extends DomainEntityProps>
  implements Record<string, unknown>
{
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = props;
  }

  get<K extends keyof T>(prop: K): T[K] {
    return this.props[prop];
  }

  getProps(): Readonly<T> {
    return this.props;
  }

  toDTO<U>(mappingFn?: (entity: this) => U): U {
    return Mapper.toDTO<this, U>(this, mappingFn);
  }

  [key: string]: unknown;
}
