import { AggregateRoot } from '@nestjs/cqrs';
import { Mapper } from './mapper';

// Type for entity constructor
export type EntityConstructor<
  T extends EntityProps,
  E extends Entity<T>,
> = new (props: T) => E;

// Type for entity properties
export interface EntityProps {
  [key: string]: unknown;
}

/**
 * Base class for all domain entities
 * Provides common functionality and type safety with generics
 */
export abstract class Entity<T extends EntityProps>
  extends AggregateRoot
  implements Record<string, unknown>
{
  protected readonly props: T;

  constructor(props: T) {
    super();
    this.props = props;
  }

  /**
   * Maps a persistence model to a domain entity
   * @param EntityClass The entity class constructor
   * @param persistenceModel The persistence model to map from
   * @param mappingFn Mapping function to convert persistence model to entity props
   * @returns The mapped domain entity
   */
  static fromPersistence<P, T extends EntityProps, E extends Entity<T>>(
    EntityClass: EntityConstructor<T, E>,
    persistenceModel: P,
    mappingFn: (model: P) => T,
  ): E {
    return Mapper.fromPersistence(EntityClass, persistenceModel, mappingFn);
  }

  /**
   * Get a property value
   * @param prop The property name to get
   * @returns The property value
   */
  protected getProp<K extends keyof T>(prop: K): T[K] {
    return this.props[prop];
  }

  /**
   * Generic getter for any property
   * Replaces the need for individual getters in entity classes
   * @param prop The property name to get
   * @returns The property value
   */
  get<K extends keyof T>(prop: K): T[K] {
    return this.props[prop];
  }

  /**
   * Maps this entity to a DTO
   * @param mappingFn Optional custom mapping function
   * @returns The mapped DTO
   */
  toDTO<U>(mappingFn?: (entity: this) => U): U {
    return Mapper.toDTO<this, U>(this, mappingFn);
  }

  /**
   * Implementation of Record<string, unknown> interface
   * Allows the entity to be treated as a key-value object
   */
  [key: string]: unknown;
}
