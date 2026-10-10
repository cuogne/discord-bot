import interactionCreate from './interaction.ts';
import guildCreate from './guildCreate.ts';
import ready from './ready.ts';
import type { BotEvent } from '../types/event.ts';

export const events: BotEvent[] = [ready, interactionCreate, guildCreate];
