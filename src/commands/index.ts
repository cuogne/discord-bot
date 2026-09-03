import type { SlashCommand } from '../types/command.ts';

export const commands: SlashCommand[] = [];
export const commandMap = new Map<string, SlashCommand>();

export async function loadCommands() {
  const glob = new Bun.Glob('**/index.ts');

  for await (const file of glob.scan(import.meta.dir)) {
    if (file === 'index.ts') {
      continue;
    }

    let command: SlashCommand;
    try {
      const mod = await import(`./${file}`);
      command = mod.default as SlashCommand;
    } catch (err) {
      throw new Error(`Failed to import command file "${file}"`, {
        cause: err,
      });
    }

    if (!command?.data?.name) {
      throw new Error(
        `Invalid command file "${file}": missing default export or command.data.name`,
      );
    }

    commands.push(command);
    commandMap.set(command.data.name, command);
  }
}
