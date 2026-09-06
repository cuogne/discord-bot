import { registerMongoDatabase } from './mongodb/index.ts';

let databasesRegistered = false;

/** Register all database implementations used by the application. */
export function registerDatabases(): void {
  if (databasesRegistered) {
    return;
  }

  // Add new database implementations here.
  registerMongoDatabase();

  databasesRegistered = true;
}
