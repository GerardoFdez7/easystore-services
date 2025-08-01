import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('Address Module (e2e) - GraphQL', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create an address (GraphQL Mutation)', async () => {
    const mutation = `
      mutation CreateAddress($input: CreateAddressInput!) {
        createAddress(input: $input) {
          name
          addressLine1
          city
          countryId
        }
      }
    `;

    const variables = {
      input: {
        name: 'Dirección de prueba automatizada',
        addressLine1: 'Calle 123',
        addressLine2: 'Depto 4B',
        postalCode: '12345',
        city: 'Guatemala',
        countryId: '018e3e9a-8b2a-7cd2-bc1a-8c3e5a1f9b2c',
        addressType: 'SHIPPING',
        deliveryNum: '555-1234',
        tenantId: '018e3e9a-8b2a-7cd2-bc1a-8c3e5a1f9b2d',
      },
    };

    const response = await request(app.getHttpServer()).post('/gql').send({
      query: mutation,
      variables,
    });

    //console.log(JSON.stringify(response.body, null, 2));

    type CreateAddressResponse = {
      data: {
        createAddress: {
          name: string;
          addressLine1: string;
          addressLine2: string;
          postalCode: string;
          city: string;
          countryId: string;
          addressType: string;
          deliveryNum: string;
          tenantId: string;
        };
      };
    };

    const body = response.body as CreateAddressResponse;

    expect(body.data.createAddress.name).toBe(
      'Dirección de prueba automatizada',
    );
    expect(body.data.createAddress.addressLine1).toBe('Calle 123');
    expect(body.data.createAddress.city).toBe('Guatemala');
  });

  afterAll(async () => {
    await app.close();
  });
});
