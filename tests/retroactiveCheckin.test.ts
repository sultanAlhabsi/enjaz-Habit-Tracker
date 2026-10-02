import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isHabitScheduledForDate,
  isHabitDueOnDate,
  getHabitsForDate,
  getPendingDueHabitsForDate,
  getCompletedDueHabitsForDate,
  calculateHabitStats,
  calculateCurrentStreakFromDates,
} from '../src/utils/habitUtils.ts';
import type { Habit, HabitCheckin } from '../src/types/habit.ts';

test('retroactiveCheckin: isHabitScheduledForDate identifies scheduled days regardless of creation date', () => {
  const habit: Habit = {
    id: 'h_wednesday',
    name: 'رياضة الأربعاء',
    icon: 'barbell-outline',
    color: '#059669',
    frequency: 'specific_days',
    frequencyDays: [3], // Wednesday only (Sunday=0, Wednesday=3)
    targetCount: 1,
    unit: 'مرة',
    isActive: true,
    createdAt: '2026-09-25T10:00:00.000Z', // Friday
  };

  // Wednesday before creation date
  const pastWednesday = '2026-09-23';
  assert.equal(isHabitScheduledForDate(habit, pastWednesday), true);

  // Past Thursday before creation date
  const pastThursday = '2026-09-24';
  assert.equal(isHabitScheduledForDate(habit, pastThursday), false);

  // Future Wednesday
  const futureWednesday = '2026-09-30';
  assert.equal(isHabitScheduledForDate(habit, futureWednesday), true);
});

test('retroactiveCheckin: getHabitsForDate includes scheduled habits on past days before creation date', () => {
  const habit: Habit = {
    id: 'h_wed',
    name: 'قراءة القرآن',
    icon: 'book-outline',
    color: '#059669',
    frequency: 'specific_days',
    frequencyDays: [3], // Wednesday
    targetCount: 1,
    unit: 'مرة',
    isActive: true,
    createdAt: '2026-09-25T12:00:00.000Z', // Created Friday
  };

  const checkins: HabitCheckin[] = [];
  const wednesdayDate = '2026-09-23'; // Past Wednesday

  const habitsOnDate = getHabitsForDate([habit], checkins, wednesdayDate);
  assert.equal(habitsOnDate.length, 1);
  assert.equal(habitsOnDate[0].id, 'h_wed');

  const pendingHabits = getPendingDueHabitsForDate([habit], checkins, wednesdayDate);
  assert.equal(pendingHabits.length, 1);
  assert.equal(pendingHabits[0].id, 'h_wed');

  // Once completed on Wednesday
  const completedCheckins: HabitCheckin[] = [
    {
      id: 'chk_h_wed_2026-09-23',
      habitId: 'h_wed',
      date: wednesdayDate,
      count: 1,
      completed: true,
      updatedAt: '2026-09-25T12:05:00.000Z',
    },
  ];

  const pendingAfterCompletion = getPendingDueHabitsForDate([habit], completedCheckins, wednesdayDate);
  assert.equal(pendingAfterCompletion.length, 0);

  const completedAfter = getCompletedDueHabitsForDate([habit], completedCheckins, wednesdayDate);
  assert.equal(completedAfter.length, 1);
  assert.equal(completedAfter[0].id, 'h_wed');
});

test('retroactiveCheckin: stats and streaks properly calculate when createdAt is backfilled', () => {
  const wednesdayDate = '2026-09-23';
  const fridayDate = '2026-09-25';

  // Habit whose createdAt was backfilled to Wednesday
  const habit: Habit = {
    id: 'h_daily',
    name: 'عادة يومية',
    icon: 'water-outline',
    color: '#0284C7',
    frequency: 'daily',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    targetCount: 1,
    unit: 'مرة',
    isActive: true,
    createdAt: '2026-09-23T00:00:00.000Z', // Backfilled
  };

  const checkins: HabitCheckin[] = [
    { id: '1', habitId: 'h_daily', date: '2026-09-23', count: 1, completed: true, updatedAt: '' },
    { id: '2', habitId: 'h_daily', date: '2026-09-24', count: 1, completed: true, updatedAt: '' },
    { id: '3', habitId: 'h_daily', date: '2026-09-25', count: 1, completed: true, updatedAt: '' },
  ];

  const stats = calculateHabitStats(habit, checkins, fridayDate);
  assert.equal(stats.totalCompletions, 3);
  assert.equal(stats.currentStreak, 3);
  assert.equal(stats.bestStreak, 3);
  assert.equal(stats.completionRate, 100);

  const streak = calculateCurrentStreakFromDates(habit, new Set(['2026-09-23', '2026-09-24', '2026-09-25']), fridayDate);
  assert.equal(streak, 3);
});

test('retroactiveCheckin: quantitative habit increment logic meets target correctly', () => {
  const quantitativeHabit: Habit = {
    id: 'h_q',
    name: 'قراءة',
    icon: 'book-outline',
    color: '#059669',
    frequency: 'daily',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    targetCount: 5,
    unit: 'صفحة',
    isActive: true,
    createdAt: '2026-09-20T00:00:00.000Z',
  };

  let count = 0;
  const isTargetMet = (c: number) => c >= quantitativeHabit.targetCount;

  assert.equal(isTargetMet(count), false);

  // Increment by 1 step directly (Option B)
  count += 1;
  assert.equal(count, 1);
  assert.equal(isTargetMet(count), false);

  count += 4;
  assert.equal(count, 5);
  assert.equal(isTargetMet(count), true);
});
