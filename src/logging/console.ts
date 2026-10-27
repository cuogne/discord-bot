import { logger } from './logger.ts';
import type { CommandUsageLog } from '../types/log.ts';

export function logCommandUsage(logData: CommandUsageLog): void {
  if (logData.outcome === 'failed') {
    logger.error(logData, 'command failed');
  } else if (logData.outcome === 'rejected') {
    if (logData.reason === 'banned-user' || logData.reason === 'unknown-command') {
      logger.warn(logData, 'command rejected');
    } else {
      logger.info(logData, 'command rejected');
    }
  } else {
    logger.info(logData, 'command used');
  }
}
