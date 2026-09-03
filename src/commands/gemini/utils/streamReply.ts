import type { ChatInputCommandInteraction, Message } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { splitTextSmartly } from './splitSmart.ts';

const THROTTLE_MS = 1000;

export class StreamReplier {
  fullText = '';

  private readonly interaction: ChatInputCommandInteraction;
  private lastEditTime = 0;
  private readonly followUpMessages: Message[] = [];

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  append(text: string): Promise<void> {
    this.fullText += text;

    const now = Date.now();
    if (now - this.lastEditTime >= THROTTLE_MS) {
      this.lastEditTime = now;
      return this.updateMessages(false);
    }

    return Promise.resolve();
  }

  finish(): Promise<void> {
    return this.updateMessages(true);
  }

  private async updateMessages(isFinal = false): Promise<void> {
    const cursor = isFinal ? '' : ' ▌';
    const textToDisplay = (this.fullText || '...') + cursor;
    const parts = splitTextSmartly(textToDisplay, 1950);

    try {
      if (parts.length > 0) {
        await this.interaction.editReply({ content: parts[0] });
      }

      for (let i = 1; i < parts.length; i++) {
        const followUpIndex = i - 1;
        const existing = this.followUpMessages[followUpIndex];
        if (existing) {
          await existing.edit({ content: parts[i] });
        } else {
          const msg = await this.interaction.followUp({ content: parts[i] });
          this.followUpMessages[followUpIndex] = msg;
        }
      }
    } catch (editErr) {
      logger.warn({ err: editErr }, 'Failed to update streaming message');
    }
  }
}
