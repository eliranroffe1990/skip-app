[README.md](https://github.com/user-attachments/files/24187411/README.md)
# SKIPAPP v5.3.0 – Stable build (ES5, no inline onclick) + Strong Cache Bust

- טעינת JS חיצוני בלבד: `<script src="app.js?v=5230"></script>`.
- Service Worker עם מזהה חדש: `skipapp-v5.3.0` ו־precache ל־`app.js?v=5230`.
- כל האירועים מחוברים ב־JS (Event Delegation) — אין `onclick` בתוך HTML מחרוזות → פחות שגיאות תחביר.
- `.nojekyll` בשורש; favicon מצביע ל־`icon/icon-180.png`.

## פריסה
1. העלה את כל הקבצים לשורש הריפו (`main`).
2. Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
3. DevTools → Application → Service Workers → **Unregister** → Clear storage.
4. פתח: `https://eliranroffe1990.github.io/skip-app/?v=5230`.

## אימות
- Network: `app.js?v=5230` → 200 OK.
- Console: נקי משגיאות.
- View Source: בסוף `<script src="app.js?v=5230"></script>`.
