import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handleGemini } from './main/chat.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('gemini')
    .setDescription('Chat với AI Gemini (Google)')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Nhập câu hỏi hoặc yêu cầu của bạn')
        .setRequired(true),
    )
    .addAttachmentOption((option) =>
      option
        .setName('attachment')
        .setDescription('Ảnh (.png, .jpg, .jpeg, .webp) hoặc file PDF (tối đa 1 file 10MB).'),
    ),

  async execute(interaction) {
    await handleGemini(interaction);
  },
};

export default command;
