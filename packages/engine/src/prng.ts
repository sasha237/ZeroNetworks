import type { GameState } from './types.js';

export function random(state: GameState): number {
  state.rngState = (state.rngState + 0x6d2b79f5) >>> 0;
  let t = state.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomInt(state: GameState, min: number, max: number): number {
  return Math.floor(random(state) * (max - min + 1)) + min;
}

export function pick<T>(state: GameState, values: T[]): T {
  return values[Math.floor(random(state) * values.length)];
}

export function shuffle<T>(state: GameState, values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
