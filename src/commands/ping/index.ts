import { differenceInMilliseconds } from 'date-fns';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { setCommandUsageDetails } from '../../logging/context.ts';
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

    const responseTimeMs = differenceInMilliseconds(new Date(), startedAt);
    const responseTime = formatResponseTime(responseTimeMs);
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

    setCommandUsageDetails(interaction, {
      ping: { responseTimeMs, websocketPingMs: interaction.client.ws.ping },
    });
  },
};

export default command;
