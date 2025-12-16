[README.md](https://github.com/user-attachments/files/24185212/README.md)
# SKIPAPP v5.2.3 – External app.js + Strong Cache Bust

- טעינת JS חיצוני עם פרמטר גרסה: `<script src="app.js?v=5223"></script>`.
- Service Worker מזהה חדש: `skipapp-v5.2.3` + precache ל-`app.js?v=5223`.
- תיקון מלא לקטע 'history' שמנע SyntaxError.
- `.nojekyll` בשורש; favicon מצביע ל-`icon/icon-180.png`.

## פריסה
1. העלה את כל הקבצים לשורש הריפו (`main`).
2. Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
3. DevTools → Application → Service Workers → **Unregister** → **Ctrl+Shift+R**.
4. פתח: `https://eliranroffe1990.github.io/skip-app/?v=5223`.
