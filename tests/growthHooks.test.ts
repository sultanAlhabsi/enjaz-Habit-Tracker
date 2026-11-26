import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAY_STORE_URL,
  PLAY_STORE_SHARE_URL,
  SHARE_DOWNLOAD_LINE,
  appendDownloadLink,
} from '../src/utils/storeLinks.ts';
import {
  shouldPromptForReview,
  REVIEW_STREAK_THRESHOLD,
  REVIEW_MAX_PROMPTS,
  REVIEW_COOLDOWN_DAYS,
} from '../src/utils/reviewUtils.ts';
import {
  formatDailySummaryForShare,
  formatOverallStatsForShare,
  formatMonthlySummaryForShare,
  formatHabitStatsForShare,
  formatHabitNotesForShare,
  calculateHabitStats,
  calculateStreakMilestone,
} from '../src/utils/habitUtils.ts';
import type { Habit, HabitCheckin, MonthAdherenceStats } from '../src/types/habit.ts';

const sampleHabit: Habit = {
  id: 'h_walk',
  name: 'المشي',
  icon: 'walk',
  color: '#2E7D32',
  frequency: 'daily',
  frequencyDays: [0, 1, 2, 3, 4, 5, 6],
  targetCount: 1,
  unit: 'مرة',
  isActive: true,
  createdAt: '2026-06-01T00:00:00.000Z',
};

const sampleCheckins: HabitCheckin[] = [
  {
    id: 'chk_h_walk_2026-06-15',
    habitId: 'h_walk',
    date: '2026-06-15',
    count: 1,
    completed: true,
    updatedAt: '2026-06-15T08:00:00.000Z',
    note: 'جولة ممتعة',
  } as HabitCheckin,
];

test('storeLinks: Play Store URL points at the published package', () => {
  assert.equal(
    PLAY_STORE_URL,
    'https://play.google.com/store/apps/details?id=com.enjaz.habittracker'
  );
  assert.ok(PLAY_STORE_SHARE_URL.startsWith(PLAY_STORE_URL));
  assert.ok(PLAY_STORE_SHARE_URL.includes('referrer=utm_source%3Dapp_share'));
  assert.ok(SHARE_DOWNLOAD_LINE.includes(PLAY_STORE_SHARE_URL));
});

test('appendDownloadLink: puts the download line last, once', () => {
  const result = appendDownloadLink('تقرير\n\n');
  assert.equal(result, `تقرير\n${SHARE_DOWNLOAD_LINE}`);
  assert.equal(result.split(PLAY_STORE_SHARE_URL).length - 1, 1);
});

test('share formatters: every shared text ends with the download link', () => {
  const stats = calculateHabitStats(sampleHabit, sampleCheckins, '2026-06-15');
  const milestone = calculateStreakMilestone(stats.currentStreak);
  const monthStats = {
    monthLabel: 'يونيو 2026',
    completionRate: 80,
    totalCompletions: 48,
    perfectDaysCount: 18,
    activeHabitsCount: 3,
  } as MonthAdherenceStats;

  const texts = [
    formatDailySummaryForShare('2026-06-15', [sampleHabit], sampleCheckins),
    formatDailySummaryForShare('2026-06-15', [], []),
    formatOverallStatsForShare([sampleHabit], sampleCheckins, '2026-06-15'),
    formatMonthlySummaryForShare(monthStats),
    formatHabitStatsForShare(sampleHabit, stats, milestone),
    formatHabitNotesForShare(sampleHabit, sampleCheckins),
    formatHabitNotesForShare(sampleHabit, []),
  ];

  for (const text of texts) {
    assert.ok(text.endsWith(SHARE_DOWNLOAD_LINE), `missing download link in:\n${text}`);
  }
});

test('shouldPromptForReview: waits until the streak threshold is reached', () => {
  const now = new Date('2026-11-26T10:00:00.000Z');
  assert.equal(REVIEW_STREAK_THRESHOLD, 7);
  assert.equal(
    shouldPromptForReview({ currentStreak: 6, promptCount: 0, lastPromptAt: null, now }),
    false
  );
  assert.equal(
    shouldPromptForReview({ currentStreak: 7, promptCount: 0, lastPromptAt: null, now }),
    true
  );
});

test('shouldPromptForReview: respects the cooldown between prompts', () => {
  const now = new Date('2026-11-26T10:00:00.000Z');
  const recent = new Date(now.getTime() - (REVIEW_COOLDOWN_DAYS - 1) * 86_400_000).toISOString();
  const old = new Date(now.getTime() - REVIEW_COOLDOWN_DAYS * 86_400_000).toISOString();

  assert.equal(
    shouldPromptForReview({ currentStreak: 30, promptCount: 1, lastPromptAt: recent, now }),
    false
  );
  assert.equal(
    shouldPromptForReview({ currentStreak: 30, promptCount: 1, lastPromptAt: old, now }),
    true
  );
});

test('shouldPromptForReview: stops after the maximum number of prompts', () => {
  const now = new Date('2026-11-26T10:00:00.000Z');
  assert.equal(
    shouldPromptForReview({
      currentStreak: 30,
      promptCount: REVIEW_MAX_PROMPTS,
      lastPromptAt: '2025-01-01T00:00:00.000Z',
      now,
    }),
    false
  );
});

test('shouldPromptForReview: treats a corrupt stored date as never prompted', () => {
  const now = new Date('2026-11-26T10:00:00.000Z');
  assert.equal(
    shouldPromptForReview({ currentStreak: 7, promptCount: 1, lastPromptAt: 'not-a-date', now }),
    true
  );
});
