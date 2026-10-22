export type ThemeMode = 'light' | 'dark' | 'system';

export type HabitFrequency = 'daily' | 'specific_days' | 'weekly_target' | 'monthly_day' | 'monthly_target';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  frequencyDays: number[]; // 0: Sun, 1: Mon, ..., 6: Sat
  targetCount: number;
  weeklyTargetCount?: number; // Target completions per week (e.g. 3 times/week)
  monthlyTargetCount?: number; // Target completions per month (e.g. 4 times/month)
  monthlyDay?: number; // 1 - 31 for specific day of month
  unit: string;
  isActive: boolean;
  reminderTime?: string | null;
  isPinned?: boolean;
  order?: number;
  createdAt: string;
  archivedAt?: string | null;
  updatedAt?: string;
}

export interface HabitCheckin {
  id: string; // chk_habitId_date
  habitId: string;
  date: string; // YYYY-MM-DD
  count: number; // For multi-target habits
  completed: boolean;
  updatedAt: string; // ISO date
  note?: string; // Daily reflection note / achievement diary entry
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 - 100
  totalDueDays: number;
}

export interface OverallStats {
  totalHabits: number;
  activeHabits: number;
  todayCompletionRate: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  bestOverallStreak: number;
  totalCheckinsEver: number;
  hasEverHadPerfectDay: boolean;
  weeklyAdherence: DayAdherence[];
}

export interface DayAdherence {
  dayName: string;
  dayShort: string;
  date: string; // YYYY-MM-DD
  dayIndex: number; // 0-6
  completedCount: number;
  totalCount: number;
  rate: number; // 0-100
  isFuture: boolean;
  isToday: boolean;
}

export interface HabitIconOption {
  name: string;
  label?: string;
  category?: string;
}

