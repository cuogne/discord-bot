import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { sanitizeBrowserlessError } from '../api/browserless.ts';

const UPDATE_INTERVAL_MS = 2_500;

export function createStudocuProgressReporter(interaction: ChatInputCommandInteraction) {
  let pending: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let active: Promise<void> | null = null;
  let lastSentAt = 0;
  let closed = false;

  function schedule(): void {
    if (closed || pending === null || timer !== null || active !== null) {
      return;
    }

    const delay = Math.max(0, UPDATE_INTERVAL_MS - (Date.now() - lastSentAt));
    timer = setTimeout(() => {
      timer = null;
      if (closed || pending === null) {
        return;
      }

      const content = pending;
      pending = null;
      lastSentAt = Date.now();
      // prettier-ignore
      active = interaction.editReply({
        content,
        allowedMentions: { parse: [] },
      })
        .then(() => undefined)
        .catch((error: unknown) => {
          // prettier-ignore
          logger.warn({
            err: sanitizeBrowserlessError(error),
            command: 'studocu',
          }, 'Could not update Studocu progress message');
        })
        .finally(() => {
          active = null;
          schedule();
        });
    }, delay);
  }

  return {
    report(content: string): void {
      if (closed) {
        return;
      }
      pending = content;
      schedule();
    },
    async finish(): Promise<void> {
      closed = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      pending = null;
      if (active !== null) {
        await active;
      }
    },
  };
}
