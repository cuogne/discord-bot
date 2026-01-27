export function splitTextSmartly(text, maxLen) {
  const parts = [];

  // 1. Tokenize into TEXT and CODE_BLOCK segments
  const regex = /```(:?\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  const tokens = [];

  while ((match = regex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    // Code block
    tokens.push({
      type: 'code',
      lang: match[1] || '',
      content: match[2],     // inner content
      full: match[0]         // full block for simple length check
    });
    lastIndex = regex.lastIndex;
  }
  // Remaining text
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // 2. Build chunks
  let currentChunk = '';

  for (const token of tokens) {
    if (token.type === 'text') {
      let remainingText = token.content;

      while (remainingText.length > 0) {
        // Space left in current chunk
        const spaceLeft = maxLen - currentChunk.length;

        if (remainingText.length <= spaceLeft) {
          currentChunk += remainingText;
          remainingText = '';
        } else {
          let splitIdx = -1;
          const slice = remainingText.slice(0, spaceLeft);

          splitIdx = slice.lastIndexOf('\n\n');
          if (splitIdx === -1) splitIdx = slice.lastIndexOf('\n');
          if (splitIdx === -1) splitIdx = slice.lastIndexOf(' ');

          if (splitIdx === -1 || splitIdx < Math.floor(spaceLeft * 0.5)) {
            if (currentChunk.length === 0) splitIdx = maxLen;
            else splitIdx = 0;
          }

          if (splitIdx > 0) {
            currentChunk += remainingText.slice(0, splitIdx);
            remainingText = remainingText.slice(splitIdx);
          }

          if (currentChunk.length > 0) {
            parts.push(currentChunk);
            currentChunk = '';
            remainingText = remainingText.trimStart();
          }
        }
      }
    } else if (token.type === 'code') {
      const codeBlockLen = token.full.length;

      // Case A: Fits in current chunk
      if (currentChunk.length + codeBlockLen <= maxLen) {
        currentChunk += token.full;
      }
      // Case B: Fits in a new clean chunk
      else if (codeBlockLen <= maxLen) {
        if (currentChunk.length > 0) {
          parts.push(currentChunk);
          currentChunk = '';
        }
        currentChunk = token.full;
      }
      // Case C: Huge code block, must be split
      else {
        if (currentChunk.length > 0) {
          parts.push(currentChunk);
          currentChunk = '';
        }

        // Split huge code block
        const lang = token.lang;
        let contentRemaining = token.content;

        while (contentRemaining.length > 0) {
          const prefix = `\`\`\`${lang}\n`;
          const suffix = `\n\`\`\``;
          const overhead = prefix.length + suffix.length;
          const availableForContent = maxLen - overhead;

          if (contentRemaining.length <= availableForContent) {
            parts.push(prefix + contentRemaining + suffix);
            contentRemaining = '';
          } else {
            // Find break point
            let splitIdx = contentRemaining.lastIndexOf('\n', availableForContent);
            if (splitIdx === -1) splitIdx = availableForContent;

            parts.push(prefix + contentRemaining.slice(0, splitIdx) + suffix);
            contentRemaining = contentRemaining.slice(splitIdx); // Do not trim start inside code block? Maybe '\n'?
            if (contentRemaining.startsWith('\n')) contentRemaining = contentRemaining.slice(1);
          }
        }
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    parts.push(currentChunk);
  }

  return parts;
}