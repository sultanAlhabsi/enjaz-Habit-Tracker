# حزمة أدوات الفحص المعماري والتحسين المتقدم (CodeQL-Grade Toolkit)

تم تجهيز جميع إعدادات وملفات التهيئة الخاصة بأقوى محركات فحص المعمارية والتحليل الرياضي للأداء في مشروع **إنجاز (Enjaz Habit Tracker)**. 

جميع الأدوات جاهزة للإطلاق في أي لحظة تختارها بدون أي تشغيل مسبق:

---

## 1. محرك المعمارية وجودة الكود: SonarQube 🏛️
* **الملفات الجاهزة في المشروع**:
  - [`sonar-project.properties`](file:///home/sultan/Documents/projects/habit/sonar-project.properties): إعدادات تحليل TypeScript، واستثناءات المجلدات، ومسار ملفات الاختبار.
  - [`docker-compose.sonarqube.yml`](file:///home/sultan/Documents/projects/habit/docker-compose.sonarqube.yml): تشغيل خادم SonarQube محلياً بحاوية Docker بضغطة زر واحدة.
* **الأمر المخصص لتشغيله لاحقاً**:
  ```bash
  # 1. تشغيل خادم SonarQube محلياً
  docker compose -f docker-compose.sonarqube.yml up -d
  # 2. تشغيل الفحص (بعد فتح لوحة التحكم على http://localhost:9000)
  npx sonar-scanner
  ```

---

## 2. محرك التحليل الرياضي والمنطق الصارم: Meta Infer 🔬
* **الملف الجاهز في المشروع**:
  - [`.inferconfig`](file:///home/sultan/Documents/projects/habit/.inferconfig): تفعيل محلل `pulse` لكشف تسريبات الذاكرة ومحلل `racerd` لحالات سباق التزامن.
* **الأمر المخصص لتشغيله لاحقاً**:
  ```bash
  # تشغيل فحص Infer عبر Docker الرسمي بدون تلويث النظام
  docker run -it --rm -v $(pwd):/app -w /app ghcr.io/facebook/infer:latest infer run -- npm run typecheck
  ```

---

## 3. محرك حدود المعمارية ورسم شجرة الاعتماديات: Dependency-Cruiser 📐
* **الملف الجاهز في المشروع**:
  - [`.dependency-cruiser.js`](file:///home/sultan/Documents/projects/habit/.dependency-cruiser.js): يحتوي على قواعد المعمارية الصارمة (منع الاعتماديات الدائرية، منع المكونات من استدعاء الشاشات، وعزل الخدمات).
* **الأوامر المخصصة لتشغيله لاحقاً**:
  ```bash
  # فحص حدود المعمارية وكشف الخروقات
  npx depcruise --config .dependency-cruiser.js src

  # توليد رسم بياني تفاعلي للمعمارية (HTML / SVG)
  npx depcruise --config .dependency-cruiser.js --output-type err-html src > docs/architecture-report.html
  ```

---

## 4. محرك الـ Code Property Graph: Joern 🧬
* **ما تم تجهيزه**:
  - دعم مسارات بناء الـ CPG (Code Property Graph) لتحليل تدفق البيانات الشامل.
* **الأمر المخصص لتشغيله لاحقاً**:
  ```bash
  # تشغيل Joern التفاعلي عبر Docker
  docker run -it --rm -v $(pwd):/app joernio/joern:latest joern --script scripts/cpg-analysis.sc
  ```

---

## 5. محرك تحسين أداء React والـ Re-renders: React Compiler Linter ⚡
* **الأمر المخصص لتشغيله لاحقاً**:
  ```bash
  npx eslint-plugin-react-compiler
  ```
