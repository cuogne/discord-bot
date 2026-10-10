import type { Guild } from 'discord.js';
import type { BotEvent } from '../types/event.ts';
import { sendGuildWelcomeMessage } from '../messages/guildWelcome.ts';

const event: BotEvent = {
  name: 'guildCreate',
  async execute(_client, guild: Guild) {
    await sendGuildWelcomeMessage(guild);
  },
};

export default event;
