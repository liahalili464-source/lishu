/*
  ההגדרות היחידות שאולי תרצי לשנות בעתיד.
  תיקייה חדשה בתוך /stills תופיע אוטומטית באתר.
*/
window.PORTFOLIO_CONFIG = {
  sirvBaseUrl: "https://lishuportfolio.sirv.com",
  rootFolder: "/stills",

  instagramUrl: "https://www.instagram.com/lishu.il",
  tiktokUrl: "https://www.tiktok.com/@lishu.il",

  // שמות יפים לתיקיות הקיימות
  categories: {
    wrestling: { title: "היאבקות", subtitle: "Wrestling & Action", order: 1 },
    portraits: { title: "פורטרטים", subtitle: "Portraits & People", order: 2 },
    oneyear:   { title: "גיל שנה", subtitle: "One Year & Family", order: 3 },
    street:    { title: "סטריט", subtitle: "Street & Stories", order: 4 }
  },

  // קבצים שמתחילים בסימן הזה לא יוצגו
  hiddenPrefix: "_"
};
