import { Client, GatewayIntentBits } from 'discord.js';

import {
  connectDatabases,
  disconnectDatabases,
  registerMongoDatabase,
} from './core/database/index.ts';
import { initBanManager } from './core/ban/index.ts';
import { loadCommands } from './commands/index.ts';
import { registerEvents } from './events/registerEvents.ts';
import { logger } from './logging/logger.ts';

// #region Global error handlers
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
// #endregion

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function main() {
  // Initialize databases
  registerMongoDatabase();
  await connectDatabases();

  // Initialize ban manager
  await initBanManager();

  // Load commands and register events
  await loadCommands();
  registerEvents(client);

  await client.login(process.env.BOT_TOKEN);
}

async function shutdown(signal: string) {
  logger.info(
    {
      signal,
    },
    'Shutting down bot...',
  );
  try {
    await disconnectDatabases();
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start bot');
  process.exit(1);
});
