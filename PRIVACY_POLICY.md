# سياسة الخصوصية وأمان البيانات — تطبيق إنجاز (Enjaz Habit Tracker)
**آخر تحديث:** 27 نوفمبر 2026

تطبيق **"إنجاز"** مبني وفق مبدأ أساسي: **الخصوصية أولاً (Privacy-First)** والتخزين المحلي المباشر (**Local-First**). نحن نؤمن بأن عاداتك اليومية وسجلاتك وأفكارك هي بياناتك الشخصية البحتة التي لا يحق لأحد الاطلاع عليها.

---

## 1. ما البيانات التي يجمعها التطبيق؟

- **البيانات المحلية:** جميع العادات المسجلة، التواريخ، السجلات اليومية، الملاحظات والخواطر، تُخزن محلياً داخل جهازك بشكل كامل في قاعدة بيانات SQLite في المساحة المعزولة الخاصة بالتطبيق (App Sandboxed Storage).
- **لا توجد بيانات شخصية إلزامية:** لا يتطلب التطبيق منك تسجيل الاسم، البريد الإلكتروني، رقم الهاتف، أو إنشاء حساب للبدء في استخدامه.
- **لا إعلانات ولا تتبع سلوكي:** التطبيق خالٍ تماماً 100% من أي برمجيات إعلانية (No Advertising SDKs)، أو برمجيات تتبع سلوكي (No Third-Party Behavior Analytics)، أو أدوات جمع البيانات التعريفية للأجهزة (No Device Fingerprinting).

---

## 2. تقارير الأعطال والأداء الاختيارية (Opt-In Diagnostics)

- **معطّلة افتراضياً (Disabled by Default):** لا يرسل التطبيق أي تقارير أعطال أو بيانات أداء خارج جهازك بشكل افتراضي.
- **خيار طوعي من الإعدادات:** إذا اخترت تفعيل خيار **"إرسال تقارير الأعطال لتحسين التطبيق"** من شاشة الإعدادات، قد يرسل التطبيق تقارير تقنية مجهولة للأعطال (`Sentry`) ومقاييس سرعة الإقلاع والتنقل بين الشاشات (`Expo Observe`) لغرض وحيد هو إصلاح الأعطال وتحسين ثبات وأداء التطبيق.
- **حماية محتواك الشخصي:** يتم تعطيل جمع البيانات الشخصية (`PII`) وتنقيتها قبل الإرسال؛ لا يتم إطلاقاً إرسال أسماء عاداتك، أو ملاحظاتك، أو سجلات إنجازك، أو أي محتوى نصي تكتبه داخل التطبيق.
- **إيقاف فوري:** يمكنك إيقاف هذا الخيار في أي وقت من شاشة الإعدادات، ليتوقف الإرسال فورياً.

---

## 3. التخزين المحلي لبيانات عاداتك (Local-First)

- **عاداتك لا تغادر هاتفك:** لا يتم إرسال أو رفع أو تخزين أي من عاداتك، سجلاتك، تواريخك، أو ملاحظاتك الشخصية على أي سيرفر أو خادم إطلاقاً.
- **لا توجد معالجة خارجية لبياناتك:** جميع العمليات الحسابية، تتبع السلاسل (Streaks)، والإحصائيات تتم معالجتها بالكامل داخل جهازك وبشكل فوري.

---

## 4. الأذونات والصلاحيات (Permissions)

يطلب التطبيق فقط الحد الأدنى الصارم من الأذونات التي تخدم وظائفه التشغيلية المباشرة:

| الإذن | الغرض |
| :--- | :--- |
| **الإشعارات (`POST_NOTIFICATIONS`)** | لإرسال تنبيهات تذكير العادات ومراجعة المساء التي تحددها بنفسك. يتم توليد التنبيهات ومعالجتها محلياً داخل جهازك. |
| **الاهتزاز (`VIBRATE`)** | لتقديم التغذية اللمسية (Haptic Feedback) المريحة عند إنجاز العادة. |
| **الإنترنت (`INTERNET`)** | لفتح الروابط الخارجية (مثل مستودع المشروع والتواصل) عبر المتصفح، ولإرسال تقارير الأعطال والأداء التقنية **فقط** إذا فعّلت خيار "إرسال تقارير الأعطال لتحسين التطبيق" من الإعدادات. |

