import { EmbedBuilder } from 'discord.js';
import type { PokemonData, PokemonSpeciesData } from '../types/types.ts';
import { TYPE_COLORS } from './color.ts';
import { capitalize, formatPokemonId } from './format.ts';

export function buildPokemonEmbed(
  pokemon: PokemonData,
  species: PokemonSpeciesData,
  requestedIdentifier: string,
): EmbedBuilder {
  const primaryType = pokemon.types[0]?.type.name ?? 'unknown';
  const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default;
  const regularAbilities = pokemon.abilities
    .filter((ability) => !ability.is_hidden)
    .map((ability) => capitalize(ability.ability.name))
    .join(', ');
  const hiddenAbilities = pokemon.abilities
    .filter((ability) => ability.is_hidden)
    .map((ability) => capitalize(ability.ability.name))
    .join(', ');
  const abilities = regularAbilities + (hiddenAbilities ? `\n*(Hidden: ${hiddenAbilities})*` : '');
  const typeNames = pokemon.types.map((type) => capitalize(type.type.name)).join(', ');
  const stats = pokemon.stats.map((stat) => stat.base_stat);
  const [hp = 0, attack = 0, defense = 0, specialAttack = 0, specialDefense = 0, speed = 0] = stats;
  const totalStats = hp + attack + defense + specialAttack + specialDefense + speed;
  const description = getEnglishFlavorText(species);

  const embed = new EmbedBuilder()
    .setColor(TYPE_COLORS[primaryType] ?? TYPE_COLORS.unknown ?? 0xaaaaaa)
    .setTitle(
      `✨ ${capitalize(pokemon.name)} (#${formatPokemonId(pokemon.id || requestedIdentifier)})`,
    )
    .setDescription(`*${description}*`)
    .addFields(
      {
        name: '📐 Attributes',
        value: `**Type:** ${typeNames}\n**Height:** ${pokemon.height / 10} m | **Weight:** ${pokemon.weight / 10} kg`,
        inline: false,
      },
      {
        name: '🌟 Abilities',
        value: abilities || 'None',
        inline: false,
      },
      {
        name: '⚔️ Base Stats',
        value:
          `**HP:** ${hp} | **Atk:** ${attack} | **Def:** ${defense}\n` +
          `**Sp. Atk:** ${specialAttack} | **Sp. Def:** ${specialDefense} | **Spd:** ${speed}\n` +
          `**Total:** **${totalStats}**`,
        inline: false,
      },
    )
    .setFooter({ text: 'Data provided by PokéAPI' });

  if (imageUrl) {
    embed.setThumbnail(imageUrl);
  }

  return embed;
}

function getEnglishFlavorText(species: PokemonSpeciesData): string {
  const entry =
    species.flavor_text_entries.find(
      (item) => item.language.name === 'en' && item.version.name === 'scarlet',
    ) ?? species.flavor_text_entries.find((item) => item.language.name === 'en');

  return entry?.flavor_text.replace(/[\n\f]/g, ' ') ?? 'No Pokedex description available.';
}
