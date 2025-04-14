import { createLogger, transports, format } from 'winston';
import * as path from 'path';

const logDir = 'logs';

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info',
    }),
  ],
});

export default logger;
