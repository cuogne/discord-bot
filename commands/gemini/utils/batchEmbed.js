import { getEmbedSize } from './getEmbedSize.js';

export function batchEmbedsSafely(embeds) {
  const batches = [];
  let currentBatch = [];
  let currentSize = 0;

  for (const embed of embeds) {
    const embedSize = getEmbedSize(embed);
    if (currentBatch.length >= 10 || currentSize + embedSize > 5900) {
      batches.push(currentBatch);
      currentBatch = [];
      currentSize = 0;
    }
    currentBatch.push(embed);
    currentSize += embedSize;
  }
  if (currentBatch.length > 0) batches.push(currentBatch);
  return batches;
}