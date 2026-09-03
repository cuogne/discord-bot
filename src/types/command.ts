import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

export type CommandData =
  SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

export type SelectHandler = (interaction: StringSelectMenuInteraction) => Promise<void> | void;

export interface SlashCommand {
  data: CommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void;
  selectHandlers?: Record<string, SelectHandler>;
}
