/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { CategoryMapper } from '../../../mappers';
import { findCategoryOrThrow } from '../../shared/find-category-or-throw';
import { DeleteCategoryDTO } from '../delete-category.dto';
import { DeleteCategoryHandler } from '../delete-category.handler';

jest.mock('../../shared/find-category-or-throw', () => ({
  findCategoryOrThrow: jest.fn(),
}));

describe('DeleteCategoryHandler', () => {
  const categoryId = '0198b746-8c72-7a2f-9c31-6d4f9866f312';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f313';
  const category = { id: categoryId };
  const deletedCategory = { commit: jest.fn() };
  const dto = { id: categoryId };
  const repository = { delete: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new DeleteCategoryDTO(categoryId, tenantId);
  let handler: DeleteCategoryHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new DeleteCategoryHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findCategoryOrThrow as jest.Mock).mockResolvedValue(category);
    jest
      .spyOn(CategoryMapper, 'fromDeleteDto')
      .mockReturnValue(deletedCategory as never);
    jest.spyOn(CategoryMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(deletedCategory);
  });

  it('deletes only the category in the requested tenant and publishes its event', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findCategoryOrThrow).toHaveBeenCalledWith(
      repository,
      expect.objectContaining({ value: categoryId }),
      expect.objectContaining({ value: tenantId }),
    );
    expect(CategoryMapper.fromDeleteDto).toHaveBeenCalledWith(category);
    expect(repository.delete).toHaveBeenCalledWith(
      expect.objectContaining({ value: categoryId }),
      expect.objectContaining({ value: tenantId }),
    );
    expect(deletedCategory.commit).toHaveBeenCalledTimes(1);
    expect(CategoryMapper.toDto).toHaveBeenCalledWith(category);
  });

  it('does not delete when the tenant-scoped category is missing', async () => {
    const error = new Error('Category not found');
    (findCategoryOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(CategoryMapper.fromDeleteDto).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('does not commit when repository deletion fails', async () => {
    const error = new Error('category is referenced by a product');
    repository.delete.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(deletedCategory.commit).not.toHaveBeenCalled();
    expect(CategoryMapper.toDto).not.toHaveBeenCalled();
  });
});
