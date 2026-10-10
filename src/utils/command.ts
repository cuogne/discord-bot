import { ApplicationCommandType } from 'discord.js';
import type { Client } from 'discord.js';
import { logger } from '../logging/logger.ts';

export async function getChatInputCommandId(
  client: Client<true>,
  commandName: string,
): Promise<string | null> {
  const commandManager = client.application.commands;
  const cachedCommand = commandManager.cache.find(
    (command) => command.name === commandName && command.type === ApplicationCommandType.ChatInput,
  );
  if (cachedCommand) {
    return cachedCommand.id;
  }

  try {
    const commands = await commandManager.fetch();
    return (
      commands.find(
        (command) =>
          command.name === commandName && command.type === ApplicationCommandType.ChatInput,
      )?.id ?? null
    );
  } catch (error) {
    // prettier-ignore
    logger.warn(
      {
        err: error,
        command: commandName,
      },
      'Could not fetch application command ID',
    );
    return null;
  }
}
