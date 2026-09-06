import type { Client } from 'discord.js';
import { logger } from '../../../logging/logger.ts';
import { processAndSendNews } from './cron.ts';

const SCAN_INTERVAL_MS = 10 * 60 * 1000;

let cronTimeout: Timer | null = null;
let initialCronTimeout: Timer | null = null;
let isRunning = false;
let isStarted = false;

export function startCron(client: Client): void {
  if (isStarted) {
    logger.warn('HCMUS news cron is already running');
    return;
  }

  isStarted = true;
  logger.info('Starting HCMUS news cron job (every 10 minutes)');

  const runCycle = async () => {
    if (!isStarted) {
      return;
    }

    if (isRunning) {
      logger.warn('Previous news scan cycle is still running, skipping this tick');
      return;
    }

    isRunning = true;
    try {
      await processAndSendNews(client);
    } catch (error) {
      logger.error(
        {
          err: error,
        },
        'Unexpected error in HCMUS news cron job',
      );
    } finally {
      isRunning = false;
      if (isStarted) {
        cronTimeout = setTimeout(() => void runCycle(), SCAN_INTERVAL_MS);
      }
    }
  };

  initialCronTimeout = setTimeout(() => {
    initialCronTimeout = null;
    void runCycle();
  }, 5_000);
}

export function stopCron(): void {
  isStarted = false;

  if (initialCronTimeout) {
    clearTimeout(initialCronTimeout);
    initialCronTimeout = null;
  }

  if (cronTimeout) {
    clearTimeout(cronTimeout);
    cronTimeout = null;
  }
}
