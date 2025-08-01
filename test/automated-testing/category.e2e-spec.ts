import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('Category Module (e2e) - GraphQL', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create a category (GraphQL Mutation)', async () => {
    const mutation = `
      mutation CreateCategory($input: CreateCategoryInput!) {
        createCategory(input: $input) {
          name
          description
          cover
          tenantId
        }
      }
    `;

    const variables = {
      input: {
        name: 'Categoría de prueba',
        description: 'Descripción de la categoría',
        cover: 'https://ejemplo.com/cover.jpg',
        tenantId: '018e3e9a-8b2a-7cd2-bc1a-8c3e5a1f9b2d',
      },
    };

    const response = await request(app.getHttpServer()).post('/gql').send({
      query: mutation,
      variables,
    });

    //console.log(JSON.stringify(response.body, null, 2));

    type CreateCategorytResponse = {
      data: {
        createCategory: {
          name: string;
          description: string;
          cover: string;
          tenantId: string;
        };
      };
    };

    const body = response.body as CreateCategorytResponse;

    expect(body.data.createCategory.name).toBe('Categoría de prueba');
    expect(body.data.createCategory.description).toBe(
      'Descripción de la categoría',
    );
    expect(body.data.createCategory.tenantId).toBe(
      '018e3e9a-8b2a-7cd2-bc1a-8c3e5a1f9b2d',
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
