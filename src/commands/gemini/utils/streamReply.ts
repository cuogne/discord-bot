import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { splitTextSmartly } from './splitSmart.ts';

const THROTTLE_MS = 1000;

export class StreamReplier {
  fullText = '';

  private readonly interaction: ChatInputCommandInteraction;
  private lastEditTime = 0;
  private readonly followUpMessageIds: string[] = [];
  private updateQueue: Promise<void> = Promise.resolve();

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  append(text: string): Promise<void> {
    this.fullText += text;

    const now = Date.now();
    if (now - this.lastEditTime >= THROTTLE_MS) {
      this.lastEditTime = now;
      return this.queueUpdate(false);
    }

    return Promise.resolve();
  }

  finish(): Promise<void> {
    return this.queueUpdate(true);
  }

  private queueUpdate(isFinal: boolean): Promise<void> {
    const update = this.updateQueue.then(() => this.updateMessages(isFinal));
    this.updateQueue = update.catch(() => undefined);
    return update;
  }

  private async updateMessages(isFinal = false): Promise<void> {
    const cursor = isFinal ? '' : ' ▌';
    const textToDisplay = (this.fullText || '...') + cursor;
    const parts = splitTextSmartly(textToDisplay, 1950);

    try {
      if (parts.length > 0) {
        await this.interaction.editReply({
          content: parts[0],
        });
      }

      for (let i = 1; i < parts.length; i++) {
        const followUpIndex = i - 1;
        const existingId = this.followUpMessageIds[followUpIndex];
        if (existingId) {
          // use webhook to edit the message instead of Message.edit to avoid dependency on channel cache.
          // fix ChannelNotCached when bot is denied View Channel / thread / DM.
          await this.interaction.webhook.editMessage(existingId, {
            content: parts[i],
          });
        } else {
          const msg = await this.interaction.followUp({
            content: parts[i],
          });
          this.followUpMessageIds[followUpIndex] = msg.id;
        }
      }
    } catch (editErr) {
      logger.warn(
        {
          err: editErr,
        },
        'Failed to update streaming message',
      );
    }
  }
}
