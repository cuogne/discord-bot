import type { Client } from 'discord.js';

import { events } from './index.ts';
import { logger } from '../logging/logger.ts';

export function registerEvents(client: Client) {
  for (const event of events) {
    const handler = (...args: unknown[]) => {
      try {
        Promise.resolve(event.execute(client as Client<true>, ...args)).catch((error) => {
          logger.error(
            {
              err: error,
              event: event.name,
            },
            'Discord event handler failed',
          );
        });
      } catch (error) {
        logger.error(
          {
            err: error,
            event: event.name,
          },
          'Discord event handler threw synchronously',
        );
      }
    };

    if (event.once) client.once(event.name, handler);
    else client.on(event.name, handler);
  }

  // register global error handlers for the Discord client
  client.on('error', (error) => {
    logger.error(
      {
        err: error,
      },
      'Discord client error',
    );
  });

  client.on('warn', (message) => {
    logger.warn(
      {
        message,
      },
      'Discord client warning',
    );
  });

  client.on('shardError', (error, shardId) => {
    logger.error(
      {
        err: error,
        shardId,
      },
      'Discord shard error',
    );
  });

  client.on('shardDisconnect', (closeEvent, shardId) => {
    logger.warn(
      {
        shardId,
        code: closeEvent.code,
        reason: closeEvent.reason,
      },
      'Discord shard disconnected',
    );
  });

  client.on('shardReconnecting', (shardId) => {
    logger.info(
      {
        shardId,
      },
      'Discord shard reconnecting',
    );
  });
}