export const AVAILABLE_ICONS: HabitIconOption[] = [
  // القراءة والتعلم والمعرفة واللغات والمهارات
  { name: 'book-outline' },
  { name: 'journal-outline' },
  { name: 'school-outline' },
  { name: 'library-outline' },
  { name: 'bulb-outline' },
  { name: 'language-outline' },
  { name: 'pencil-outline' },
  { name: 'reader-outline' },
  { name: 'newspaper-outline' },
  { name: 'bookmark-outline' },
  { name: 'bookmarks-outline' },
  { name: 'document-text-outline' },
  { name: 'document-outline' },
  { name: 'documents-outline' },
  { name: 'clipboard-outline' },
  { name: 'easel-outline' },
  { name: 'color-palette-outline' },
  { name: 'color-wand-outline' },
  { name: 'color-fill-outline' },
  { name: 'shapes-outline' },
  { name: 'brush-outline' },

  // الصوتيات والموسيقى والإعلام
  { name: 'musical-notes-outline' },
  { name: 'musical-note-outline' },
  { name: 'mic-outline' },
  { name: 'headset-outline' },
  { name: 'radio-outline' },
  { name: 'camera-outline' },
  { name: 'videocam-outline' },
  { name: 'film-outline' },
  { name: 'image-outline' },
  { name: 'images-outline' },
  { name: 'aperture-outline' },

  // الرياضة واللياقة والنشاط البدني
  { name: 'fitness-outline' },
  { name: 'walk-outline' },
  { name: 'footsteps-outline' },
  { name: 'bicycle-outline' },
  { name: 'barbell-outline' },
  { name: 'body-outline' },
  { name: 'basketball-outline' },
  { name: 'football-outline' },
  { name: 'tennisball-outline' },
  { name: 'baseball-outline' },
  { name: 'american-football-outline' },
  { name: 'bowling-ball-outline' },
  { name: 'golf-outline' },
  { name: 'speedometer-outline' },
  { name: 'stopwatch-outline' },
  { name: 'timer-outline' },
  { name: 'flame-outline' },
  { name: 'scale-outline' },
  { name: 'accessibility-outline' },
  { name: 'trophy-outline' },
  { name: 'medal-outline' },
  { name: 'ribbon-outline' },
  { name: 'podium-outline' },

  // الصحة والعناية والراحة والنوم
  { name: 'water-outline' },
  { name: 'heart-outline' },
  { name: 'heart-circle-outline' },
  { name: 'pulse-outline' },
  { name: 'medkit-outline' },
  { name: 'medical-outline' },
  { name: 'bandage-outline' },
  { name: 'thermometer-outline' },
  { name: 'eye-outline' },
  { name: 'ear-outline' },
  { name: 'bed-outline' },
  { name: 'moon-outline' },
  { name: 'happy-outline' },
  { name: 'sad-outline' },

  // الغذاء والتغذية والمشروبات
  { name: 'nutrition-outline' },
  { name: 'restaurant-outline' },
  { name: 'cafe-outline' },
  { name: 'fast-food-outline' },
  { name: 'pizza-outline' },
  { name: 'ice-cream-outline' },
  { name: 'egg-outline' },
  { name: 'fish-outline' },
  { name: 'pint-outline' },
  { name: 'wine-outline' },

  // العمل والتقنية والبرمجة والإنتاجية
  { name: 'laptop-outline' },
  { name: 'desktop-outline' },
  { name: 'tablet-portrait-outline' },
  { name: 'phone-portrait-outline' },
  { name: 'code-slash-outline' },
  { name: 'code-outline' },
  { name: 'terminal-outline' },
  { name: 'hardware-chip-outline' },
  { name: 'server-outline' },
  { name: 'git-branch-outline' },
  { name: 'git-commit-outline' },
  { name: 'git-pull-request-outline' },
  { name: 'wifi-outline' },
  { name: 'cloud-upload-outline' },
  { name: 'cloud-download-outline' },
  { name: 'briefcase-outline' },
  { name: 'business-outline' },
  { name: 'rocket-outline' },
  { name: 'folder-outline' },
  { name: 'folder-open-outline' },
  { name: 'cube-outline' },
  { name: 'scan-outline' },
  { name: 'qr-code-outline' },
  { name: 'finger-print-outline' },

  // المال والميزانية والتسوق
  { name: 'wallet-outline' },
  { name: 'cash-outline' },
  { name: 'card-outline' },
  { name: 'calculator-outline' },
  { name: 'trending-up-outline' },
  { name: 'trending-down-outline' },
  { name: 'bar-chart-outline' },
  { name: 'pie-chart-outline' },
  { name: 'stats-chart-outline' },
  { name: 'analytics-outline' },
  { name: 'receipt-outline' },
  { name: 'pricetag-outline' },
  { name: 'pricetags-outline' },
  { name: 'cart-outline' },
  { name: 'basket-outline' },
  { name: 'bag-handle-outline' },
  { name: 'bag-outline' },
  { name: 'storefront-outline' },

  // الروتين والتنظيم والوقت والمنزل
  { name: 'alarm-outline' },
  { name: 'time-outline' },
  { name: 'today-outline' },
  { name: 'calendar-outline' },
  { name: 'calendar-number-outline' },
  { name: 'calendar-clear-outline' },
  { name: 'watch-outline' },
  { name: 'hourglass-outline' },
  { name: 'sunny-outline' },
  { name: 'home-outline' },
  { name: 'shirt-outline' },
  { name: 'glasses-outline' },
  { name: 'cut-outline' },
  { name: 'trash-outline' },
  { name: 'trash-bin-outline' },
  { name: 'umbrella-outline' },
  { name: 'flashlight-outline' },
  { name: 'battery-charging-outline' },
  { name: 'battery-full-outline' },
  { name: 'power-outline' },
  { name: 'cog-outline' },
  { name: 'construct-outline' },
  { name: 'build-outline' },
  { name: 'hammer-outline' },
  { name: 'key-outline' },
  { name: 'lock-closed-outline' },
  { name: 'shield-checkmark-outline' },

  // الطبيعة والروحانية والتأمل والاستكشاف
  { name: 'sparkles-outline' },
  { name: 'star-outline' },
  { name: 'star-half-outline' },
  { name: 'heart-half-outline' },
  { name: 'cloud-outline' },
  { name: 'cloudy-outline' },
  { name: 'cloudy-night-outline' },
  { name: 'partly-sunny-outline' },
  { name: 'rainy-outline' },
  { name: 'snow-outline' },
  { name: 'thunderstorm-outline' },
  { name: 'leaf-outline' },
  { name: 'flower-outline' },
  { name: 'rose-outline' },
  { name: 'earth-outline' },
  { name: 'planet-outline' },
  { name: 'telescope-outline' },
  { name: 'binoculars-outline' },
  { name: 'bonfire-outline' },
  { name: 'compass-outline' },
  { name: 'diamond-outline' },
  { name: 'contrast-outline' },
  { name: 'infinite-outline' },
  { name: 'gift-outline' },
  { name: 'paw-outline' },

  // السفر والتنقل والمغامرة
  { name: 'car-outline' },
  { name: 'car-sport-outline' },
  { name: 'bus-outline' },
  { name: 'train-outline' },
  { name: 'subway-outline' },
  { name: 'airplane-outline' },
  { name: 'boat-outline' },
  { name: 'trail-sign-outline' },
  { name: 'map-outline' },
  { name: 'navigate-outline' },
  { name: 'location-outline' },

  // التواصل الاجتماعي والعلاقات والترفيه
  { name: 'people-outline' },
  { name: 'person-outline' },
  { name: 'chatbubbles-outline' },
  { name: 'chatbox-ellipses-outline' },
  { name: 'chatbubble-ellipses-outline' },
  { name: 'mail-outline' },
  { name: 'mail-open-outline' },
  { name: 'call-outline' },
  { name: 'megaphone-outline' },
  { name: 'notifications-outline' },
  { name: 'paper-plane-outline' },
  { name: 'send-outline' },
  { name: 'share-social-outline' },
  { name: 'at-outline' },
  { name: 'thumbs-up-outline' },
  { name: 'game-controller-outline' },
  { name: 'dice-outline' },
  { name: 'extension-puzzle-outline' },
  { name: 'ticket-outline' },
  { name: 'balloon-outline' },
  { name: 'flag-outline' },
  { name: 'checkmark-circle-outline' },
  { name: 'checkmark-done-outline' },
  { name: 'repeat-outline' },
  { name: 'sync-outline' },
];

