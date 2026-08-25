import type { SlashCommand } from '../types/command.ts';

export const commands: SlashCommand[] = [];
export const commandMap = new Map<string, SlashCommand>();

export async function loadCommands() {
  const glob = new Bun.Glob('**/index.ts');

  for await (const file of glob.scan(import.meta.dir)) {
    if (file === 'index.ts') continue;

    const mod = await import(`./${file}`);
    const command = mod.default as SlashCommand;
    commands.push(command);
    commandMap.set(command.data.name, command);
  }
}
