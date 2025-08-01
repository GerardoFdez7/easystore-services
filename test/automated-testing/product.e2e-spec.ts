import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('Product Module (e2e) - GraphQL', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create a product (GraphQL Mutation)', async () => {
    const mutation = `
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          name
          shortDescription
          productType
          tenantId
        }
      }
    `;

    const variables = {
      input: {
        name: 'Producto de prueba 3',
        shortDescription: 'Descripción corta',
        productType: 'PHYSICAL',
        tenantId: '018e3e9a-8b2a-7cd2-bc1a-8c3e5a1f9b2d',
        variants: [],
      },
    };

    const response = await request(app.getHttpServer()).post('/gql').send({
      query: mutation,
      variables,
    });

    //console.log(JSON.stringify(response.body, null, 2));

    type CreateProductResponse = {
      data: {
        createProduct: {
          name: string;
          shortDescription: string;
          productType: string;
          tenantId: string;
        };
      };
    };

    const body = response.body as CreateProductResponse;

    expect(body.data.createProduct.name).toBe('Producto de prueba 3');
    expect(body.data.createProduct.shortDescription).toBe('Descripción corta');
    expect(body.data.createProduct.tenantId).toBe(
      '018e3e9a-8b2a-7cd2-bc1a-8c3e5a1f9b2d',
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
