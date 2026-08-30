import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/command.ts';
import { handlePokemon } from './main/pokemon.ts';

const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('pokemon')
    .setDescription('Bắt Pokémon!')
    .addStringOption((option) =>
      option
        .setName('id')
        .setDescription('Nhập ID Pokémon từ 1-1025 hoặc 10001-10277'),
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Tên Pokémon cần tìm'),
    ),

  async execute(interaction) {
    await handlePokemon(interaction);
  },
};

export default command;
