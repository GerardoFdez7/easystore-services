/**
 * Interface for objects with getValue method
 */
interface ValueObject {
  getValue(): unknown;
}

/**
 * Type guard to check if an object is a value object with getValue method
 */
function isValueObject(obj: unknown): obj is ValueObject {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    'getValue' in obj &&
    typeof (obj as ValueObject).getValue === 'function'
  );
}

/**
 * Generic mapper utility for converting domain entities to DTOs and vice versa
 */
export class Mapper {
  /**
   * Maps a domain entity to a DTO
   * @param entity The domain entity to map
   * @param mappingFn Optional custom mapping function
   * @returns The mapped DTO
   */
  static toDTO<T extends Record<string, unknown>, U>(
    entity: T,
    mappingFn?: (entity: T) => U,
  ): U {
    if (mappingFn) {
      return mappingFn(entity);
    }

    const entries = Object.entries(entity)
      .filter(([, prop]) => typeof prop !== 'function')
      .map(([key, prop]) => [
        key,
        isValueObject(prop) ? prop.getValue() : prop,
      ]);

    return Object.fromEntries(entries) as U;
  }

  /**
   * Maps a DTO to a domain entity
   * @param Model The entity class constructor
   * @param dto The DTO to map from
   * @param mappingFn Optional custom mapping function
   * @returns The mapped domain entity
   */
  static fromDTO<T, U>(
    Model: new (props: unknown) => U,
    dto: T,
    mappingFn?: (dto: T) => unknown,
  ): U {
    if (mappingFn) {
      const props = mappingFn(dto);
      return new Model(props);
    }

    // Default implementation would need to be customized per entity
    // This is a placeholder that should be overridden by entity-specific static methods
    throw new Error(
      'Default mapping not implemented. Please provide a mapping function.',
    );
  }

  /**
   * Maps a persistence model to a domain entity
   * @param Model The entity class constructor
   * @param persistenceModel The persistence model to map from
   * @param mappingFn Optional custom mapping function
   * @returns The mapped domain entity
   */
  static fromPersistence<T, U>(
    Model: new (props: unknown) => U,
    persistenceModel: T,
    mappingFn?: (model: T) => unknown,
  ): U {
    if (mappingFn) {
      const props = mappingFn(persistenceModel);
      return new Model(props);
    }

    // Default implementation would need to be customized per entity
    // This is a placeholder that should be overridden by entity-specific static methods
    throw new Error(
      'Default mapping not implemented. Please provide a mapping function.',
    );
  }
}
