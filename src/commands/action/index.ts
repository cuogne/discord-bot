import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { logger } from '../../logging/logger.ts';
import { ACTIONS } from './utils/config.ts';
import { fetchActionImage } from './utils/nekos.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: Object.entries(ACTIONS).reduce<SlashCommandSubcommandsOnlyBuilder>(
    (builder, [action, actionText]) =>
      builder.addSubcommand((subcommand) =>
        subcommand
          .setName(action)
          .setDescription(`${actionText} một người bạn`)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription(`Chọn người bạn muốn ${actionText}`)
              .setRequired(true),
          ),
      ),
    new SlashCommandBuilder()
      .setName('action')
      .setDescription('Chọn hành động'),
  ),

  async execute(interaction: ChatInputCommandInteraction) {
    const action = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user', true);
    const actionText = ACTIONS[action];

    if (!actionText) {
      await interaction.reply({
        content: 'Hành động này chưa được hỗ trợ.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const actionImage = await fetchActionImage(action);

      const embed = new EmbedBuilder()
        .setDescription(`${interaction.user} muốn ${actionText} ${targetUser}`)
        .setImage(actionImage)
        .setColor(0xff6b6b);

      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      logger.error(
        {
          action,
          user: interaction.user.tag,
          target: targetUser.tag,
          err: error,
        },
        '[Action Command Error]',
      );

      const message = `Không lấy được gif ${actionText} rồi, thử lại sau nha.`;
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: message,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: message,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

export default command;
