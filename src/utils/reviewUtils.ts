/**
 * Decides when to show Google Play's in-app review sheet.
 *
 * We ask only at a moment of success (a streak of at least a week), never more
 * than a few times in total, and with a long gap between asks. Google applies
 * its own quota on top, so a request may still show nothing.
 */

export const REVIEW_STREAK_THRESHOLD = 7;
export const REVIEW_MAX_PROMPTS = 3;
export const REVIEW_COOLDOWN_DAYS = 90;

const DAY_MS = 86_400_000;

export interface ReviewPromptInput {
  currentStreak: number;
  promptCount: number;
  lastPromptAt: string | null;
  now: Date;
}

export const shouldPromptForReview = ({
  currentStreak,
  promptCount,
  lastPromptAt,
  now,
}: ReviewPromptInput): boolean => {
  if (currentStreak < REVIEW_STREAK_THRESHOLD) return false;
  if (promptCount >= REVIEW_MAX_PROMPTS) return false;

  const lastTime = lastPromptAt ? Date.parse(lastPromptAt) : NaN;
  if (Number.isNaN(lastTime)) return true;

  return now.getTime() - lastTime >= REVIEW_COOLDOWN_DAYS * DAY_MS;
};
