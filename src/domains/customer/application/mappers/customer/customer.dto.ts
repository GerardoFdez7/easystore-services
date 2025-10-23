/**
 * Data Transfer Object for Customer entity
 * Used for API responses when creating or retrieving customers
 */
export interface CustomerDTO {
  id: string;
  name: string;
  tenantId: string;
  authIdentityId: string;
  defaultPhoneNumberId?: string | null;
  defaultShippingAddressId?: string | null;
  defaultBillingAddressId?: string | null;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Interface for paginated customer results
 */
export interface PaginatedCustomersDTO {
  customers: CustomerDTO[];
  total: number;
  hasMore: boolean;
}
