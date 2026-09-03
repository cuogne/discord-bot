import { logger } from '../../logging/logger.ts';
import { DatabaseConnectionError } from './errors.ts';
import type { Database } from './interface.ts';
import { listDatabases } from './registry.ts';

/**
 * Connect a single database implementation with logging.
 * @param database implementation to connect
 * @param isPrimary mark as primary in logs (the bot's main storage)
 */
export async function connectDatabase(database: Database, isPrimary = false): Promise<void> {
  if (database.isConnected()) {
    return;
  }

  try {
    await database.connect();
    logger.info(
      {
        database: database.config.name,
        primary: isPrimary,
      },
      'Database connected',
    );
  } catch (err) {
    logger.error(
      {
        err,
        database: database.config.name,
      },
      'Database connection failed',
    );
    throw new DatabaseConnectionError(database.config.name, err);
  }
}

/** Connect all registered databases in registration order. */
export async function connectDatabases(): Promise<void> {
  for (const database of listDatabases()) {
    await connectDatabase(database);
  }
}

/** Gracefully disconnect all registered databases (for shutdown). */
export async function disconnectDatabases(): Promise<void> {
  for (const database of listDatabases()) {
    try {
      await database.disconnect();
      logger.info(
        {
          database: database.config.name,
        },
        'Database disconnected',
      );
    } catch (err) {
      logger.error(
        {
          err,
          database: database.config.name,
        },
        'Database disconnect failed',
      );
    }
  }
}
