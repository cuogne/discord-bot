import { logger } from './logger.ts';
import type { CommandUsageLog } from '../types/log.ts';

export function logCommandUsage(logData: CommandUsageLog): void {
  logger.info(logData, 'command used');
}
