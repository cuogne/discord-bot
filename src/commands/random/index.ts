import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import type { SlashCommand } from '../../types/command';

const linkGif =
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9lZW5uMWRzcXM4ZDg2MGgzYW9iZGxvejBkNXFjbmVsb3BzM3N5bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G9qfCvxlwGAaQ/giphy.gif';

const command: SlashCommand = {
  // pretty-ignore
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Chọn ngẫu nhiên một cái trong danh sách')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Danh sách các lựa chọn, cách nhau bằng dấu phẩy')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('text', true);
    const listRandom = text
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (listRandom.length === 0) {
      await interaction.reply({
        content: 'Danh sách lựa chọn không hợp lệ. Vui lòng cung cấp ít nhất một lựa chọn.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * listRandom.length);
    const randomChoice = listRandom[randomIndex];

    const embed = new EmbedBuilder()
      .setTitle(`**${randomChoice}** ơi, tớ chọn cậu!`)
      .setColor(0x4285f4)
      .setImage(linkGif);

    await interaction.reply({
      embeds: [embed],
    });
  },
};

export default command;
