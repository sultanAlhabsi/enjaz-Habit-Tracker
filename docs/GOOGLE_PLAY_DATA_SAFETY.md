# دليل تحديث قسم أمان البيانات (Data Safety) في Google Play Console

عند تفعيل **Sentry** (عبر `EXPO_PUBLIC_SENTRY_DSN`) و**Expo Observe** في نسخة الإنتاج، يجب مطابقة نموذج **Data safety** في Google Play Console مع السلوك الفعلي للتطبيق وسياسة الخصوصية:

1. **Overview — Does your app collect or share any of the required user data types?**
   - اختر: **Yes** (عند تفعيل تقارير الأعطال الاختيارية في نسخة الإنتاج).
   - هل البيانات مشفّرة أثناء النقل (Encrypted in transit)؟ **Yes** (HTTPS / TLS إلى Sentry وExpo).
   - هل يمكن للمستخدم طلب حذف البيانات أو إيقاف الجمع؟ يظل الخيار **معطلاً افتراضياً (Opt-in)** في الإعدادات (`إرسال تقارير الأعطال لتحسين التطبيق`) ولا تُرسل أي بيانات شخصية تعرّف المستخدم.

2. **Data types -> App info and performance (معلومات التطبيق والأداء):**
   - **Crash logs** (سجلات الأعطال — `Sentry` / `Expo Observe`):
     - Collected: **Yes** (Optional — User can choose whether this data is collected / Opt-in).
     - Shared: **No** (تُستخدم لإصلاح الأعطال فقط ولا تُباع أو تُشارك لأطراف إعلانية).
     - Purpose: **App functionality / Analytics (Diagnostics)** — إصلاح الأعطال وتحسين ثبات التطبيق.
   - **Diagnostics** (بيانات التشخيص والأداء — زمن الإقلاع والتنقل بين الشاشات في `Expo Observe`):
     - Collected: **Yes** (Optional — Opt-in).
     - Shared: **No**.
     - Purpose: **App functionality / Analytics (Performance diagnostics)**.

3. **Data types التي لا يتم جمعها (اتركها غير محددة):**
   - Personal info (Name, Email, User IDs, Phone): **No** (`sendDefaultPii: false`).
   - User-generated content / Habit names / Notes: **No** (مصفّاة عبر `telemetrySanitizer.ts` و`filteredParams` في `Expo Observe`).
   - Location, Financial, Health & Fitness, Messages, Device or other IDs for advertising: **No**.

4. **رابط سياسة الخصوصية (Privacy Policy URL):**
   - تأكد أن الصفحة المنشورة على GitHub Pages (`docs/privacy.html` / `privacy.html`) محدثة ومتطابقة مع هذا الإعلان.
