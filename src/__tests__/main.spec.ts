import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { bootstrap } from '../main';
import { assertFeatureCatalogSeeded } from '@database/seeders/production.seed';
import { getPinoLogger } from '@config/logger';

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));
jest.mock('../app.module', () => ({ AppModule: class AppModule {} }));
jest.mock('@config/logger', () => ({
  CustomLoggerService: class CustomLoggerService {},
  getPinoLogger: jest.fn(),
  initializeGlobalLogger: jest.fn(),
}));
jest.mock('@database/seeders/production.seed', () => ({
  assertFeatureCatalogSeeded: jest.fn(),
}));

describe('application startup', () => {
  const originalExitCode = process.exitCode;
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  const logger = { fatal: jest.fn(), info: jest.fn() };
  const configService = {
    get: jest.fn().mockReturnValue('production'),
    getOrThrow: jest.fn().mockReturnValue('http://localhost'),
  };

  beforeEach(() => {
    process.exitCode = undefined;
    jest.clearAllMocks();
    (getPinoLogger as jest.Mock).mockReturnValue(logger);
    (assertFeatureCatalogSeeded as jest.Mock).mockRejectedValue(
      new Error('catalog is not seeded'),
    );
  });

  afterAll(() => {
    process.exitCode = originalExitCode;
    consoleError.mockRestore();
  });

  it('closes the application when initialization fails', async () => {
    const app = {
      get: jest.fn((token: unknown) =>
        token === ConfigService ? configService : {},
      ),
      close: jest.fn().mockResolvedValue(undefined),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    await bootstrap();

    expect(app.close).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(1);
  });
});
