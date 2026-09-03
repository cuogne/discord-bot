import { getVNTimeNow } from '../../utils/date.ts';
import type { ParsedDuration } from './types.ts';

const PERMANENT_KEYWORDS = new Set([
  '0',
  'perm',
  'permanent',
  'forever',
  'vinhvien',
  'vĩnh viễn',
  'infinity',
  'inf',
]);

export function parseBanDuration(input: string): ParsedDuration | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  if (PERMANENT_KEYWORDS.has(trimmed)) {
    return {
      durationMs: null,
      expiresAt: null,
      label: 'Vĩnh viễn',
    };
  }

  const regex = /(\d+)\s*(mo|m|h|d|w|s|y)/g;
  let totalMs = 0;
  const labels: string[] = [];
  let matchCount = 0;
  let strippedInput = trimmed;

  const matches = [...trimmed.matchAll(regex)];
  if (matches.length === 0) {
    return null;
  }

  for (const match of matches) {
    const value = parseInt(match[1]!, 10);
    const unit = match[2]!.toLowerCase();

    if (Number.isNaN(value) || value <= 0) {
      return null;
    }

    let unitMs = 0;
    let unitLabel = '';

    switch (unit) {
      case 's': {
        unitMs = value * 1_000;
        unitLabel = `${value} giây`;
        break;
      }
      case 'm': {
        unitMs = value * 60 * 1_000;
        unitLabel = `${value} phút`;
        break;
      }
      case 'h': {
        unitMs = value * 60 * 60 * 1_000;
        unitLabel = `${value} giờ`;
        break;
      }
      case 'd': {
        unitMs = value * 24 * 60 * 60 * 1_000;
        unitLabel = `${value} ngày`;
        break;
      }
      case 'w': {
        unitMs = value * 7 * 24 * 60 * 60 * 1_000;
        unitLabel = `${value} tuần`;
        break;
      }
      case 'mo': {
        unitMs = value * 30 * 24 * 60 * 60 * 1_000;
        unitLabel = `${value} tháng`;
        break;
      }
      case 'y': {
        unitMs = value * 365 * 24 * 60 * 60 * 1_000;
        unitLabel = `${value} năm`;
        break;
      }
      default: {
        return null;
      }
    }

    totalMs += unitMs;
    labels.push(unitLabel);
    matchCount += 1;
    strippedInput = strippedInput.replace(match[0], '');
  }

  // Ensure no unrecognized trailing/leading characters exist
  if (strippedInput.trim().length > 0 || matchCount === 0 || totalMs <= 0) {
    return null;
  }

  return {
    durationMs: totalMs,
    expiresAt: new Date(getVNTimeNow().getTime() + totalMs),
    label: labels.join(' '),
  };
}
