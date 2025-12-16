[README.md](https://github.com/user-attachments/files/24187824/README.md)
# SKIPAPP v5.3.1 – Stable (DOM-based render, ES5) + Strong Cache Bust

- רינדור DOM מלא (ללא HTML במחרוזות) ⇒ אין שגיאות סוגריים/מרכאות.
- טעינת JS חיצוני: `<script src="app.js?v=5231"></script>`.
- Service Worker מזהה חדש: `skipapp-v5.3.1` ו־precache ל־`app.js?v=5231`.
- `.nojekyll` בשורש; favicon מוגדר.

## פריסה
1. העלה את כל הקבצים לשורש הריפו (`main`).
2. Settings → Pages → Source: `main` / `(root)`.
3. DevTools → Application → Service Workers → **Unregister** → Clear storage.
4. פתח: `https://eliranroffe1990.github.io/skip-app/?v=5231`.
