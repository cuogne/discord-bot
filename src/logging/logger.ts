import pino from 'pino';

const environment = process.env.NODE_ENV?.trim() || 'development';
const isDev = environment !== 'production';

function serializeError(error: unknown): unknown {
  if (!(error instanceof Error)) {
    return error;
  }

  const serialized: Record<string, unknown> = {
    type: error.name,
    message: error.message,
    stack: error.stack,
  };

  if ('cause' in error && error.cause) {
    serialized.cause = serializeError(error.cause);
  }

  return serialized;
}

export const logger = pino({
  level: process.env.LOG_LEVEL?.trim() || 'info',
  base: {
    service: 'bot-discord',
    environment,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: serializeError,
  },
  redact: {
    paths: [
      '*.token',
      '*.apiKey',
      '*.api_key',
      '*.authorization',
      '*.password',
      '*.secret',
      '*.MONGO_URI',
    ],
    censor: '[REDACTED]',
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:dd/mm/yyyy HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});
