import { createConnection } from 'mongoose';
import type { Connection } from 'mongoose';
import { DatabaseConfigError, DatabaseConnectionError } from '../errors.ts';
import type { Database, DatabaseConfig } from '../interface.ts';
import { logger } from '../../../logging/logger.ts';

export const mongodbConfig: DatabaseConfig = {
  id: 'mongodb',
  name: 'MongoDB',
};

export class MongoDatabase implements Database {
  readonly config = mongodbConfig;

  private connection: Connection | null = null;
  private connectPromise: Promise<void> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private shuttingDown = false;

  isConnected(): boolean {
    return this.connection?.readyState === 1;
  }

  async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.shuttingDown = false;
    this.connectPromise = this.establishConnection();

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async establishConnection(): Promise<void> {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new DatabaseConfigError('MONGO_URI is not configured');
    }

    const connection = createConnection(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
    this.connection = connection;

    connection.on('connected', () => {
      logger.info(
        {
          database: this.config.name,
          reconnectAttempt: this.reconnectAttempt,
        },
        'MongoDB connection established',
      );
    });

    connection.on('error', (error) => {
      logger.error(
        {
          err: error,
          database: this.config.name,
          readyState: connection.readyState,
        },
        'MongoDB connection error',
      );
    });

    connection.on('disconnected', () => {
      if (this.connection !== connection || this.shuttingDown) {
        return;
      }

      this.connection = null;
      logger.warn(
        {
          database: this.config.name,
          readyState: connection.readyState,
        },
        'MongoDB connection lost; scheduling reconnect',
      );
      this.scheduleReconnect();
    });

    // createConnection resolves once the connection is established;
    // force it here so connect() rejects on failure.
    try {
      await connection.asPromise();
      this.reconnectAttempt = 0;
    } catch (error) {
      if (this.connection === connection) {
        this.connection = null;
      }
      throw error;
    }
  }

  private scheduleReconnect(): void {
    if (this.shuttingDown || this.reconnectTimer || this.connectPromise) {
      return;
    }

    this.reconnectAttempt += 1;
    const delayMs = Math.min(1_000 * 2 ** (this.reconnectAttempt - 1), 30_000);

    logger.info(
      {
        database: this.config.name,
        reconnectAttempt: this.reconnectAttempt,
        delayMs,
      },
      'Scheduling MongoDB reconnect',
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect().catch((error) => {
        logger.error(
          {
            err: error,
            database: this.config.name,
            reconnectAttempt: this.reconnectAttempt,
          },
          'MongoDB reconnect attempt failed',
        );
        this.scheduleReconnect();
      });
    }, delayMs);
  }

  async disconnect(): Promise<void> {
    this.shuttingDown = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const connection = this.connection;
    this.connection = null;

    if (connection) {
      await connection.close();
    }
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
      logger.warn(
        {
          database: this.config.name,
          readyState: this.connection?.readyState ?? 0,
          reconnectAttempt: this.reconnectAttempt,
        },
        'MongoDB connection requested while disconnected',
      );
      throw new DatabaseConnectionError(this.config.name);
    }

    return this.connection;
  }
}
