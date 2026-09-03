export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

export class DatabaseConnectionError extends Error {
  constructor(name: string, cause?: unknown) {
    super(`Failed to connect to database "${name}"`);
    this.name = 'DatabaseConnectionError';
    this.cause = cause;
  }
}

export class DatabaseNotRegisteredError extends Error {
  constructor(id: string) {
    super(`Database "${id}" is not registered`);
    this.name = 'DatabaseNotRegisteredError';
  }
}

export class DatabaseDuplicateError extends Error {
  constructor(id: string) {
    super(`Database "${id}" is already registered`);
    this.name = 'DatabaseDuplicateError';
  }
}
