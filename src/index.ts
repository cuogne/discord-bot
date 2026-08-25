import { Client, GatewayIntentBits } from 'discord.js';

import { loadCommands } from './commands/index.ts';
import { registerEvents } from './events/registerCommand.ts';
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
  registerEvents(client);
  await loadCommands();
  await client.login(process.env.BOT_TOKEN);
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start bot');
  process.exit(1);
});
