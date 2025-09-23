import { Entity, EntityProps, IAddressBase } from '../';
import {
  AddressCreatedEvent,
  AddressDeletedEvent,
  AddressUpdatedEvent,
} from '../../events';
import {
  Id,
  Name,
  AddressLine1,
  AddressLine2,
  PostalCode,
  PhoneNumber,
  AddressType,
  City,
  ShortDescription,
} from '../../value-objects';

export interface IAddressProps extends EntityProps {
  id: Id;
  name: Name;
  addressLine1: AddressLine1;
  addressLine2?: AddressLine2;
  postalCode: PostalCode;
  city: City;
  countryId: Id;
  stateId: Id;
  addressType: AddressType;
  deliveryNum: PhoneNumber;
  deliveryInstructions?: ShortDescription;
  tenantId?: Id;
  customerId?: Id;
}

export class Address extends Entity<IAddressProps> {
  private constructor(props: IAddressProps) {
    super(props);
  }

  static reconstitute(props: IAddressProps): Address {
    const address = new Address(props);
    return address;
  }

  /**
   * Factory method to create a new Address
   * @param props - Properties required to create an Address
   * @returns The created Address domain entity
   */
  static create(props: IAddressBase): Address {
    const transformedProps = {
      name: Name.create(props.name),
      addressLine1: AddressLine1.create(props.addressLine1),
      addressLine2: props.addressLine2
        ? AddressLine2.create(props.addressLine2)
        : null,
      postalCode: PostalCode.create(props.postalCode),
      city: City.create(props.city),
      countryId: Id.create(props.countryId),
      stateId: Id.create(props.stateId),
      addressType: AddressType.create(props.addressType),
      deliveryNum: PhoneNumber.create(props.deliveryNum),
      deliveryInstructions: props.deliveryInstructions
        ? ShortDescription.create(props.deliveryInstructions)
        : null,
      tenantId: props.tenantId ? Id.create(props.tenantId) : null,
      customerId: props.customerId ? Id.create(props.customerId) : null,
    };

    const address = new Address({
      id: Id.generate(),
      ...transformedProps,
    });

    //Aply domain event
    address.apply(new AddressCreatedEvent(address));

    return address;
  }

  /**
   * Factory method to update an new Address
   * @param address - The Address to update
   * @param updates - The updated properties
   * @returns The updated Address domain entity
   */
  static update(
    address: Address,
    updates: Partial<Omit<IAddressBase, 'tenantId' | 'customerId'>>,
  ): Address {
    const props = { ...address.props };

    if (updates.name !== undefined) {
      props.name = Name.create(updates.name);
    }

    if (updates.addressLine1 !== undefined) {
      props.addressLine1 = AddressLine1.create(updates.addressLine1);
    }

    if (updates.addressLine2 !== undefined) {
      props.addressLine2 = AddressLine2.create(updates.addressLine2);
    }

    if (updates.postalCode !== undefined) {
      props.postalCode = PostalCode.create(updates.postalCode);
    }

    if (updates.city !== undefined) {
      props.city = City.create(updates.city);
    }

    if (updates.countryId !== undefined) {
      props.countryId = Id.create(updates.countryId);
    }

    if (updates.stateId !== undefined) {
      props.stateId = Id.create(updates.stateId);
    }

    if (updates.addressType !== undefined) {
      props.addressType = AddressType.create(updates.addressType);
    }

    if (updates.deliveryNum !== undefined) {
      props.deliveryNum = PhoneNumber.create(updates.deliveryNum);
    }

    if (updates.deliveryInstructions !== undefined) {
      props.deliveryInstructions = ShortDescription.create(
        updates.deliveryInstructions,
      );
    }

    const updateAddress = new Address(props);

    //Apply domain event
    updateAddress.apply(new AddressUpdatedEvent(updateAddress));
    return updateAddress;
  }

  /**
   * Factory method to delete a new Address
   * @param address The address to delete
   * @returns The deleted address
   */
  static delete(address: Address): Address {
    //Apply domain event
    address.apply(new AddressDeletedEvent(address));
    return address;
  }
}
