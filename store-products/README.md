# ملفات المنتجات

- `products.json` : بيانات المنتجات (الاسم، المقاس، السعر، مسارات الصور) للاستخدام في أي موقع (Next.js / Supabase ...).
- `products.js`   : نفس البيانات بشكل ملف JS عشان صفحة `index.html` تشتغل بسهولة.
- الصور موجودة في ريبو `ayuuaM/image` وبتتحمّل من `https://cdn.jsdelivr.net/gh/ayuuaM/image@main/<product-id>/<n>.jpg`.
- `index.html`    : صفحة تجريبية بتعرض المنتجات بالأسعار.

## تغيير العملة
افتح `products.json` و `products.js` وغيّر قيمة `currency` (حاليًا EGP).

## إضافة منتج جديد
1. اعمل فولدر جديد في ريبو `ayuuaM/image` باسم المنتج وحط صوره.
2. انسخ أي منتج في `products.json` و `products.js` وغيّر البيانات والمسارات.

## تجربة الصفحة
على GitHub Pages، أو محليًا: `python3 -m http.server` وافتح `http://localhost:8000`.

## لو الموقع Next.js
مسارات الصور روابط كاملة على jsDelivr، فتشتغل زي ما هي من غير ما تنقل أي صور.
