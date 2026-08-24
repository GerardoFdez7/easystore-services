/** Identifies whether a process is running with development configuration. */
export function isDevelopmentEnvironment(
  environment: NodeJS.ProcessEnv,
): boolean {
  return environment.NODE_ENV === 'development';
}