export const DAYS_OF_WEEK_AR = [
  { index: 0, name: 'الأحد', short: 'أحد' },
  { index: 1, name: 'الإثنين', short: 'إثن' },
  { index: 2, name: 'الثلاثاء', short: 'ثلا' },
  { index: 3, name: 'الأربعاء', short: 'أرب' },
  { index: 4, name: 'الخميس', short: 'خمي' },
  { index: 5, name: 'الجمعة', short: 'جمع' },
  { index: 6, name: 'السبت', short: 'سبت' },
];

export const HABIT_CATEGORIES = ['الكل', 'صحة', 'إنتاجية', 'روتين', 'روحانية', 'تطوير'] as const;
export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

export type HabitSortOption = 'default' | 'pending_first' | 'alphabetical' | 'reminder_time' | 'streak';

export interface HabitSortOptionItem {
  id: HabitSortOption;
  label: string;
  icon: string;
}

export const HABIT_SORT_OPTIONS: HabitSortOptionItem[] = [
  { id: 'default', label: 'الافتراضي', icon: 'reorder-four-outline' },
  { id: 'pending_first', label: 'المتبقية أولاً', icon: 'hourglass-outline' },
  { id: 'alphabetical', label: 'أبجدي (أ - ي)', icon: 'text-outline' },
  { id: 'reminder_time', label: 'وقت التنبيه', icon: 'time-outline' },
  { id: 'streak', label: 'أعلى سلسلة', icon: 'flame-outline' },
];

export interface MonthAdherenceStats {
  monthLabel: string;
  year: number;
  monthIndex: number;
  totalDueOpportunities: number;
  totalCompletions: number;
  completionRate: number;
  perfectDaysCount: number;
  totalDaysInMonth: number;
  daysPassedInMonth: number;
  activeHabitsCount: number;
}

export interface StreakMilestoneTier {
  id: string;
  name: string;
  days: number;
  icon: string;
  description: string;
}

export interface StreakMilestoneInfo {
  currentStreak: number;
  currentTier: StreakMilestoneTier;
  nextMilestone: {
    tier: StreakMilestoneTier;
    remainingDays: number;
  } | null;
  progressPercent: number; // 0 - 100
  isTopTier: boolean;
}

export interface HabitDayDistribution {
  dayIndex: number; // 0: Sun, ..., 6: Sat
  dayName: string;
  dayShort: string;
  dueCount: number;
  completedCount: number;
  rate: number; // 0 - 100
}

export interface HabitConsistencyPattern {
  days: HabitDayDistribution[];
  bestDay: HabitDayDistribution | null;
  weakestDay: HabitDayDistribution | null;
  insightMessage: string;
}

export interface CategoryPerformanceItem {
  category: Exclude<HabitCategory, 'الكل'>;
  iconName: string;
  color: string;
  totalHabits: number;
  activeHabits: number;
  totalCheckins: number;
  completionRate: number; // 0 - 100
}

export interface CategoryAnalytics {
  categories: CategoryPerformanceItem[];
  topCategory: CategoryPerformanceItem | null;
  focusCategory: CategoryPerformanceItem | null;
  balanceScore: number; // 0 - 100
  insightMessage: string;
}

