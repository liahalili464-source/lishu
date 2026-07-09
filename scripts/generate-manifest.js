const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const OUT = path.join(ROOT, 'data', 'portfolio.json');
const imageExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const videoExt = new Set(['.mp4', '.webm', '.mov']);

function titleFromFile(file) {
  return path.basename(file, path.extname(file))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function listFiles(dir, allowedExt) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && allowedExt.has(path.extname(d.name).toLowerCase()))
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b));
}

function rel(p) {
  return '/' + path.relative(ROOT, p).replace(/\\/g, '/');
}

function categoryItems(cat, allowedExt) {
  return listFiles(path.join(ROOT, cat.dir), allowedExt).map(file => ({
    title: titleFromFile(file),
    src: rel(path.join(ROOT, cat.dir, file))
  }));
}

const photoCategories = [
  { id: 'wrestling', title: 'היאבקות', dir: 'uploads/stills/wrestling' },
  { id: 'portraits', title: 'פורטרטים', dir: 'uploads/stills/portraits' },
  { id: 'street', title: 'צילומי רחוב', dir: 'uploads/stills/street' },
  { id: 'oneyear', title: 'גיל שנה', dir: 'uploads/stills/oneyear' }
];

const designCategories = [
  { id: 'reels-covers', title: 'קאברים לרילס', dir: 'uploads/design/reels-covers' },
  { id: 'branding', title: 'מיתוג עסקי', dir: 'uploads/design/branding' },
  { id: 'social-media', title: 'פוסטים לרשתות', dir: 'uploads/design/social-media' }
];

const videoCategories = [
  { id: 'instagram-reels', title: 'Instagram Reels', dir: 'uploads/videos/instagram-reels' },
  { id: 'sorry-for-asking', title: 'סליחה על השאלה', dir: 'uploads/videos/sorry-for-asking' },
  { id: 'music-video', title: 'קליפ', dir: 'uploads/videos/music-video' },
  { id: 'documentary', title: 'סרט דוקו', dir: 'uploads/videos/documentary' }
];

const photos = photoCategories.map(cat => ({ ...cat, group: 'photos', type: 'Stills', items: categoryItems(cat, imageExt) }));
const design = designCategories.map(cat => ({ ...cat, group: 'design', type: 'Design', items: categoryItems(cat, imageExt) }));
const videosByCategory = videoCategories.map(cat => ({
  ...cat,
  group: 'videos',
  type: 'Video',
  items: categoryItems(cat, videoExt).map(item => ({ ...item, type: 'local' }))
}));

const data = {
  brand: {
    name: 'LISHU',
    tagline: 'Photography. Video. Design. תוכן שמרגיש כמו העסק שלך.',
    instagram: 'https://www.instagram.com/YOUR_USERNAME',
    tiktok: 'https://www.tiktok.com/@YOUR_USERNAME'
  },
  photos,
  design,
  videosByCategory
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`Portfolio manifest generated: ${OUT}`);
