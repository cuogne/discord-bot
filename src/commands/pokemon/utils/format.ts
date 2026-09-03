export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPokemonId(identifier: number | string): string {
  return typeof identifier === 'number' ? String(identifier) : identifier;
}
