import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { HELP_PAGES } from './commands.ts';

export const HELP_DIRECTORY_ID = 'directory';

export function buildHelpMenu(ownerId: string, selectedId = HELP_DIRECTORY_ID) {
  // prettier-ignore
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`help|${ownerId}`)
    .setPlaceholder('Chọn danh mục lệnh để xem...');

  // prettier-ignore
  const directoryOption = new StringSelectMenuOptionBuilder()
    .setLabel('Danh mục trợ giúp')
    .setDescription('Xem tổng quan các nhóm lệnh')
    .setEmoji('📖')
    .setValue(HELP_DIRECTORY_ID)
    .setDefault(selectedId === HELP_DIRECTORY_ID);
  menu.addOptions(directoryOption);

  for (const page of HELP_PAGES) {
    // prettier-ignore
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(page.title)
      .setDescription(page.description)
      .setEmoji(page.emoji)
      .setValue(page.id)
      .setDefault(selectedId === page.id);
    menu.addOptions(option);
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
