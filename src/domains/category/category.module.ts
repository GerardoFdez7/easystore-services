import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import {
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
} from './application/commands';
// Query Handlers
import {
  GetCategoryByIdHandler,
  GetAllCategoriesHandler,
  GetCategoriesByIdsHandler,
} from './application/queries';
// Event Handlers
import {
  CategoryCreatedHandler,
  CategoryDeletedHandler,
  CategoryUpdatedHandler,
} from './application/events';
import CategoryRepository from './infrastructure/persistence/postgres/category.repository';
import CategoryResolver from './presentation/graphql/category.resolver';

const CommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];

const QueryHandlers = [
  GetCategoryByIdHandler,
  GetAllCategoriesHandler,
  GetCategoriesByIdsHandler,
];

const EventHandlers = [
  CategoryCreatedHandler,
  CategoryDeletedHandler,
  CategoryUpdatedHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'ICategoryRepository', useClass: CategoryRepository },
    CategoryResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CategoryDomain {}
