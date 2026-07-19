# LISHU — אתר פורטפוליו אוטומטי

האתר בנוי כך שהוא קורא אוטומטית את התיקיות שלך ב־Sirv.

## המבנה שכבר קיים אצלך

```text
/stills
  /wrestling
  /portraits
  /street
  /oneyear
```

כל התמונות שבתיקיות האלה יוצגו באתר.

## הדבר החשוב שחייבים לעשות ב־Sirv

Sirv משאיר תיקיות פרטיות כברירת מחדל. כדי שהאתר יוכל לקרוא את רשימת
התמונות בלי לחשוף סיסמה או מפתח API:

1. היכנסי ל־Sirv.
2. לחצי קליק ימני על התיקייה `stills`.
3. בחרי להפוך אותה ל־Public / Public folder listing.
4. חזרי על הפעולה גם בתיקיות:
   - wrestling
   - portraits
   - street
   - oneyear

התמונות עצמן כבר נגישות דרך ה־CDN; הפעולה הזו מאפשרת לאתר לקבל רשימת קבצים.

אפשר לבדוק שזה עובד באמצעות פתיחת הכתובת:

```text
https://lishuportfolio.sirv.com/stills/wrestling/?json=true
```

אם מופיע JSON עם רשימת קבצים — הכול מוכן.

## הוספת תמונות בעתיד

פשוט העלי תמונה לתיקייה המתאימה ב־Sirv. אין צורך לשנות קוד, GitHub או Vercel.

לדוגמה:

```text
/stills/wrestling/new-photo.jpg
```

לאחר רענון האתר, התמונה תופיע אוטומטית.

## הוספת תחום צילום חדש

צרי בתוך `stills` תיקייה חדשה, למשל:

```text
/stills/events
```

הפכי גם אותה ל־Public והעלי אליה תמונות. האתר יציג אותה אוטומטית.

כדי לתת לה שם ותיאור יפים, פתחי `config.js` והוסיפי:

```js
events: {
  title: "אירועים",
  subtitle: "Events & Celebrations",
  order: 5
}
```

גם בלי להוסיף אותה ל־config, התיקייה עדיין תופיע באתר בשם שנגזר משם התיקייה.

## העלאה ל־GitHub

1. חלצי את קובץ ה־ZIP.
2. צרי Repository חדש ב־GitHub.
3. העלי את כל הקבצים שבתוך התיקייה:
   - index.html
   - styles.css
   - config.js
   - script.js
   - README.md
4. בצעי Commit.

## פרסום דרך Vercel

1. היכנסי ל־Vercel.
2. לחצי **Add New → Project**.
3. בחרי את ה־Repository שיצרת.
4. ב־Framework Preset בחרי **Other**.
5. אין צורך ב־Build Command.
6. לחצי **Deploy**.

## שינוי קישורים

הקישורים לאינסטגרם ולטיקטוק כבר הוכנסו.

אפשר לשנות אותם בקובץ `config.js`, אך שימי לב שכפתורי יצירת הקשר נמצאים
גם בתוך `index.html`. חפשי שם `instagram.com/lishu.il`.

## הסתרת תמונה בלי למחוק אותה

שני את שם הקובץ כך שיתחיל בקו תחתון:

```text
_DSC1234.jpg
```

האתר לא יציג קבצים שמתחילים ב־`_`.
