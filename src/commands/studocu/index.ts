import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleStudocu } from './main/handle.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('studocu')
    .setDescription('Tải tài liệu Studocu Free không dính watermark')
    .addStringOption((option) =>
      option
        .setName('link')
        .setDescription('Link tài liệu Studocu')
        .setRequired(true),
    ),

  execute: handleStudocu,
};

export default command;
