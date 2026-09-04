import { MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { commandMap } from '../commands/index.ts';
import { checkUserBanned } from '../core/ban/index.ts';
import type { IBanRecord } from '../core/ban/types.ts';
import { sendCommandUsageLog } from '../logging/channel.ts';
import { createCommandUsageContext, setCommandUsageError } from '../logging/context.ts';
import { logCommandUsage } from '../logging/console.ts';
import { logger } from '../logging/logger.ts';
import { formatVNStoredDate } from '../utils/date.ts';

async function replyBannedMessage(interaction: ChatInputCommandInteraction, banRecord: IBanRecord) {
  const expiryText = banRecord.expiresAt
    ? `**${formatVNStoredDate(new Date(banRecord.expiresAt))}**`
    : '**Vĩnh viễn**';

  const reasonText = banRecord.reason ?? 'Không có lý do';

  await interaction.reply({
    content: `Bạn đã bị cấm sử dụng bot đến ngày: ${expiryText}.\nLý do: *${reasonText}*`,
    flags: MessageFlags.Ephemeral,
  });
}

export async function executeCommand(interaction: ChatInputCommandInteraction) {
  const command = commandMap.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: 'Command does not exist!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // check if user is banned
  const banRecord = checkUserBanned(interaction.user.id);
  if (banRecord) {
    await replyBannedMessage(interaction, banRecord);
    return;
  }

  // Execute the command for the user
  try {
    await command.execute(interaction);
  } catch (error) {
    setCommandUsageError(interaction, error);
    logger.error(
      {
        err: error,
        command: interaction.commandName,
      },
      'Error executing command',
    );
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: 'Có lỗi xảy ra khi chạy command!',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: 'Có lỗi xảy ra khi chạy command!',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      logger.error(
        {
          err: replyError,
        },
        'Error sending error message',
      );
    }
  } finally {
    const context = createCommandUsageContext(interaction);
    logCommandUsage(context);
    void sendCommandUsageLog(interaction, context);
  }
}
