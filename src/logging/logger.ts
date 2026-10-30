import pino from 'pino';

const environment = process.env.NODE_ENV?.trim() || 'development';
const isDev = environment !== 'production';

function getProviderError(message: string): Record<string, string | number> | undefined {
  let value: unknown = message;

  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value) as unknown;
      } catch {
        return undefined;
      }
    }

    if (typeof value !== 'object' || value === null) {
      return undefined;
    }

    if ('error' in value) {
      value = value.error;
      continue;
    }

    if (
      'message' in value &&
      typeof value.message === 'string' &&
      value.message.trim().startsWith('{')
    ) {
      value = value.message;
      continue;
    }

    const details: Record<string, string | number> = {};
    if ('code' in value && typeof value.code === 'number') {
      details.code = value.code;
    }
    if ('status' in value && typeof value.status === 'string') {
      details.status = value.status;
    }
    if ('message' in value && typeof value.message === 'string') {
      details.message = value.message;
    }
    return Object.keys(details).length > 0 ? details : undefined;
  }

  return undefined;
}

function serializeError(error: unknown): unknown {
  if (!(error instanceof Error)) {
    return error;
  }

  const serialized: Record<string, unknown> = {
    type: error.name,
    message: error.message,
    stack: error.stack,
  };

  for (const key of ['code', 'status', 'statusText', 'reason', 'url'] as const) {
    if (key in error) {
      const value = error[key as keyof Error];
      if (typeof value === 'string' || typeof value === 'number') {
        serialized[key] = value;
      }
    }
  }

  if (error.name === 'EspnApiError' && 'body' in error && typeof error.body === 'string') {
    serialized.responseBody = error.body.slice(0, 2000);
  }

  if (
    error.name === 'NekosApiError' &&
    'responseBody' in error &&
    typeof error.responseBody === 'string'
  ) {
    serialized.responseBody = error.responseBody.slice(0, 2000);
  }

  if (error.name === 'ApiError') {
    serialized.providerError = getProviderError(error.message);
  }

  if ('cause' in error && error.cause) {
    serialized.cause = serializeError(error.cause);
  }

  if (error instanceof AggregateError) {
    serialized.errorCount = error.errors.length;
    serialized.errors = error.errors.slice(0, 5).map(serializeError);
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
    replyErr: serializeError,
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
