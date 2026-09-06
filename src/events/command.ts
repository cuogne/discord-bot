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
  const subcommand = interaction.options.getSubcommand(false);
  const commandContext = {
    command: interaction.commandName,
    ...(subcommand ? { subcommand } : {}),
    userId: interaction.user.id,
    guildId: interaction.guildId ?? 'DM',
    channelId: interaction.channelId,
  };
  const startedAt = Date.now();

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
    logger.warn(commandContext, 'Blocked command from banned user');
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
        ...commandContext,
        durationMs: Date.now() - startedAt,
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
          ...commandContext,
        },
        'Error sending error message',
      );
    }
  } finally {
    const context = createCommandUsageContext(interaction);
    context.durationMs = Date.now() - startedAt;
    logCommandUsage(context);
    void sendCommandUsageLog(interaction, context);
  }
}
