import { Client, GatewayIntentBits } from 'discord.js';

import { connectDatabases, disconnectDatabases } from './core/database/index.ts';
import { initBanManager } from './core/ban/index.ts';
import { loadCommands } from './commands/index.ts';
import { registerEvents } from './events/registerEvents.ts';
import { handleStartupFailure, registerProcessLifecycle } from './events/lifecycle.ts';
import { stopCron } from './commands/hcmus-news/main/scheduler.ts';

async function main() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  registerProcessLifecycle(async () => {
    stopCron();
    await disconnectDatabases();
  });

  await connectDatabases(); // initialize databases
  await initBanManager(); // initialize ban manager
  await loadCommands(); // load commands and register them with discord API
  registerEvents(client); // register event handlers for the client

  await client.login(process.env.BOT_TOKEN);
}

main().catch(handleStartupFailure);
