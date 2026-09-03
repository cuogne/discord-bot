import { getDatabase, registerDatabase } from '../registry.ts';
import { MongoDatabase, mongodbConfig } from './database.ts';

/** Singleton instance of the MongoDB implementation. */
let sharedInstance: MongoDatabase | null = null;

/** Get (or lazily create) the shared MongoDB implementation. */
export function getMongoDatabase(): MongoDatabase {
  if (!sharedInstance) {
    sharedInstance = new MongoDatabase();
  }

  return sharedInstance;
}

/** Register the MongoDB implementation with the database core. */
export function registerMongoDatabase(): MongoDatabase {
  const database = getMongoDatabase();
  registerDatabase(database);

  return database;
}

/** The registered MongoDB implementation (throws if not registered). */
export function useMongoDatabase(): MongoDatabase {
  return getDatabase(mongodbConfig.id) as MongoDatabase;
}

export { MongoDatabase, mongodbConfig } from './database.ts';
