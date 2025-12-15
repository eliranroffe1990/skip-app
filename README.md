# SKIPAPP v5.1.1 – Clean ES5 + Fixes

- HTML נבנה בשרשור מחרוזות בלבד (אין Template Literals).
- קוד JavaScript בסגנון ES5 נקי (ללא optional chaining/arrow functions).
- נוספה שוב פונקציית exportPDF (חודש/רבעון). 
- Diagnostics מוצגים בפינה הימנית-תחתונה במקרה של שגיאה.
- Service Worker v5.1.1 עם שבירת קאש.

## פריסה
1. העלה את כל הקבצים לשורש הריפו.
2. Settings → Pages → Source: Deploy from a branch → `main` / `root`.
3. פתח: `https://<user>.github.io/skip-app/`.
4. DevTools → Application → Service Workers → Unregister → רענון קשיח (Ctrl+Shift+R).
