/* eslint-disable */
import { LoggerModule } from 'nestjs-pino';
import * as pino from 'pino';
import * as path from 'path';

export const LoggerConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const logDir = path.join(process.cwd(), 'logs');

  // Create date-based filename
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const appLogFile = path.join(logDir, `app-${today}.log`);
  const errorLogFile = path.join(logDir, `error-${today}.log`);

  // Create multistream for both development and production
  const streams = [
    // Main log file
    {
      level: 'info',
      stream: pino.destination({
        dest: appLogFile,
        mkdir: true,
        sync: false,
      }),
    },
    // Error log file
    {
      level: 'error',
      stream: pino.destination({
        dest: errorLogFile,
        mkdir: true,
        sync: false,
      }),
    },
  ];

  // Create multistream configuration for both console and file logging
  const multistreams = [
    ...streams, // File streams
  ];

  // Add console stream for development
  if (isDevelopment) {
    multistreams.push({
      level: 'debug',
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:h:MM:ss TT',
          ignore: 'pid,hostname,context,req,res',
          messageFormat: '\x1b[37m{msg}\x1b[0m',
          levelFirst: false,
          hideObject: true,
          singleLine: false,
          colorizeObjects: false,
        },
      }),
    });
  }

  return LoggerModule.forRoot({
    pinoHttp: {
      level: isDevelopment ? 'debug' : 'info',
      stream: pino.multistream(multistreams),
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
      // Remove service information from base
      base: {
        service: 'easystore-backend',
      },
      // Disable auto logging to reduce noise
      autoLogging: false,
    },
  });
};
