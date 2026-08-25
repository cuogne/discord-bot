import { REST, Routes } from 'discord.js';
import type { Client } from 'discord.js';
import { commands } from '../commands/index.ts';
import { logger } from '../logging/logger.ts';
import type { BotEvent } from '../types/event.ts';

const event: BotEvent = {
  name: 'clientReady',
  once: true,

  async execute(client: Client<true>) {
    logger.info(`Tên bot: ${client.user.tag}!`);

    try {
      const rest = new REST({ version: '10' }).setToken(client.token!);
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands.map((command) => command.data.toJSON()),
      });
      logger.info('Slash commands are ready!');
    } catch (error) {
      logger.error({ err: error }, 'Lỗi khi đăng ký commands');
    }
  },
};

export default event;
