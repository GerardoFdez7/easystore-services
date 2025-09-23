export { Id, IdSchema } from './id.vo';
export { Name } from './name.vo';
export { Media } from './media.vo';
export { ShortDescription } from './short-description.vo';
export { MediumDescription } from './medium-description.vo';
export { LongDescription } from './long-description.vo';
export { PhoneNumber } from './phone-number.vo';
export enum SortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
}
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
