import {
  Address,
  IAddressProps,
  IAddressType,
  IAddressBase,
} from '../../../aggregates/entities';
import {
  Id,
  Name,
  AddressLine1,
  AddressLine2,
  PostalCode,
  DeliveryNum,
  AddressType,
  City,
} from '../../../aggregates/value-objects';
import { AddressDTO } from './address.dto';
import { UpdateAddressDTO } from '../../commands';

export class AddressMapper {
  /**
   * Maps a persistence Address moodel to a domain Address entity
   * @param persitenceAddress The Persistence Address model
   * @returns The mapped Address domain entity
   */
  static fromPersistence(persitenceAddress: IAddressType): Address {
    const addressProps: IAddressProps = {
      id: Id.create(persitenceAddress.id),
      name: Name.create(persitenceAddress.name),
      addressLine1: AddressLine1.create(persitenceAddress.addressLine1),
      addressLine2: persitenceAddress.addressLine2
        ? AddressLine2.create(persitenceAddress.addressLine2)
        : null,
      postalCode: persitenceAddress.postalCode
        ? PostalCode.create(persitenceAddress.postalCode)
        : null,
      city: City.create(persitenceAddress.city),
      countryId: Id.create(persitenceAddress.countryId),
      addressType: AddressType.create(persitenceAddress.addressType),
      deliveryNum: persitenceAddress.deliveryNum
        ? DeliveryNum.create(persitenceAddress.deliveryNum)
        : null,
      tenantId: persitenceAddress.tenantId
        ? Id.create(persitenceAddress.tenantId)
        : null,
      customerId: persitenceAddress.customerId
        ? Id.create(persitenceAddress.customerId)
        : null,
    };

    return Address.reconstitute(addressProps);
  }

  /**
   * Maps a Address domain entity to a AddressDTO
   * @param address The address domain entity
   * @returns The address DTO
   */
  static toDto(address: Address): AddressDTO {
    return address.toDTO<AddressDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      name: entity.get('name').getValue(),
      addressLine1: entity.get('addressLine1').getValue(),
      addressLine2: entity.get('addressLine2')?.getValue(),
      postalCode: entity.get('postalCode')?.getValue(),
      city: entity.get('city').getValue(),
      countryId: entity.get('countryId').getValue(),
      addressType: entity.get('addressType').getValue(),
      deliveryNum: entity.get('deliveryNum')?.getValue(),
      tenantId: entity.get('tenantId')?.getValue(),
      customerId: entity.get('customerId')?.getValue(),
    }));
  }

  /**
   * Maps a AddressDTO to a domain entity
   * @param dto The address DTO
   * @returns The mapped Address domain entity
   */
  static fromCreateDto(dto: IAddressBase): Address {
    return Address.create({ ...dto });
  }

  /**
   * Maps a DeleteAddressDTO to hard delete a address
   * @param existingAddress The existing address to hard delete
   * @returns The deleted Address domain entity
   */
  static fromDeleteDto(existingAddress: Address): Address {
    return Address.delete(existingAddress);
  }

  static fromUpdateDto(
    existingAddress: Address,
    dto: UpdateAddressDTO,
  ): Address {
    return Address.update(existingAddress, dto.data);
  }
}
