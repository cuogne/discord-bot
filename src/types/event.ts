import type { Client, ClientEvents } from 'discord.js';

export interface BotEvent {
  name: keyof ClientEvents;
  once?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (client: Client<true>, ...args: any[]) => Promise<void> | void;
}
