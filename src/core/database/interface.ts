export interface DatabaseConfig {
  /** Unique identifier for this database (e.g. 'mongodb') */
  readonly id: string;
  /** Human-readable display name for logs and errors */
  readonly name: string;
}

/**
 * Contract that every database implementation must follow.
 * Implement this interface for each database type (MongoDB, PostgreSQL, ...),
 * then register it via `registerDatabase()` from the core.
 */
export interface Database {
  readonly config: DatabaseConfig;

  /** Open the connection. Must be idempotent (safe to call multiple times). */
  connect(): Promise<void>;

  /** Close the connection and release resources. */
  disconnect(): Promise<void>;

  /** Return true when the connection is open and usable. */
  isConnected(): boolean;

  /**
   * Lightweight connectivity probe.
   * Implementations should resolve quickly instead of hanging.
   */
  ping(): Promise<boolean>;

  /** Optional cleanup hook invoked before shutdown. */
  onClose?(): Promise<void>;
}
