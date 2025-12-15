[README.md](https://github.com/user-attachments/files/24167710/README.md)
# SKIPAPP v5.2.2 – External app.js + Strong Cache Bust

- טעינת JS חיצוני עם פרמטר גרסה: `<script src="app.js?v=5222"></script>`.
- Service Worker מזהה חדש: `skipapp-v5.2.2` + precache ל-`app.js?v=5222`.
- ES5 נקי; אין `<script>` בתוך מחרוזות.
- `.nojekyll` בשורש למנוע Jekyll.

## פריסה
1. העלה את כל הקבצים לשורש הריפו (`main`).
2. Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
3. DevTools → Application → Service Workers → **Unregister** → **Ctrl+Shift+R**.
4. פתח: `https://eliranroffe1990.github.io/skip-app/?v=5222`.
