import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { getGeminiModels } from '../../core/gemini/config.ts';
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
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('Chọn mô hình Gemini (mặc định là model đầu tiên)')
        .setAutocomplete(true),
    )
    .addAttachmentOption((option) =>
      option
        .setName('attachment')
        .setDescription('Ảnh, PDF, hoặc file text/code (.txt, .md, .json, .py, ...) (tối đa 1 file 10MB).'),
    ),

  async execute(interaction) {
    await handleGemini(interaction);
  },

  async autocomplete(interaction) {
    const focused = String(interaction.options.getFocused()).toLowerCase();
    const choices = getGeminiModels()
      .filter((model) => model.toLowerCase().includes(focused))
      .slice(0, 25);

    await interaction.respond(
      choices.map((model) => ({
        // format model: gemini-3.5-flash-lite -> Gemini 3.5 Flash Lite
        name: model
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        value: model,
      })),
    );
  },
};

export default command;
