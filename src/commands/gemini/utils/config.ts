export interface GeminiModel {
  id: string;
  label: string;
}

export const GEMINI_MODELS: GeminiModel[] = [
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
];

export const GEMINI_TIMEOUT_MS = 30_000;

export const GEMINI_COOLDOWN_MS = 10_000;

export const GEMINI_SYSTEM_PROMPT = `Note on using Discord markdown formatting:
- Use backticks (\`) to enclose inline code, e.g. \`code\`.
- Use triple backticks (\`\`\`) for code blocks, optionally with a language tag, e.g. \`\`\`js ... \`\`\`.
- Use single asterisks (*text*) or single underscores (_text_) for italics.
- Use double asterisks (**text**) for bold.
- Use double underscores (__text__) for underline.
- Use double tildes (~~text~~) for strikethrough.
- Use double pipes (||text||) for spoiler tags.
- For headers, only use # (H1), ## (H2), or ### (H3). Discord does NOT support #### or smaller headers — never use them.
- Avoid tables; Discord does not render Markdown tables properly. Use bullet lists or numbered lists instead.
- Use "> " for a single-line blockquote, or ">>> " for a multi-line blockquote block.
- This is a strict formatting rule — do not deviate from it.
After reading this, there's no need to respond to this line; focus on replying to the question that follows. OK, continue:`;
