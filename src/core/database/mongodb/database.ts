import { createConnection } from 'mongoose';
import type { Connection } from 'mongoose';
import { DatabaseConfigError, DatabaseConnectionError } from '../errors.ts';
import type { Database, DatabaseConfig } from '../interface.ts';

export const mongodbConfig: DatabaseConfig = {
  id: 'mongodb',
  name: 'MongoDB',
};

export class MongoDatabase implements Database {
  readonly config = mongodbConfig;

  private connection: Connection | null = null;

  isConnected(): boolean {
    return this.connection?.readyState === 1;
  }

  async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new DatabaseConfigError('MONGO_URI is not configured');
    }

    this.connection = createConnection(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });

    // createConnection resolves once the connection is established;
    // force it here so connect() rejects on failure.
    await this.connection.asPromise();

    // handle the case where the connection is dropped after it was opened
    this.connection.on('disconnected', () => {
      this.connection = null;
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection.close();
    this.connection = null;
  }

  async ping(): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const result = await this.connection?.db?.admin().ping();
      return result?.ok === 1;
    } catch {
      return false;
    }
  }

  /** Underlying mongoose connection for use by models. */
  getConnection(): Connection {
    if (!this.isConnected() || !this.connection) {
      throw new DatabaseConnectionError(this.config.name);
    }

    return this.connection;
  }
}
