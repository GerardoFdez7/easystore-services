import { AggregateRoot } from '@nestjs/cqrs';
import { ClientCreatedEvent } from '../events/client-created.event';
import {
  BusinessName,
  Email,
  Id,
  OwnerName,
  Password,
} from '../value-objects/index';

export class Client extends AggregateRoot {
  private readonly id: Id;
  private readonly businessName: BusinessName;
  private readonly ownerName: OwnerName;
  private readonly email: Email;
  private readonly password: Password;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(
    id: Id,
    businessName: BusinessName,
    ownerName: OwnerName,
    email: Email,
    password: Password,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.businessName = businessName;
    this.ownerName = ownerName;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method to create a new client
  static create(
    businessNameStr: string,
    ownerNameStr: string,
    emailStr: string,
    passwordStr: string,
  ): Client {
    const businessName = BusinessName.create(businessNameStr);
    const ownerName = OwnerName.create(ownerNameStr);
    const email = Email.create(emailStr);
    const password = Password.create(passwordStr);

    const client = new Client(
      null, // ID will be assigned by the database
      businessName,
      ownerName,
      email,
      password,
      new Date(),
      new Date(),
    );

    // Apply domain event
    client.apply(new ClientCreatedEvent(client));

    return client;
  }

  // Getters
  getId(): Id {
    return this.id;
  }

  getBusinessName(): BusinessName {
    return this.businessName;
  }

  getOwnerName(): OwnerName {
    return this.ownerName;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Domain logic methods would go here
}
