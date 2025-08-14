import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';

const environment = process.env.NODE_ENV || 'development';
const logDir = path.join(process.cwd(), 'logs');

const customFormat = format.combine(
  format.timestamp({ format: undefined }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const logObj: Record<string, unknown> = {
      timestamp,
      level,
      message,
      ...(Object.keys(meta).length ? meta : {}),
    };
    return JSON.stringify(logObj);
  }),
);

const consoleFormat = format.combine(
  format.colorize(),
  format.printf(
    ({
      level,
      message,
      ...meta
    }: {
      level: string;
      message: string;
      [key: string]: unknown;
    }) => {
      const date = new Date();
      const { timestamp: _timestamp, ...metaWithoutTimestamp } = meta;
      const localeTime = date.toLocaleTimeString('es-MX', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      return `[${localeTime}] ${level}: ${message}${
        Object.keys(metaWithoutTimestamp).length
          ? ' ' + JSON.stringify(metaWithoutTimestamp, null, 2)
          : ''
      }`;
    },
  ),
);

const fileFormat = format.combine(
  format.timestamp({ format: undefined }),
  format.errors({ stack: true }),
  format.splat(),
  format((info) => {
    info.service = 'easystore-backend';
    return info;
  })(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const logObj: Record<string, unknown> = {
      timestamp,
      level,
      message,
      ...(Object.keys(meta).length ? meta : {}),
    };
    return JSON.stringify(logObj);
  }),
);

const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: environment === 'production' ? 'info' : 'debug',
  format: fileFormat,
}) as TransportStream;

const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
}) as TransportStream;

const winstonLogger = createLogger({
  level: environment === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [fileRotateTransport, errorFileRotateTransport],
  exitOnError: false,
});

winstonLogger.add(
  new transports.Console({
    format: consoleFormat,
    level: environment === 'production' ? 'info' : 'debug',
  }),
);

@Injectable()
export class LoggerService implements NestLoggerService {
  private formatMeta(meta: unknown[]): string {
    if (!meta || meta.length === 0) return '';
    return meta
      .map((item) => {
        if (typeof item === 'object') {
          try {
            return JSON.stringify(item, null, 2);
          } catch {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            return String(item);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return String(item);
      })
      .join(' ');
  }

  log(message: string, ...meta: unknown[]): void {
    if (meta.length > 0) {
      winstonLogger.info(`${message} ${this.formatMeta(meta)}`);
    } else {
      winstonLogger.info(message);
    }
  }

  error(message: string, ...meta: unknown[]): void {
    if (meta.length > 0) {
      winstonLogger.error(`${message} ${this.formatMeta(meta)}`);
    } else {
      winstonLogger.error(message);
    }
  }

  warn(message: string, ...meta: unknown[]): void {
    if (meta.length > 0) {
      winstonLogger.warn(`${message} ${this.formatMeta(meta)}`);
    } else {
      winstonLogger.warn(message);
    }
  }

  debug?(message: string, ...meta: unknown[]): void {
    if (meta.length > 0) {
      winstonLogger.debug(`${message} ${this.formatMeta(meta)}`);
    } else {
      winstonLogger.debug(message);
    }
  }

  verbose?(message: string, ...meta: unknown[]): void {
    if (meta.length > 0) {
      winstonLogger.verbose(`${message} ${this.formatMeta(meta)}`);
    } else {
      winstonLogger.verbose(message);
    }
  }
}
