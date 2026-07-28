import { GoogleGenAI } from '@google/genai';
import { buildEmbedsFromText } from './utils/buildEmbedsFromText.js';
import { batchEmbedsSafely } from './utils/batchEmbed.js';

const GEMINI_MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
];
const GEMINI_TIMEOUT_MS = 120_000;
const GEMINI_COOLDOWN_MS = 10_000;

const userCooldowns = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(err) {
  const status = err?.status ?? err?.code ?? err?.statusCode;
  const message = (err?.message ?? '').toString().toLowerCase();

  return status === 429
    || message.includes('429')
    || message.includes('quota')
    || message.includes('rate limit')
    || message.includes('resource exhausted');
}

function isTimeoutError(err) {
  return err?.name === 'TimeoutError';
}

function getCooldownRemainingMs(userId) {
  const lastRequestAt = userCooldowns.get(userId);

  if (!lastRequestAt) {
    return 0;
  }

  const elapsed = Date.now() - lastRequestAt;
  return Math.max(0, GEMINI_COOLDOWN_MS - elapsed);
}

function markCooldown(userId) {
  userCooldowns.set(userId, Date.now());
}

function formatResponseTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

function withTimeout(promise) {
  return Promise.race([
    promise,
    sleep(GEMINI_TIMEOUT_MS).then(() => {
      const err = new Error('Gemini request timed out');
      err.name = 'TimeoutError';
      throw err;
    }),
  ]);
}

async function generateContentWithFallback(ai, contents) {
  let lastError;
  const startedAt = Date.now();

  for (const model of GEMINI_MODELS) {
    try {
      const response = await withTimeout(ai.models.generateContent({
        model: model.id,
        contents,
      }));

      return {
        response,
        model: model.label,
        responseTime: formatResponseTime(Date.now() - startedAt),
      };
    } catch (err) {
      lastError = err;

      if (isQuotaError(err)) {
        console.warn(`Gemini quota/rate limit hit for ${model.id}, trying next model...`);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

export async function geminiCommand(interaction) {
  if (!process.env.GEMINI_API_KEY) {
    await interaction.reply({ 
      content: 'Chưa cấu hình Gemini API key, không thể sử dụng lệnh này', 
      ephemeral: true 
    });
    return;
  }

  const cooldownRemainingMs = getCooldownRemainingMs(interaction.user.id);
  if (cooldownRemainingMs > 0) {
    const cooldownRemainingSeconds = Math.ceil(cooldownRemainingMs / 1000);
    await interaction.reply({
      content: `Bạn chờ ${cooldownRemainingSeconds}s rồi dùng /gemini tiếp nha.`,
      ephemeral: true,
    });
    return;
  }

  markCooldown(interaction.user.id);

  const prompt = interaction.options.getString('prompt');
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
  });

  try {
    await interaction.deferReply();

    const { response: result, model, responseTime } = await generateContentWithFallback(ai, prompt);

    const text = typeof result.text === 'function' ? await result.text() : result.text;
    const safeText = (text ?? '').toString();

    if (!safeText.trim()) {
      await interaction.editReply('Không nhận được phản hồi từ Gemini. Vui lòng thử lại.');
      return;
    }

    const embeds = buildEmbedsFromText(safeText, {
      title: 'Kết quả từ Gemini',
      color: 0x1a73e8,
      model,
      responseTime,
    });

    const batches = batchEmbedsSafely(embeds);

    for (let i = 0; i < batches.length; i++) {
      if (i === 0) {
        await interaction.editReply({ embeds: batches[i] });
      } else {
        await interaction.followUp({ embeds: batches[i] });
      }
    }
  } catch (err) {
    console.error('Gemini command error:', err);
    const message = isTimeoutError(err)
      ? 'AI dỏm nên phản hồi hơi lâu, hãy donate cho chủ bot để nâng cấp model.'
      : 'Đã xảy ra lỗi khi gọi Gemini. Vui lòng thử lại.';

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}
