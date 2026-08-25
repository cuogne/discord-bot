import type { Client } from 'discord.js';

import { logCommandUsage } from '../logging/commandLogger.ts';
import { events } from './index.ts';

export function registerEvents(client: Client) {
  for (const event of events) {
    const handler = (...args: unknown[]) => event.execute(client as Client<true>, ...args);

    if (event.once) client.once(event.name, handler);
    else client.on(event.name, handler);
  }

  client.on('interactionCreate', (interaction) => logCommandUsage(interaction));
}
