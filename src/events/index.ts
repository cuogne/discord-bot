import interactionCreate from './interaction.ts';
import ready from './ready.ts';
import type { BotEvent } from '../types/event.ts';

export const events: BotEvent[] = [ready, interactionCreate];
