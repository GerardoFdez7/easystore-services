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

    // Default mapping for entities with getValue() methods on their properties
    const dto = {} as Record<string, unknown>;

    // Get all properties from the entity
    for (const key in entity) {
      if (Object.prototype.hasOwnProperty.call(entity, key)) {
        const prop = entity[key];

        // If the property has a getValue method, use it
        if (isValueObject(prop)) {
          dto[key] = prop.getValue();
        } else if (typeof prop !== 'function') {
          // Otherwise use the property value directly (if it's not a method)
          dto[key] = prop;
        }
      }
    }

    return dto as U;
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
