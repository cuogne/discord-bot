import { Schema } from 'mongoose';
import type { CoinGameStats, CoinUser, JackpotHits } from '../types.ts';

const gameStatsSchema = new Schema<CoinGameStats>(
  {
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    totalWagered: { type: Number, default: 0, min: 0 },
    netCoins: { type: Number, default: 0 },
  },
  { _id: false },
);

const jackpotHitsSchema = new Schema<JackpotHits>(
  {
    miss: { type: Number, default: 0, min: 0 },
    poop: { type: Number, default: 0, min: 0 },
    cherry: { type: Number, default: 0, min: 0 },
    orange: { type: Number, default: 0, min: 0 },
    grape: { type: Number, default: 0, min: 0 },
    star: { type: Number, default: 0, min: 0 },
    diamond: { type: Number, default: 0, min: 0 },
    seven: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

export const coinUserSchema = new Schema<CoinUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    dailyStreak: { type: Number, default: 0, min: 0 },
    lastDailyDate: { type: String, default: null },
    flip: { type: gameStatsSchema, default: () => ({}) },
    dice: { type: gameStatsSchema, default: () => ({}) },
    jackpot: { type: gameStatsSchema, default: () => ({}) },
    jackpotHits: { type: jackpotHitsSchema, default: () => ({}) },
    baucua: { type: gameStatsSchema, default: () => ({}) },
  },
  {
    collection: 'coinUsers',
    timestamps: true,
  },
);
