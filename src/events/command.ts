import { MessageFlags } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { commandMap } from '../commands/index.ts';
import { checkUserBanned } from '../core/ban/index.ts';
import type { IBanRecord } from '../core/ban/types.ts';
import { sendCommandUsageLog } from '../logging/channel.ts';
import {
  createCommandUsageContext,
  setCommandReplyError,
  setCommandUsageError,
  setCommandUsageRejection,
} from '../logging/context.ts';
import { logCommandUsage } from '../logging/console.ts';
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
  const startedAt = Date.now();

  try {
    if (!command) {
      setCommandUsageRejection(interaction, 'unknown-command');
      await interaction.reply({
        content: 'Command does not exist!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const banRecord = checkUserBanned(interaction.user.id);
    if (banRecord) {
      setCommandUsageRejection(interaction, 'banned-user');
      await replyBannedMessage(interaction, banRecord);
      return;
    }

    await command.execute(interaction);
  } catch (error) {
    setCommandUsageError(interaction, error);
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
      setCommandReplyError(interaction, replyError);
    }
  } finally {
    const durationMs = Date.now() - startedAt;
    const context = await createCommandUsageContext(interaction);
    context.durationMs = durationMs;
    logCommandUsage(context);
    void sendCommandUsageLog(interaction, context);
  }
}
