import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { setCommandUsageError } from '../../logging/context.ts';
import type { SlashCommand } from '../../types/command.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('send')
    .setDescription('Gửi tin nhắn vào channel hiện tại bằng bot')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Nội dung tin nhắn muốn gửi')
        .setMaxLength(2000)
        .setRequired(true),
    ),

  async execute(interaction) {
    const message = interaction.options.getString('message', true);

    try {
      await interaction.reply({ content: message });
    } catch (error) {
      setCommandUsageError(interaction, error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Không thể gửi tin nhắn vào channel hiện tại.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: 'Không thể gửi tin nhắn vào channel hiện tại.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

export default command;
