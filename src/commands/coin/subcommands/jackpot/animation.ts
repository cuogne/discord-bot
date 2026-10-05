import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../../../logging/logger.ts';
import { buildJackpotEmbed, type JackpotRound } from './embed.ts';

const JACKPOT_REEL_DELAY_MS = 900;
const FINAL_EDIT_RETRY_DELAY_MS = 1_000;
const FINAL_EDIT_ATTEMPTS = 3;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function revealSlots(
  interaction: ChatInputCommandInteraction,
  round: JackpotRound,
): Promise<void> {
  for (let revealedCount = 1; revealedCount < round.result.symbols.length; revealedCount += 1) {
    try {
      await interaction.editReply({
        embeds: [buildJackpotEmbed(round, revealedCount)],
      });
    } catch (error) {
      logger.warn(
        {
          err: error,
          userId: interaction.user.id,
          revealedCount,
        },
        'Failed to show jackpot animation frame',
      );
      break;
    }

    await wait(JACKPOT_REEL_DELAY_MS);
  }
}

async function showFinalResult(
  interaction: ChatInputCommandInteraction,
  round: JackpotRound,
): Promise<void> {
  const embed = buildJackpotEmbed(round, round.result.symbols.length);

  for (let attempt = 1; attempt <= FINAL_EDIT_ATTEMPTS; attempt += 1) {
    try {
      await interaction.editReply({
        embeds: [embed],
      });
      return;
    } catch (error) {
      logger.warn(
        {
          err: error,
          userId: interaction.user.id,
          attempt,
        },
        'Failed to show final jackpot result',
      );

      if (attempt < FINAL_EDIT_ATTEMPTS) {
        await wait(FINAL_EDIT_RETRY_DELAY_MS);
      }
    }
  }

  // The bet is already settled, so send the result as a new message if edits fail.
  await interaction.followUp({
    embeds: [embed],
  });
}

export async function animateJackpot(
  interaction: ChatInputCommandInteraction,
  round: JackpotRound,
): Promise<void> {
  await revealSlots(interaction, round);
  await showFinalResult(interaction, round);
}
