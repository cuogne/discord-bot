import { logger } from '../logging/logger.ts';

export type ShutdownCleanup = () => Promise<void>;

async function shutdown(signal: string, cleanup: ShutdownCleanup): Promise<void> {
  logger.info(
    {
      signal,
    },
    'Shutting down bot...',
  );

  try {
    await cleanup();
  } finally {
    process.exit(0);
  }
}

export function registerProcessLifecycle(cleanup: ShutdownCleanup): void {
  process.on('unhandledRejection', (reason) => {
    logger.error(
      {
        err: reason,
      },
      'Unhandled promise rejection',
    );
  });

  process.on('uncaughtException', (error) => {
    logger.fatal(
      {
        err: error,
      },
      'Uncaught exception',
    );
    process.exit(1);
  });

  process.on('SIGINT', () => void shutdown('SIGINT', cleanup));
  process.on('SIGTERM', () => void shutdown('SIGTERM', cleanup));
}

export function handleStartupFailure(error: unknown): never {
  logger.fatal(
    {
      err: error,
    },
    'Failed to start bot',
  );
  process.exit(1);
}
