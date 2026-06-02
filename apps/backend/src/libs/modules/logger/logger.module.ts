import { type Logger as LibraryLogger, pino } from 'pino';

import { type LoggerModule } from './libs/types/types.js';

const usePrettyTransport = process.env['NODE_ENV'] === 'development';

class Logger implements LoggerModule {
  private logger: LibraryLogger;

  public constructor() {
    this.logger = pino(
      usePrettyTransport
        ? { transport: { target: 'pino-pretty' } }
        : { level: 'info' }
    );

    this.logger.info('Logger is created');
  }

  public debug(
    message: string,
    parameters: Record<string, unknown> = {}
  ): ReturnType<LoggerModule['debug']> {
    this.logger.debug(parameters, message);
  }

  public error(
    message: string,
    parameters: Record<string, unknown> = {}
  ): ReturnType<LoggerModule['error']> {
    this.logger.error(parameters, message);
  }

  public info(
    message: string,
    parameters: Record<string, unknown> = {}
  ): ReturnType<LoggerModule['info']> {
    this.logger.info(parameters, message);
  }

  public warn(
    message: string,
    parameters: Record<string, unknown> = {}
  ): ReturnType<LoggerModule['warn']> {
    this.logger.warn(parameters, message);
  }
}

export { Logger };
