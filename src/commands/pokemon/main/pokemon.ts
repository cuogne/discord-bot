import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { buildPokemonEmbed } from '../utils/embed.ts';
import { fetchPokemon, fetchPokemonSpecies } from '../utils/api.ts';

const STANDARD_POKEMON_MAX = 1025;
const SPECIAL_POKEMON_MIN = 10001;
const SPECIAL_POKEMON_MAX = 10277;

export async function handlePokemon(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const inputId = interaction.options.getString('id');
  const inputName = interaction.options.getString('name');

  if (inputId && inputName) {
    await interaction.editReply('Vui lòng chỉ nhập ID hoặc tên, không được nhập cả hai!');
    return;
  }

  const identifier = resolveIdentifier(inputId, inputName);
  if (!identifier) {
    await interaction.editReply(
      'ID Pokémon không hợp lệ! Vui lòng nhập ID từ 1-1025 hoặc từ 10001-10277.',
    );
    return;
  }

  try {
    const pokemon = await fetchPokemon(identifier);
    const species = await fetchPokemonSpecies(pokemon.species.url);
    const embed = buildPokemonEmbed(pokemon, species, identifier);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(
      {
        err: error,
        id: inputId,
        name: inputName,
      },
      'Lỗi khi truy vấn dữ liệu Pokémon',
    );
    await interaction.editReply({
      content: 'Đã xảy ra lỗi khi truy vấn dữ liệu Pokémon. Vui lòng thử lại sau.',
    });
  }
}

function resolveIdentifier(inputId: string | null, inputName: string | null): string | undefined {
  if (inputId) {
    const parsedId = Number.parseInt(inputId, 10);
    const isStandardId = parsedId >= 1 && parsedId <= STANDARD_POKEMON_MAX;
    const isSpecialId = parsedId >= SPECIAL_POKEMON_MIN && parsedId <= SPECIAL_POKEMON_MAX;

    if (Number.isInteger(parsedId) && (isStandardId || isSpecialId)) {
      return String(parsedId);
    }

    return undefined;
  }

  if (inputName) {
    return inputName.toLowerCase().trim();
  }

  return String(getRandomPokemonId());
}

function getRandomPokemonId(): number {
  const standardCount = STANDARD_POKEMON_MAX;
  const specialCount = SPECIAL_POKEMON_MAX - SPECIAL_POKEMON_MIN + 1;
  const randomIndex = Math.floor(Math.random() * (standardCount + specialCount));

  if (randomIndex < standardCount) {
    return randomIndex + 1;
  }

  return SPECIAL_POKEMON_MIN + randomIndex - standardCount;
}
