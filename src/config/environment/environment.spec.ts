import { isDevelopmentEnvironment } from './environment';

describe('isDevelopmentEnvironment', () => {
  it('only identifies the development environment', () => {
    expect(isDevelopmentEnvironment({ NODE_ENV: 'development' })).toBe(true);
    expect(isDevelopmentEnvironment({ NODE_ENV: 'production' })).toBe(false);
    expect(isDevelopmentEnvironment({})).toBe(false);
  });
});
