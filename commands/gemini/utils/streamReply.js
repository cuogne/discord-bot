import { splitTextSmartly } from './splitSmart.js';

const THROTTLE_MS = 1000;

export class StreamReplier {
  constructor(interaction) {
    this.interaction = interaction;
    this.fullText = '';
    this.lastEditTime = 0;
    this.followUpMessages = [];
  }

  append(text) {
    this.fullText += text;

    const now = Date.now();
    if (now - this.lastEditTime >= THROTTLE_MS) {
      this.lastEditTime = now;
      return this.updateMessages(false);
    }

    return Promise.resolve();
  }

  finish() {
    return this.updateMessages(true);
  }

  async updateMessages(isFinal = false) {
    const cursor = isFinal ? '' : ' ▌';
    const textToDisplay = (this.fullText || '...') + cursor;
    const parts = splitTextSmartly(textToDisplay, 1950);

    try {
      if (parts.length > 0) {
        await this.interaction.editReply({ content: parts[0] });
      }

      for (let i = 1; i < parts.length; i++) {
        const followUpIndex = i - 1;
        if (this.followUpMessages[followUpIndex]) {
          await this.followUpMessages[followUpIndex].edit({ content: parts[i] });
        } else {
          const msg = await this.interaction.followUp({ content: parts[i] });
          this.followUpMessages[followUpIndex] = msg;
        }
      }
    } catch (editErr) {
      console.warn('Failed to update streaming message:', editErr?.message || editErr);
    }
  }
}