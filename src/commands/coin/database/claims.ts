import { Schema } from 'mongoose';
import type { Model } from 'mongoose';
import { useMongoDatabase } from '../../../core/database/mongodb/index.ts';
import { logger } from '../../../logging/logger.ts';

const CLAIM_TTL_SECONDS = 300;

interface InteractionClaim {
  interactionId: string;
  createdAt: Date;
}

const interactionClaimSchema = new Schema<InteractionClaim>(
  {
    interactionId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: () => new Date(), expires: CLAIM_TTL_SECONDS },
  },
  { collection: 'coinInteractionClaims' },
);

function getClaimModel(): Model<InteractionClaim> {
  const connection = useMongoDatabase().getConnection();
  return (
    (connection.models.CoinInteractionClaim as Model<InteractionClaim> | undefined) ??
    connection.model<InteractionClaim>('CoinInteractionClaim', interactionClaimSchema)
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11_000
  );
}

/**
 * Claims an interaction id exactly once across all bot instances and
 * restarts. Returns false when another execution already claimed it, so a
 * redelivered interaction can never settle money twice or replay a stale
 * animation over an already-shown result.
 */
export async function tryClaimInteraction(interactionId: string): Promise<boolean> {
  try {
    await getClaimModel().create({ interactionId });
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return false;
    }
    // Fail open: if Mongo itself is unreachable, the DB calls right after
    // this would fail loudly anyway.
    logger.warn(
      {
        err: error,
        interactionId,
      },
      'Failed to claim interaction, allowing execution',
    );
    return true;
  }
}
