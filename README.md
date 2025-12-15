[README.md](https://github.com/user-attachments/files/24163956/README.md)
# SKIPAPP v5.1.3 – Remove inner <script> from exportPDF + .nojekyll

- HTML בשרשור מחרוזות בלבד (ללא Template Literals).
- JavaScript ES5 נקי.
- **תיקון סופי**: פונקציית `exportPDF` אינה כוללת `<script>` במחרוזת ה-HTML. ההדפסה מתבצעת ב-onload של החלון החדש.
- `.nojekyll` בשורש כדי למנוע עיבוד Jekyll.
- Service Worker v5.1.3 עם שבירת קאש.

## פריסה
1. העלה את כל הקבצים לשורש הריפו.
2. Settings → Pages → Source: Deploy from a branch → `main` / `root`.
3. פתח: `https://<user>.github.io/skip-app/`.
4. DevTools → Application → Service Workers → Unregister → רענון קשיח (Ctrl+Shift+R).
