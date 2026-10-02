# 🛠️ الدليل الشامل لأدوات فحص الأمان، المعمارية، وتحسين الأداء
> **تم إعداد هذا المرجع بواسطة زرياب (Ziryab) لحفظ جميع الأدوات الاحترافية لفحص وتطوير مشاريع البرمجيات وتطبيقات الموبايل.**

---

## 📑 فهرس الفئات السريعة:
1. [🛡️ أولاً: أدوات الأمان وفحص الثغرات (Security & SAST)](#1-أدوات-الأمان-وفحص-الثغرات-security--sast)
2. [🏛️ ثانياً: أدوات المعمارية والديون التقنية (Architecture & Code Quality)](#2-أدوات-المعمارية-والديون-التقنية-architecture--code-quality)
3. [⚡ ثالثاً: أدوات الأداء والتحسين وتقليص الحجم (Optimization & Dead Code)](#3-أدوات-الأداء-والتحسين-وتقليص-الحجم-optimization--dead-code)
4. [🔬 رابعاً: أدوات التحليل الرياضي العميق والـ Formal Methods](#4-أدوات-التحليل-الرياضي-العميق-والـ-formal-methods)

---

## 1. أدوات الأمان وفحص الثغرات (Security & SAST)

| الأداة | التخصص | طريقة التشغيل / التثبيت | الرابط الرسمي |
| :--- | :--- | :--- | :--- |
| **CodeQL** | محرك GitHub العملاق لتحليل تدفق البيانات (Taint Tracking) | عبر GitHub Actions تلقائياً (`.github/workflows/codeql.yml`) | [github.com/github/codeql](https://github.com/github/codeql) |
| **Semgrep OSS** | فحص سريع وخفيف لسطر الأوامر وثغرات OWASP Top 10 | `semgrep scan --config "p/security-audit"` | [semgrep.dev](https://semgrep.dev/) |
| **Gitleaks** | كشف المفاتيح والأسرار والـ Tokens المسربة في تاريخ Git | `gitleaks detect --source .` | [github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks) |
| **MobSF** | إطار فحص أمان تطبيقات الموبايل (Android / iOS / APK) | حاوية Docker على منفذ `8000` | [mobsf.github.io](https://mobsf.github.io/Mobile-Security-Framework-MobSF/) |
| **Trivy / npm audit** | فحص ثغرات التبعيات والمكتبات الخارجية (CVEs) | `trivy fs .` أو `npm audit` | [trivy.dev](https://trivy.dev/) |

### تفاصيل مختصرة:
* **CodeQL**: يُعامل الكود كقاعدة بيانات ويتحقق من مسار المدخلات غير الموثوقة من البداية وحتى نقطة التنفيذ. (مُفعل بالفعل في هذا المشروع).
* **Semgrep**: الأداة المثالية للاستخدام اليومي في جهازك المحلي لفحص الكود قبل رفعه. (مثبتة حالياً على نظامك).
* **MobSF (Mobile Security Framework)**: تفحص ملف الـ APK النهائي وإعدادات الأذونات وشبكات الاتصال للتأكد من استيفاء معايير متاجر التطبيقات.

---

## 2. أدوات المعمارية والديون التقنية (Architecture & Code Quality)

| الأداة | التخصص | طريقة التشغيل / التثبيت | الرابط الرسمي |
| :--- | :--- | :--- | :--- |
| **SonarQube** | المعيار العالمي لجودة الكود، الديون التقنية، والتعقيد الإدراكي | محلياً عبر Docker على منفذ `9000` | [sonarqube.org](https://www.sonarqube.org/) |
| **SonarLint** | فحص فوري لحظي داخل محرر VS Code أثناء كتابة الكود | إضافة مجانية من متجر VS Code Extensions | [sonarlint.org](https://www.sonarlint.org/) |
| **dependency-cruiser** | التحقق من قواعد المعمارية (Clean Architecture) ورسم المخططات | `npx depcruise --validate src` | [github.com/sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser) |
| **madge** | كشف الاعتماديات الدائرية (Circular Dependencies) وحلقات الاستيراد | `npx madge --circular src/` | [github.com/pahen/madge](https://github.com/pahen/madge) |

### تفاصيل مختصرة:
* **SonarQube**: يحسب لك بدقة "الدين التقني" بالدقائق والساعات، ويمنح مشروعك تصنيفاً من A إلى E، مع تفاصيل التعقيد (Cognitive Complexity).
* **dependency-cruiser**: تضع فيها شروطاً معمارية مثل: "ممنوع للـ Components استيراد الـ Screens"، وتقوم بتنبيهك إذا خالف الكود المعمارية.
* **madge**: تكشف الحلقات الدائرية (A يستورد B و B يستورد A) التي تسبب انهيارات مفاجئة في React Native.

---

## 3. أدوات الأداء والتحسين وتقليص الحجم (Optimization & Dead Code)

| الأداة | التخصص | طريقة التشغيل / التثبيت | الرابط الرسمي |
| :--- | :--- | :--- | :--- |
| **Knip** | صائد الكود الميت: حذف الملفات والدوال والحزم غير المستخدمة | `npx knip` | [knip.dev](https://knip.dev/) |
| **react-native-bundle-visualizer** | خريطة تفاعلية لحجم حزمة التطبيق لاكتشاف المكتبات الثقيلة | `npx react-native-bundle-visualizer` | [github.com/IjzerenHein/react-native-bundle-visualizer](https://github.com/IjzerenHein/react-native-bundle-visualizer) |
| **eslint-plugin-react-perf** | كشف وتفادي إعادة الرسم الزائد (Unnecessary Re-renders) | إضافة لـ ESLint | [github.com/cvazquez/eslint-plugin-react-perf](https://github.com/cvazquez/eslint-plugin-react-perf) |
| **React Compiler Engine** | المترجم الدلالي الجديد من فريق React لتحسين الذاكرة التلقائي | أداة فحص واكتشاف من React 19+ | [react.dev](https://react.dev/learn/react-compiler) |

### تفاصيل مختصرة:
* **Knip**: توفر عليك ساعات من البحث اليدوي عن ملفات منسية أو مكتبات في `package.json` لا يستخدمها الكود.
* **Bundle Visualizer**: ترسم لك خريطة تفاعلية (Treemap) توضح لك بالألوان والميغابايت ما الذي يجعل تطبيقك كبيراً.

---

## 4. أدوات التحليل الرياضي العميق والـ Formal Methods

| الأداة | التخصص | طريقة التشغيل / التثبيت | الرابط الرسمي |
| :--- | :--- | :--- | :--- |
| **Meta Infer** | أداة فيسبوك القائمة على المنطق الرياضي (Separation Logic) | عبر Docker أو التنزيل المباشر | [fbinfer.com](https://fbinfer.com/) |
| **Joern** | محرك بناء الـ Code Property Graph والبحث في علاقات الكود | `joern` CLI أو حاوية Docker | [joern.io](https://joern.io/) |

### تفاصيل مختصرة:
* **Meta Infer**: متخصصة في كشف تسريبات الذاكرة الصامتة (Memory Leaks) وسباق التزامن (Concurrency Races) قبل تشغيل التطبيق.
* **Joern**: تدمج شجرة الكود (AST) وتدفق التحكم (Control Flow) وتدفق البيانات (Data Flow) في قاعدة بيانات بيانية (Graph Database) قابلة للاستعلام.

---

## 📂 ملفات التهيئة المجهزة لك بالفعل داخل هذا المشروع:
- [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml): فحص الأمان الآلي لـ CodeQL على GitHub.
- [`.agents/skills/security-audit/SKILL.md`](./.agents/skills/security-audit/SKILL.md): مهارة زرياب الخاصة بالفحص الأمني الشامل.
- [`sonar-project.properties`](./sonar-project.properties): إعدادات مشروع SonarQube.
- [`docker-compose.sonarqube.yml`](./docker-compose.sonarqube.yml): تشغيل سيرفر SonarQube محلياً.
- [`.dependency-cruiser.js`](./.dependency-cruiser.js): قواعد المعمارية النظيفة.
- [`.inferconfig`](./.inferconfig): إعدادات Meta Infer.
- [`docs/ADVANCED_CODE_AUDITING_TOOLKIT.md`](./docs/ADVANCED_CODE_AUDITING_TOOLKIT.md): دليل تشغيل الأدوات بالتفصيل.
