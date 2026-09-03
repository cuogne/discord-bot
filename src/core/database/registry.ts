import { DatabaseDuplicateError, DatabaseNotRegisteredError } from './errors.ts';
import type { Database } from './interface.ts';

const databases = new Map<string, Database>();

/** Register a database implementation with the core. */
export function registerDatabase(database: Database): void {
  if (databases.has(database.config.id)) {
    throw new DatabaseDuplicateError(database.config.id);
  }

  databases.set(database.config.id, database);
}

/** Get a registered database implementation by its id. */
export function getDatabase(id: string): Database {
  const database = databases.get(id);

  if (!database) {
    throw new DatabaseNotRegisteredError(id);
  }

  return database;
}

/** All registered database implementations. */
export function listDatabases(): Database[] {
  return [...databases.values()];
}
