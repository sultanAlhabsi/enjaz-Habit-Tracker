import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { AVAILABLE_ICONS } from '../../types/habit';
import { triggerLightHaptic } from '../../utils/haptics';

interface HabitIconPickerModalProps {
  visible: boolean;
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
}

// الكلمات المفتاحية للبحث السريع بالعربية والإنجليزية
const ICON_SEARCH_KEYWORDS: Record<string, string[]> = {
  // القراءة والمعرفة والتعلم والمهارات
  'book-outline': ['قراءة', 'كتاب', 'مطالعة', 'كتب', 'علم', 'read', 'book'],
  'journal-outline': ['كتابة', 'يوميات', 'مذكرات', 'دفتر', 'تدوين', 'journal', 'write', 'diary'],
  'school-outline': ['دراسة', 'مذاكرة', 'مدرسة', 'جامعة', 'تخرج', 'school', 'study', 'exam'],
  'library-outline': ['مكتبة', 'كتب', 'بحث', 'مراجع', 'library', 'books'],
  'bulb-outline': ['فكرة', 'إبداع', 'ابتكار', 'ذكاء', 'تفكير', 'bulb', 'idea', 'creative'],
  'language-outline': ['لغات', 'تعلم', 'انجليزي', 'ترجمة', 'لسان', 'language', 'translate', 'english'],
  'pencil-outline': ['قلم', 'رسم', 'كتابة', 'تصميم', 'تخطيط', 'pencil', 'draw', 'sketch'],
  'reader-outline': ['قارئ', 'قراءة', 'مقالات', 'مقال', 'نصوص', 'reader', 'article'],
  'newspaper-outline': ['صحيفة', 'جريدة', 'أخبار', 'صحافة', 'news', 'newspaper'],
  'bookmark-outline': ['إشارة', 'حفظ', 'مرجع', 'علامة', 'bookmark'],
  'bookmarks-outline': ['إشارات', 'حفظ', 'علامات', 'bookmarks'],
  'document-text-outline': ['وثيقة', 'مستند', 'تقرير', 'ورقة', 'document', 'text', 'report'],
  'document-outline': ['مستند', 'ورقة', 'ملف', 'document'],
  'documents-outline': ['مستندات', 'أوراق', 'ملفات', 'documents'],
  'clipboard-outline': ['قائمة', 'مهام', 'لوحة', 'ملاحظات', 'clipboard', 'tasks'],
  'easel-outline': ['لوحة', 'رسم', 'حامل', 'فنون', 'easel', 'painting'],
  'color-palette-outline': ['ألوان', 'تلوين', 'فنون', 'رسم', 'palette', 'art', 'colors'],
  'color-wand-outline': ['سحر', 'إبداع', 'تعديل', 'لمسات', 'wand', 'magic'],
  'color-fill-outline': ['تلوين', 'ملء', 'طلاء', 'دهان', 'fill', 'color'],
  'shapes-outline': ['أشكال', 'هندسة', 'تصميم', 'shapes', 'geometry'],
  'brush-outline': ['فرشاة', 'رسم', 'سواك', 'نظافة', 'brush', 'paint'],

  // الصوتيات والموسيقى والإعلام
  'musical-notes-outline': ['موسيقى', 'صوت', 'استماع', 'نغم', 'ألحان', 'music', 'sound', 'melody'],
  'musical-note-outline': ['نوتة', 'لحن', 'عزف', 'music', 'note'],
  'mic-outline': ['صوت', 'بودكاست', 'إلقاء', 'تسجيل', 'مايك', 'تحدث', 'mic', 'podcast', 'record'],
  'headset-outline': ['سماعات', 'صوتيات', 'استماع', 'كتب صوتية', 'headset', 'audio', 'listen'],
  'radio-outline': ['راديو', 'إذاعة', 'بث', 'أثير', 'radio', 'broadcast'],
  'camera-outline': ['تصوير', 'كاميرا', 'صور', 'توثيق', 'camera', 'photo'],
  'videocam-outline': ['فيديو', 'تصوير', 'تسجيل', 'يوتيوب', 'video', 'record'],
  'film-outline': ['فيلم', 'سينما', 'وثائقي', 'مونتاج', 'film', 'movie'],
  'image-outline': ['صورة', 'فوتوغراف', 'خلفية', 'image', 'picture'],
  'images-outline': ['صور', 'معرض', 'ألبوم', 'تنظيم', 'images', 'gallery'],
  'aperture-outline': ['عدسة', 'كاميرا', 'فتحة', 'تصوير', 'lens', 'aperture'],

  // الرياضة واللياقة والنشاط البدني
  'fitness-outline': ['رياضة', 'لياقة', 'تمرين', 'نشاط', 'تمارين', 'fitness', 'workout', 'sport'],
  'walk-outline': ['مشي', 'خطوات', 'تمشية', 'حركة', 'walk', 'steps'],
  'footsteps-outline': ['خطوات', 'مشي', 'قدم', 'تتبع', 'footsteps', 'steps'],
  'bicycle-outline': ['دراجة', 'سيكل', 'ركوب', 'رياضة', 'bicycle', 'cycling', 'bike'],
  'barbell-outline': ['حديد', 'أثقال', 'جيم', 'تمارين', 'عضلات', 'قوة', 'gym', 'weights', 'barbell'],
  'body-outline': ['إطالة', 'مرونة', 'يوغا', 'جسم', 'body', 'stretch', 'yoga'],
  'basketball-outline': ['سلة', 'كرة سلة', 'رياضة', 'basketball'],
  'football-outline': ['قدم', 'كرة قدم', 'مباراة', 'رياضة', 'football', 'soccer'],
  'tennisball-outline': ['تنس', 'كرة مضرب', 'رياضة', 'tennis'],
  'baseball-outline': ['بيسبول', 'رياضة', 'baseball'],
  'american-football-outline': ['كرة أمريكية', 'رياضة', 'rugby'],
  'bowling-ball-outline': ['بولينج', 'لعب', 'bowling'],
  'golf-outline': ['غولف', 'رياضة', 'golf'],
  'speedometer-outline': ['سرعة', 'سباق', 'قياس', 'معدل', 'speed', 'pace'],
  'stopwatch-outline': ['ساعة إيقاف', 'توقيت', 'سباق', 'stopwatch'],
  'timer-outline': ['مؤقت', 'تركيز', 'جلسة', 'بومودورو', 'timer', 'focus'],
  'flame-outline': ['حرق', 'سعرات', 'طاقة', 'حماس', 'شغف', 'flame', 'calories', 'fire'],
  'scale-outline': ['ميزان', 'وزن', 'رشاقة', 'دايت', 'scale', 'weight'],
  'accessibility-outline': ['تمارين', 'حركة', 'تأهيل', 'نشاط', 'exercise'],
  'trophy-outline': ['كأس', 'إنجاز', 'فوز', 'هدف', 'نجاح', 'بطولة', 'trophy', 'win', 'goal'],
  'medal-outline': ['ميدالية', 'تكريم', 'إنجاز', 'وسام', 'medal', 'award'],
  'ribbon-outline': ['شريط', 'تميز', 'جائزة', 'ribbon'],
  'podium-outline': ['تتويج', 'مركز أول', 'منصة', 'podium'],

  // الصحة والعناية والراحة والنوم
  'water-outline': ['ماء', 'شرب', 'سائل', 'عطش', 'ترطيب', 'كوب', 'water', 'drink', 'hydrate'],
  'heart-outline': ['صحة', 'قلب', 'حب', 'عناية', 'heart', 'health', 'love'],
  'heart-circle-outline': ['نبض', 'قلب', 'رعاية', 'heart'],
  'pulse-outline': ['نبض', 'حيوية', 'نشاط', 'طاقة', 'pulse', 'vitality'],
  'medkit-outline': ['دواء', 'إسعاف', 'علاج', 'فيتامين', 'صيدلية', 'medkit', 'medicine'],
  'medical-outline': ['طبي', 'صحي', 'فحص', 'عيادة', 'medical', 'doctor'],
  'bandage-outline': ['علاج', 'تعافي', 'ضمادة', 'جروح', 'bandage', 'heal'],
  'thermometer-outline': ['حرارة', 'قياس', 'مقياس', 'ترمومتر', 'thermometer'],
  'eye-outline': ['عين', 'نظر', 'رؤية', 'بصر', 'eye', 'vision'],
  'ear-outline': ['أذن', 'سمع', 'استماع', 'ear', 'hearing'],
  'bed-outline': ['سرير', 'نوم', 'راحة', 'استلقاء', 'bed', 'sleep', 'rest'],
  'moon-outline': ['نوم', 'ليل', 'استرخاء', 'نوم مبكر', 'مساء', 'moon', 'sleep', 'night'],
  'happy-outline': ['سعادة', 'فرح', 'ابتسامة', 'مزاج', 'رضا', 'happy', 'smile', 'mood'],
  'sad-outline': ['حزن', 'مزاج', 'تتبع المزاج', 'مشاعر', 'sad', 'mood'],

  // الغذاء والتغذية والمشروبات
  'nutrition-outline': ['تغذية', 'أكل صحي', 'طعام', 'فواكه', 'دايت', 'nutrition', 'healthy', 'diet'],
  'restaurant-outline': ['مطعم', 'وجبة', 'غداء', 'عشاء', 'أكل', 'restaurant', 'meal', 'food'],
  'cafe-outline': ['قهوة', 'شاي', 'كافيه', 'كافيين', 'مشروب', 'صباح', 'coffee', 'tea', 'cafe'],
  'fast-food-outline': ['وجبات سريعة', 'برجر', 'سناك', 'طعام', 'fast food', 'burger'],
  'pizza-outline': ['بيتزا', 'وجبة', 'طعام', 'pizza'],
  'ice-cream-outline': ['مثلجات', 'آيسكريم', 'حلوى', 'ice cream'],
  'egg-outline': ['بيض', 'فطور', 'بروتين', 'طعام', 'egg', 'breakfast'],
  'fish-outline': ['سمك', 'مأكولات بحرية', 'أوميغا', 'fish', 'seafood'],
  'pint-outline': ['عصير', 'مشروب', 'كأس', 'drink', 'juice'],
  'wine-outline': ['سوائل', 'كأس', 'مشروبات', 'drink'],

  // العمل والتقنية والبرمجة والإنتاجية
  'laptop-outline': ['عمل', 'كمبيوتر', 'لابتوب', 'وظيفة', 'دوام', 'laptop', 'work', 'computer'],
  'desktop-outline': ['كمبيوتر مكتبي', 'شاشة', 'حاسوب', 'desktop', 'screen'],
  'tablet-portrait-outline': ['تابلت', 'آيباد', 'جهاز', 'tablet', 'ipad'],
  'phone-portrait-outline': ['هاتف', 'جوال', 'شاشة', 'تقليل الهاتف', 'phone', 'mobile'],
  'code-slash-outline': ['برمجة', 'كود', 'تطوير', 'مطور', 'code', 'programming', 'dev'],
  'code-outline': ['كود', 'شفرة', 'برمجة', 'code'],
  'terminal-outline': ['ترمينال', 'أوامر', 'باش', 'terminal', 'shell'],
  'hardware-chip-outline': ['معالج', 'شريحة', 'تقنية', 'عتاد', 'chip', 'processor'],
  'server-outline': ['سيرفر', 'خادم', 'شبكات', 'بيانات', 'server', 'database'],
  'git-branch-outline': ['تفرع', 'جيت', 'برمجة', 'git', 'branch'],
  'git-commit-outline': ['كوميت', 'حفظ برمجي', 'تحديث', 'commit'],
  'git-pull-request-outline': ['طلب دمج', 'مراجعة', 'pull request', 'pr'],
  'wifi-outline': ['واي فاي', 'إنترنت', 'اتصال', 'شبكة', 'wifi', 'internet'],
  'cloud-upload-outline': ['رفع', 'تخزين سحابي', 'نسخ احتياطي', 'upload', 'cloud'],
  'cloud-download-outline': ['تحميل', 'تنزيل', 'سحابي', 'download'],
  'briefcase-outline': ['حقيبة عمل', 'وظيفة', 'مهام', 'مشروع', 'briefcase', 'work', 'job'],
  'business-outline': ['أعمال', 'شركة', 'مؤسسة', 'تجارة', 'business', 'company'],
  'rocket-outline': ['مشروع', 'إطلاق', 'صاروخ', 'انطلاقة', 'سرعة', 'rocket', 'launch', 'startup'],
  'folder-outline': ['مجلد', 'ملفات', 'تنظيم', 'أرشيف', 'folder', 'files'],
  'folder-open-outline': ['فتح مجلد', 'ملفات', 'folder open'],
  'cube-outline': ['مكعب', 'ثلاثي الأبعاد', 'تصميم', 'تجريد', 'cube', '3d'],
  'scan-outline': ['مسح', 'سكانر', 'فحص', 'scan'],
  'qr-code-outline': ['باركود', 'رمز الاستجابة', 'qr code', 'barcode'],
  'finger-print-outline': ['بصمة', 'أمان', 'حماية', 'fingerprint', 'security'],

  // المال والميزانية والتسوق
  'wallet-outline': ['محفظة', 'فلوس', 'مال', 'ادخار', 'راتب', 'wallet', 'money', 'saving'],
  'cash-outline': ['نقود', 'كاش', 'فلوس', 'مال', 'توفير', 'cash', 'money'],
  'card-outline': ['بطاقة بنكية', 'فيزا', 'مدى', 'دفع', 'card', 'bank', 'credit'],
  'calculator-outline': ['حاسبة', 'حسابات', 'رياضيات', 'أرقام', 'مصاريف', 'calculator', 'budget'],
  'trending-up-outline': ['استثمار', 'نمو', 'صعود', 'تطور', 'أرباح', 'invest', 'growth', 'stocks'],
  'trending-down-outline': ['انخفاض', 'تقليل نفقات', 'نزول', 'trending down'],
  'bar-chart-outline': ['رسم بياني', 'إحصائيات', 'مبيعات', 'chart', 'stats'],
  'pie-chart-outline': ['توزيع مالي', 'رسم دائري', 'نسبة', 'pie chart'],
  'stats-chart-outline': ['إحصاء', 'تحليلات', 'مؤشرات', 'analytics', 'stats'],
  'analytics-outline': ['تحليلات', 'بيانات', 'أداء', 'analytics'],
  'receipt-outline': ['فاتورة', 'إيصال', 'دفع', 'مصاريف', 'receipt', 'bill'],
  'pricetag-outline': ['سعر', 'خصم', 'وسم', 'تسوق', 'price', 'tag'],
  'pricetags-outline': ['عروض', 'أسعار', 'وسوم', 'tags'],
  'cart-outline': ['عربة تسوق', 'شراء', 'سوبرماركت', 'مقاضي', 'cart', 'shopping'],
  'basket-outline': ['سلة', 'مشتريات', 'تسوق', 'basket'],
  'bag-handle-outline': ['كيس تسوق', 'مشتريات', 'shopping bag'],
  'bag-outline': ['حقيبة', 'شنطة', 'bag'],
  'storefront-outline': ['متجر', 'محل', 'دكان', 'سوق', 'store', 'shop'],

  // الروتين والتنظيم والوقت والمنزل
  'alarm-outline': ['منبه', 'استيقاظ', 'موعد', 'تنبيه', 'alarm', 'wake up'],
  'time-outline': ['وقت', 'ساعة', 'تنظيم', 'إدارة الوقت', 'time', 'clock'],
  'today-outline': ['اليوم', 'مهام اليوم', 'تاريخ', 'today'],
  'calendar-outline': ['تقويم', 'جدول', 'تخطيط أسبوعي', 'مواعيد', 'calendar', 'schedule'],
  'calendar-number-outline': ['تاريخ', 'يوم محدد', 'تقويم', 'calendar date'],
  'calendar-clear-outline': ['جدول فارغ', 'تنظيم مواعيد', 'calendar clear'],
  'watch-outline': ['ساعة يد', 'وقت', 'انضباط', 'watch'],
  'hourglass-outline': ['ساعة رملية', 'صبر', 'انتظار', 'هدوء', 'hourglass'],
  'sunny-outline': ['شمس', 'صباح', 'استيقاظ باكر', 'شروق', 'sun', 'morning'],
  'home-outline': ['بيت', 'منزل', 'ترتيب', 'تنظيف', 'عائلة', 'home', 'house', 'cleaning'],
  'shirt-outline': ['ملابس', 'أناقة', 'كي', 'غسيل', 'مظهر', 'shirt', 'clothes'],
  'glasses-outline': ['نظارة', 'قراءة', 'أناقة', 'glasses'],
  'cut-outline': ['قص', 'أظافر', 'حلاقة', 'عناية', 'cut', 'scissors', 'grooming'],
  'trash-outline': ['حذف', 'تنظيف ملفات', 'ترتيب', 'سلة', 'trash', 'clean'],
  'trash-bin-outline': ['سلة نفايات', 'تنظيف', 'trash bin'],
  'umbrella-outline': ['مظلة', 'شمسية', 'مطر', 'حماية', 'umbrella'],
  'flashlight-outline': ['كشاف', 'إضاءة', 'نور', 'flashlight'],
  'battery-charging-outline': ['شحن', 'طاقة', 'تغذية', 'battery charging'],
  'battery-full-outline': ['طاقة كاملة', 'نشاط', 'شحن كامل', 'battery full'],
  'power-outline': ['تشغيل', 'طاقة', 'انطلاق', 'power'],
  'cog-outline': ['ترس', 'إعدادات', 'صيانة', 'تنظيم', 'settings', 'cog'],
  'construct-outline': ['صيانة', 'إصلاح', 'أدوات', 'construct', 'tools'],
  'build-outline': ['بناء', 'تركيب', 'عمل يدوي', 'build'],
  'hammer-outline': ['مطرقة', 'نجارة', 'أشغال', 'hammer'],
  'key-outline': ['مفتاح', 'حلول', 'أهداف', 'key'],
  'lock-closed-outline': ['قفل', 'انضباط', 'حماية', 'خصوصية', 'lock', 'secure'],
  'shield-checkmark-outline': ['حماية', 'أمان', 'التزام', 'وقاية', 'shield', 'secure'],

  // الطبيعة والروحانية والتأمل والاستكشاف
  'sparkles-outline': ['ذكر', 'عبادة', 'تسبيح', 'أذكار', 'بريق', 'sparkles', 'dhikr', 'worship'],
  'star-outline': ['نجمة', 'تميز', 'قرآن', 'سورة', 'إتقان', 'star', 'quran'],
  'star-half-outline': ['تقييم', 'تدرج', 'نجمة', 'star half'],
  'heart-half-outline': ['سلام داخلي', 'طمأنينة', 'صفاء', 'سكينة', 'peace', 'calm'],
  'cloud-outline': ['استغفار', 'سحاب', 'غيم', 'مطر', 'cloud'],
  'cloudy-outline': ['غيوم', 'طقس', 'طبيعة', 'cloudy'],
  'cloudy-night-outline': ['ليل', 'هدوء', 'سكون', 'قيام الليل', 'night'],
  'partly-sunny-outline': ['طقس معتدل', 'شروق', 'طبيعة', 'partly sunny'],
  'rainy-outline': ['مطر', 'خير', 'بركة', 'دعاء', 'rain'],
  'snow-outline': ['ثلج', 'شتاء', 'نقاء', 'snow'],
  'thunderstorm-outline': ['عاصفة', 'رعد', 'تحدي', 'thunder'],
  'leaf-outline': ['ورقة شجر', 'طبيعة', 'نبات', 'تأمل', 'خضار', 'leaf', 'nature'],
  'flower-outline': ['وردة', 'زهرة', 'امتنان', 'سكينة', 'هدوء', 'flower'],
  'rose-outline': ['ورد', 'جمال', 'عناية', 'حب', 'rose'],
  'earth-outline': ['أرض', 'كوكب', 'بيئة', 'عالم', 'earth', 'world'],
  'planet-outline': ['تفكر', 'تدبر', 'فضاء', 'كواكب', 'planet', 'space'],
  'telescope-outline': ['تلسكوب', 'تأمل النجوم', 'استكشاف', 'telescope'],
  'binoculars-outline': ['دربيل', 'مراقبة', 'استكشاف', 'binoculars'],
  'bonfire-outline': ['نار', 'مخيم', 'صفاء', 'جلسة سمر', 'bonfire', 'campfire'],
  'compass-outline': ['قبلة', 'بوصلة', 'اتجاه', 'استقامة', 'compass', 'qibla'],
  'diamond-outline': ['ألماس', 'جوهرة', 'قيمة', 'ثمين', 'diamond'],
  'contrast-outline': ['توازن', 'اعتدال', 'تباين', 'balance', 'contrast'],
  'infinite-outline': ['أبدي', 'استمرارية', 'عادة مستمرة', 'infinity'],
  'gift-outline': ['صدقة', 'هدية', 'إحسان', 'عطاء', 'gift', 'charity'],
  'paw-outline': ['رفق بالحيوان', 'قطة', 'طير', 'رحمة', 'paw', 'animal', 'pet'],

  // السفر والتنقل والمغامرة
  'car-outline': ['سيارة', 'سياقة', 'تنقل', 'مشوار', 'car', 'drive'],
  'car-sport-outline': ['سيارة رياضية', 'سرعة', 'سباق', 'car sport'],
  'bus-outline': ['باص', 'حافلة', 'نقل عام', 'bus'],
  'train-outline': ['قطار', 'سكة حديد', 'سفر', 'train'],
  'subway-outline': ['مترو', 'قطار أنفاق', 'subway'],
  'airplane-outline': ['سفر', 'طيران', 'طائرة', 'رحلة', 'سياحة', 'airplane', 'travel', 'flight'],
  'boat-outline': ['قارب', 'سفينة', 'بحر', 'صيد', 'boat', 'ship'],
  'trail-sign-outline': ['مسار', 'هايكنج', 'مشي جبلي', 'طريق', 'trail', 'hiking'],
  'map-outline': ['خريطة', 'موقع', 'استكشاف', 'جولة', 'map'],
  'navigate-outline': ['ملاحة', 'توجيه', 'طريق', 'navigation'],
  'location-outline': ['موقع', 'عنوان', 'وصول', 'location'],

  // التواصل الاجتماعي والعلاقات والترفيه
  'people-outline': ['ناس', 'أهل', 'أصدقاء', 'عائلة', 'صلة رحم', 'تواصل', 'people', 'family', 'friends'],
  'person-outline': ['شخص', 'ذات', 'تطوير الذات', 'نفسي', 'person', 'self'],
  'chatbubbles-outline': ['حوار', 'محادثة', 'كلام', 'نقاش', 'chat', 'discussion'],
  'chatbox-ellipses-outline': ['رسالة', 'شات', 'محادثة', 'chatbox'],
  'chatbubble-ellipses-outline': ['تعليق', 'رسائل', 'chatbubble'],
  'mail-outline': ['بريد', 'إيميل', 'رسائل', 'mail', 'email'],
  'mail-open-outline': ['قراءة الإيميل', 'صندوق الوارد', 'mail open'],
  'call-outline': ['مكالمة', 'اتصال هاتفي', 'سؤال عن الأهل', 'call', 'phone'],
  'megaphone-outline': ['مكبر صوت', 'إعلان', 'نشر', 'megaphone'],
  'notifications-outline': ['تنبيهات', 'إشعارات', 'تذكير', 'notifications'],
  'paper-plane-outline': ['إرسال', 'طائرة ورقية', 'تواصل', 'paper plane'],
  'send-outline': ['إرسال', 'مراسلة', 'send'],
  'share-social-outline': ['مشاركة', 'تواصل اجتماعي', 'نشر', 'share'],
  'at-outline': ['منشن', 'إشارة', 'تواصل', 'at'],
  'thumbs-up-outline': ['إعجاب', 'تشجيع', 'ممتاز', 'أحسنت', 'thumbs up', 'like'],
  'game-controller-outline': ['ألعاب', 'بلايستيشن', 'ترفيه', 'ذكاء', 'game', 'play'],
  'dice-outline': ['نرد', 'ألعاب طاولة', 'لعب', 'dice'],
  'extension-puzzle-outline': ['لغز', 'تركيز', 'بازل', 'حل مشكلات', 'puzzle'],
  'ticket-outline': ['تذكرة', 'فعالية', 'مناسبة', 'ticket'],
  'balloon-outline': ['بالون', 'احتفال', 'فرح', 'مناسبة', 'balloon', 'party'],
  'flag-outline': ['راية', 'علم', 'محطة', 'إنجاز', 'flag', 'milestone'],
  'checkmark-circle-outline': ['إنجاز', 'اكتمال', 'تم', 'صح', 'check', 'done'],
  'checkmark-done-outline': ['انتهاء', 'إتمام كل المهام', 'double check', 'done'],
  'repeat-outline': ['تكرار', 'عادة مستمرة', 'استمرار', 'repeat', 'routine'],
  'sync-outline': ['مزامنة', 'تحديث', 'تناغم', 'sync'],
};

