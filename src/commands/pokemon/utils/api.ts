import { fetchWithTimeout } from '../../../utils/http.ts';
import type { PokemonData, PokemonSpeciesData } from '../types/types.ts';

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon';

export async function fetchPokemon(identifier: string): Promise<PokemonData> {
  const data: unknown = await fetchJson(`${POKE_API_URL}/${encodeURIComponent(identifier)}`);
  if (!isPokemonData(data)) {
    throw new Error('Unexpected PokéAPI Pokémon response format');
  }

  return data;
}

export async function fetchPokemonSpecies(url: string): Promise<PokemonSpeciesData> {
  const data: unknown = await fetchJson(url);
  if (!isPokemonSpeciesData(data)) {
    throw new Error('Unexpected PokéAPI species response format');
  }

  return data;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`PokéAPI responded with ${response.status}`);
  }

  return response.json();
}

function isPokemonData(value: unknown): value is PokemonData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.height === 'number' &&
    typeof value.weight === 'number' &&
    isRecord(value.sprites) &&
    isRecord(value.types) &&
    Array.isArray(value.types) &&
    value.types.every(isPokemonType) &&
    Array.isArray(value.abilities) &&
    value.abilities.every(isPokemonAbility) &&
    Array.isArray(value.stats) &&
    value.stats.every(isPokemonStat) &&
    isRecord(value.species) &&
    typeof value.species.url === 'string'
  );
}

function isPokemonSpeciesData(value: unknown): value is PokemonSpeciesData {
  return (
    isRecord(value) &&
    Array.isArray(value.flavor_text_entries) &&
    value.flavor_text_entries.every(isFlavorTextEntry)
  );
}

function isPokemonType(value: unknown): boolean {
  return isRecord(value) && isRecord(value.type) && typeof value.type.name === 'string';
}

function isPokemonAbility(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.is_hidden === 'boolean' &&
    isRecord(value.ability) &&
    typeof value.ability.name === 'string'
  );
}

function isPokemonStat(value: unknown): boolean {
  return isRecord(value) && typeof value.base_stat === 'number';
}

function isFlavorTextEntry(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.flavor_text === 'string' &&
    isRecord(value.language) &&
    typeof value.language.name === 'string' &&
    isRecord(value.version) &&
    typeof value.version.name === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
