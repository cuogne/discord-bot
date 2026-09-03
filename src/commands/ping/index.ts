import { differenceInMilliseconds } from 'date-fns';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { logger } from '../../logging/logger.ts';
import type { SlashCommand } from '../../types/command.ts';
import { formatResponseTime } from '../../utils/format.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!'),

  async execute(interaction) {
    const startedAt = new Date();
    await interaction.deferReply();

    const responseTime = formatResponseTime(differenceInMilliseconds(new Date(), startedAt));
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: `⏱️ Response latency: ${responseTime}`, value: '', inline: false },
        { name: `🌐 WebSocket ping: ${interaction.client.ws.ping}ms`, value: '', inline: false },
      );

    await interaction.editReply({
      embeds: [embed],
    });

    logger.info(
      {
        responseTime,
        websocketPing: interaction.client.ws.ping,
      },
      'ping response',
    );
  },
};

export default command;
