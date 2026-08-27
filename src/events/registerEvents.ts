import type { Client } from 'discord.js';

import { sendCommandUsageLog } from '../logging/channel.ts';
import { logCommandUsage } from '../logging/console.ts';
import { createCommandUsageContext } from '../logging/context.ts';
import { events } from './index.ts';

export function registerEvents(client: Client) {
  for (const event of events) {
    const handler = (...args: unknown[]) => event.execute(client as Client<true>, ...args);

    if (event.once) client.once(event.name, handler);
    else client.on(event.name, handler);
  }

  client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const context = createCommandUsageContext(interaction);
    logCommandUsage(context);
    void sendCommandUsageLog(interaction, context);
  });
}
