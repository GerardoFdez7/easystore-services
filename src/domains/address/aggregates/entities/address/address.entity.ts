import { Entity, EntityProps, IAddressBase } from '../';
import { AddressCreatedEvent } from '../../events';
import {
  Id,
  Name,
  AddressLine1,
  AddressLine2,
  PostalCode,
  DeliveryNum,
  AddressType,
  City,
} from '../../value-objects';

export interface IAddressProps extends EntityProps {
  id: Id;
  name: Name;
  addressLine1: AddressLine1;
  addressLine2?: AddressLine2;
  postalCode?: PostalCode;
  city: City;
  countryId: Id;
  addressType: AddressType;
  deliveryNum?: DeliveryNum;
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
      postalCode: props.postalCode ? PostalCode.create(props.postalCode) : null,
      city: City.create(props.city),
      countryId: Id.create(props.countryId),
      addressType: AddressType.create(props.addressType),
      deliveryNum: props.deliveryNum
        ? DeliveryNum.create(props.deliveryNum)
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
}
