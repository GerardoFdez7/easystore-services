import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import request from 'supertest';
import { HealthController } from '../src/infrastructure/monitoring/health.controller';

describe('HealthController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with the successful default health result', async () => {
    await request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    });
  });
});