> 🚫 **تأكيد:** التطبيق **لا يطلب ولا يستخدم** أذونات التخزين المشترك (`READ/WRITE_EXTERNAL_STORAGE`)، ولا إذن تعديل إعدادات الصوت (`MODIFY_AUDIO_SETTINGS`)، ولا إذن الميكروفون (`RECORD_AUDIO`)، ولا يطلب موقعك الجغرافي (`ACCESS_FINE_LOCATION`)، ولا جهات اتصالك، ولا يطلب صلاحية النوافذ العائمة (`SYSTEM_ALERT_WINDOW`).

---

## 5. ملكية البيانات والتحكم الكامل

- **تصدير البيانات:** يتيح لك التطبيق في أي وقت تصدير نسخة كاملة من عاداتك وسجلاتك بصيغة **JSON** أو جداول **CSV** ومشاركتها أو حفظها أينما شئت.
- **حذف البيانات نهائياً:** يمكنك من شاشة "الإعدادات > مسح كافة البيانات نهائياً" مسح كل عاداتك وسجلاتك بنقرة واحدة من جهازك بشكل فوري ودائم لا رجعة فيه.

---

## 6. خصوصية الأطفال

التطبيق مناسب لجميع الفئات العمرية ولا يجمع أي معلومات شخصية موجهة للأطفال أو القاصرين.

---

## 7. التواصل والاستفسارات

إذا كان لديك أي سؤال أو استفسار حول سياسة الخصوصية وأمان البيانات في تطبيق "إنجاز"، يمكنك التواصل معنا عبر:
- **البريد الإلكتروني للمطور:** `ssultan.j2@gmail.com`
- **مستودع المشروع:** [GitHub: sultanAlhabsi/enjaz-Habit-Tracker](https://github.com/sultanAlhabsi/enjaz-Habit-Tracker)

---

# Privacy Policy — Enjaz Habit Tracker (English Summary)
**Last Updated:** November 27, 2026

**Enjaz** is designed with a **Privacy-First, Local-First** architecture.

1. **Data Storage & Collection:** All habits, checkins, streaks, and personal notes are stored strictly and locally on your device in a sandboxed SQLite database. No registration, login, phone number, or email is required.
2. **Zero Ads & Zero Behavioral Tracking:** The application contains 0% advertising SDKs and 0% third-party behavioral analytics. Your personal habits and notes never leave your phone.
3. **Optional Opt-In Crash & Performance Diagnostics:** By default, crash reporting and performance diagnostics are **disabled**. Only if you explicitly opt in via Settings ("إرسال تقارير الأعطال لتحسين التطبيق"), the app transmits anonymized crash logs (`Sentry`) and screen/startup performance metrics (`Expo Observe`) solely for app stability and performance. Personal identifiers (`PII`) are disabled, and user-entered habit names, notes, or check-in records are scrubbed and never transmitted. You may opt out at any time.
4. **Permissions:**
   - `POST_NOTIFICATIONS`: To deliver your locally-scheduled habit reminders and evening reviews.
   - `VIBRATE`: For subtle tactile confirmation upon habit completion.
   - `INTERNET`: Used for opening external documentation/support links in the device browser and, strictly when opted in by the user, sending anonymized crash/performance diagnostics.
   - *No microphone access, no location tracking, and no background tracking services.*
5. **Data Ownership & Deletion:** You can export your data anytime (JSON/CSV) and permanently erase all records with one click via Settings.
6. **Contact:** For questions or feedback, reach out to `ssultan.j2@gmail.com`.