export const HabitIconPickerModal: React.FC<HabitIconPickerModalProps> = ({
  visible,
  selectedIcon,
  selectedColor,
  onSelectIcon,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, spacing, radius, typography } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState<string>('');

  // حساب أبعاد المربع هندسياً بدقة متناهية (5 أعمدة مربعة 1:1)
  const numColumns = windowWidth >= 600 ? 7 : 5;
  const gap = 8;
  const paddingHorizontal = spacing.base; // 16px
  const availableWidth = windowWidth - paddingHorizontal * 2;
  const tileSize = Math.floor((availableWidth - (numColumns - 1) * gap) / numColumns);

  const filteredIcons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AVAILABLE_ICONS;

    const normalizedQ = q.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');

    return AVAILABLE_ICONS.filter((item) => {
      // مطابقة اسم الأيقونة بالإنجليزية
      if (item.name.toLowerCase().includes(q)) return true;

      // مطابقة الكلمات المفتاحية بالعربية والإنجليزية
      const keywords = ICON_SEARCH_KEYWORDS[item.name];
      if (keywords) {
        return keywords.some((kw) => {
          const normKw = kw.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');
          return normKw.includes(normalizedQ) || normKw.includes(q);
        });
      }
      return false;
    });
  }, [searchQuery]);

  const handleSelect = (iconName: string) => {
    triggerLightHaptic();
    onSelectIcon(iconName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingHorizontal: spacing.base,
              paddingBottom: spacing.sm,
              borderBottomColor: theme.border,
              borderBottomWidth: 1,
              backgroundColor: theme.card,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTitleContainer}>
              <Text style={[typography.h3, { color: theme.text, textAlign: 'right' }]}>
                اختر أيقونة العادة
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, textAlign: 'right' }]}>
                اختر الرمز البصري الذي يمثّل هويّة عادتك
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: theme.cardSecondary,
                  borderRadius: radius.full,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={18} color={theme.text} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: theme.border,
                borderRadius: radius.md,
                marginTop: 12,
                marginBottom: 6,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={17}
              color={theme.textMuted}
              style={{ marginLeft: 8 }}
            />
            <TextInput
              placeholder="ابحث عن أيقونة (ماء، كتاب، رياضة...)"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[
                styles.searchInput,
                typography.caption,
                { color: theme.text, textAlign: 'right' },
              ]}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS !== 'ios' && (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Icons Grid Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: spacing.base,
            paddingBottom: insets.bottom + 30,
          }}
        >
          {filteredIcons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={40} color={theme.textMuted} />
              <Text style={[typography.subMedium, { color: theme.text, marginTop: 10 }]}>
                لم يتم العثور على أيقونات
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
                جرّب البحث بكلمة أخرى
              </Text>
            </View>
          ) : (
            <View style={styles.iconsGrid}>
              {filteredIcons.map((item) => {
                const isSelected = selectedIcon === item.name;
                return (
                  <Pressable
                    key={item.name}
                    accessibilityRole="button"
                    accessibilityLabel={`أيقونة ${item.name}`}
                    onPress={() => handleSelect(item.name)}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    style={({ pressed }) => [
                      styles.iconTile,
                      {
                        width: tileSize,
                        height: tileSize,
                        backgroundColor: isSelected
                          ? `${selectedColor}18`
                          : theme.card,
                        borderColor: isSelected ? selectedColor : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                        borderRadius: radius.md,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isSelected
                            ? selectedColor
                            : theme.cardSecondary,
                          borderRadius: radius.full,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.name as any}
                        size={22}
                        color={isSelected ? '#FFFFFF' : theme.text}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
  },
  iconsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  iconTile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
});
