# LISHU — אתר פורטפוליו עובד עם Sirv + Vercel

הגרסה הזו לא מסתמכת על קישור `?json=true`, כי Sirv לא מספק רשימת תיקייה ציבורית בדרך הזו.

במקום זאת, האתר משתמש בפונקציית שרת מאובטחת של Vercel:
- הסיסמה של Sirv לא מופיעה בקוד ולא נחשפת ללקוחות.
- האתר קורא אוטומטית את כל התיקיות והתמונות שבתוך `/stills`.
- הוספת תמונה חדשה ל־Sirv מעדכנת את האתר אוטומטית.

## 1. יצירת API Client ב־Sirv

ב־Sirv:

1. היכנסי ל־Settings.
2. פתחי את אזור REST API / API clients.
3. צרי API Client חדש.
4. תני לו הרשאת `files:read` בלבד, אם ניתן לבחור הרשאות.
5. שמרי אצלך:
   - Client ID
   - Client Secret

אל תעלי את ה־Client Secret ל־GitHub ואל תשלחי אותו לאף אחד.

## 2. העלאה ל־GitHub

חלצי את ה־ZIP והעלי ל־Repository את כל הקבצים והתיקיות, כולל התיקייה:

```text
api/gallery.js
```

## 3. חיבור ל־Vercel

ב־Vercel:

1. פתחי את הפרויקט.
2. היכנסי ל־Settings.
3. פתחי Environment Variables.
4. הוסיפי:

```text
SIRV_CLIENT_ID
```

והדביקי את ה־Client ID.

5. הוסיפי:

```text
SIRV_CLIENT_SECRET
```

והדביקי את ה־Client Secret.

6. שמרי.
7. עברי ל־Deployments ולחצי Redeploy על הפריסה האחרונה.

## 4. מבנה התיקיות ב־Sirv

האתר קורא אוטומטית:

```text
/stills
  /wrestling
  /portraits
  /street
  /oneyear
```

אין צורך ב־Publicly visible listing. אפשר להחזיר אותו ל־No.

## הוספת תמונות בעתיד

פשוט העלי תמונה לתיקייה המתאימה ב־Sirv. היא תופיע באתר בתוך כמה דקות.

## הוספת קטגוריה חדשה

צרי תיקייה חדשה בתוך `/stills`, למשל:

```text
/stills/events
```

היא תופיע אוטומטית. כדי לתת לה שם עברי מסודר, הוסיפי אותה ב־`config.js`.
