/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { CategoryMapper } from '../../../mappers';
import { findCategoryOrThrow } from '../../shared/find-category-or-throw';
import { UpdateCategoryDTO } from '../update-category.dto';
import { UpdateCategoryHandler } from '../update-category.handler';

jest.mock('../../shared/find-category-or-throw', () => ({
  findCategoryOrThrow: jest.fn(),
}));

describe('UpdateCategoryHandler', () => {
  const categoryId = '0198b746-8c72-7a2f-9c31-6d4f9866f312';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f313';
  const category = { id: categoryId };
  const updatedCategory = { commit: jest.fn() };
  const dto = { id: categoryId, name: 'Updated office' };
  const repository = { update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new UpdateCategoryDTO(categoryId, tenantId, {
    name: 'Updated office',
  });
  let handler: UpdateCategoryHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateCategoryHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findCategoryOrThrow as jest.Mock).mockResolvedValue(category);
    jest
      .spyOn(CategoryMapper, 'fromUpdateDto')
      .mockReturnValue(updatedCategory as never);
    jest.spyOn(CategoryMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(updatedCategory);
  });

  it('updates a category within its tenant boundary and returns the updated DTO', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findCategoryOrThrow).toHaveBeenCalledWith(
      repository,
      expect.objectContaining({ value: categoryId }),
      expect.objectContaining({ value: tenantId }),
    );
    expect(CategoryMapper.fromUpdateDto).toHaveBeenCalledWith(
      category,
      command,
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: categoryId }),
      expect.objectContaining({ value: tenantId }),
      updatedCategory,
    );
    expect(updatedCategory.commit).toHaveBeenCalledTimes(1);
    expect(CategoryMapper.toDto).toHaveBeenCalledWith(updatedCategory);
  });

  it('supports an empty patch while retaining tenant scoping', async () => {
    const emptyPatch = new UpdateCategoryDTO(categoryId, tenantId, {});

    await handler.execute(emptyPatch);

    expect(CategoryMapper.fromUpdateDto).toHaveBeenCalledWith(
      category,
      emptyPatch,
    );
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('does not map or persist when the category is missing', async () => {
    const error = new Error('Category not found');
    (findCategoryOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(CategoryMapper.fromUpdateDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not commit when persistence fails', async () => {
    const error = new Error('update conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(updatedCategory.commit).not.toHaveBeenCalled();
    expect(CategoryMapper.toDto).not.toHaveBeenCalled();
  });
});
