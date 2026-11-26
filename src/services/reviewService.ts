/**
 * Asks for a Google Play rating at a moment of success (a week-long streak),
 * using the native in-app review sheet so the user never leaves the app.
 */

import type { Habit, HabitCheckin } from '../types/habit.ts';
import { calculateHabitStats } from '../utils/habitUtils.ts';
import { shouldPromptForReview } from '../utils/reviewUtils.ts';
import { getPreference, setPreference } from './database.ts';

const PROMPT_COUNT_KEY = 'review_prompt_count';
const LAST_PROMPT_KEY = 'review_last_prompt_at';

// Let the completion haptic, sound and animation finish before the sheet slides up.
const PROMPT_DELAY_MS = 1500;

let isChecking = false;

type StoreReviewModule = typeof import('expo-store-review');

const loadStoreReview = (): StoreReviewModule | null => {
  try {
    // Loaded lazily: an OTA update reaching an older binary that lacks this
    // native module must skip the prompt, not crash on startup.
    return require('expo-store-review') as StoreReviewModule;
  } catch (_) {
    return null;
  }
};

/**
 * Call after one or more habits were just completed. Fire-and-forget: it never
 * throws and never blocks the check-in flow.
 */
export const maybeRequestReview = async (
  completedHabits: Habit[],
  allCheckins: HabitCheckin[]
): Promise<void> => {
  if (isChecking || completedHabits.length === 0) return;
  isChecking = true;

  try {
    const currentStreak = Math.max(
      ...completedHabits.map((h) => calculateHabitStats(h, allCheckins).currentStreak)
    );
    const promptCount = parseInt(await getPreference(PROMPT_COUNT_KEY, '0'), 10) || 0;
    const lastPromptAt = (await getPreference(LAST_PROMPT_KEY, '')) || null;

    if (!shouldPromptForReview({ currentStreak, promptCount, lastPromptAt, now: new Date() })) {
      return;
    }

    const StoreReview = loadStoreReview();
    if (!StoreReview || !(await StoreReview.isAvailableAsync())) return;

    await new Promise((resolve) => setTimeout(resolve, PROMPT_DELAY_MS));

    await setPreference(PROMPT_COUNT_KEY, String(promptCount + 1));
    await setPreference(LAST_PROMPT_KEY, new Date().toISOString());
    await StoreReview.requestReview();
  } catch (_) {
    // A failed review request must never affect check-ins.
  } finally {
    isChecking = false;
  }
};
