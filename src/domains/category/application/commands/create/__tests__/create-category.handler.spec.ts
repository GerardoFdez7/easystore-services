/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { CategoryMapper } from '../../../mappers';
import { CreateCategoryDTO } from '../create-category.dto';
import { CreateCategoryHandler } from '../create-category.handler';

describe('CreateCategoryHandler', () => {
  const category = { commit: jest.fn() };
  const dto = { id: 'category-1', name: 'Office' };
  const repository = { create: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const data = { name: 'Office', tenantId: 'tenant-1' };
  let handler: CreateCategoryHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new CreateCategoryHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    jest
      .spyOn(CategoryMapper, 'fromCreateDto')
      .mockReturnValue(category as never);
    jest.spyOn(CategoryMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(category);
  });

  it('creates, persists, commits, and maps a tenant category', async () => {
    const command = new CreateCategoryDTO(data as never);

    await expect(handler.execute(command)).resolves.toBe(dto);
    expect(CategoryMapper.fromCreateDto).toHaveBeenCalledWith(data);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(category);
    expect(repository.create).toHaveBeenCalledWith(category);
    expect(category.commit).toHaveBeenCalledTimes(1);
    expect(CategoryMapper.toDto).toHaveBeenCalledWith(category);
    expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(
      category.commit.mock.invocationCallOrder[0],
    );
  });

  it('does not persist when domain validation rejects the category', async () => {
    const error = new Error('Category name is required');
    jest.spyOn(CategoryMapper, 'fromCreateDto').mockImplementationOnce(() => {
      throw error;
    });

    await expect(
      handler.execute(new CreateCategoryDTO({ ...data, name: '' } as never)),
    ).rejects.toBe(error);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('does not commit or map a result when persistence fails', async () => {
    const error = new Error('duplicate category');
    repository.create.mockRejectedValueOnce(error);

    await expect(
      handler.execute(new CreateCategoryDTO(data as never)),
    ).rejects.toBe(error);
    expect(category.commit).not.toHaveBeenCalled();
    expect(CategoryMapper.toDto).not.toHaveBeenCalled();
  });
});
