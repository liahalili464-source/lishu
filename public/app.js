const state = {
  data: null,
  photoFilter: 'all',
  designFilter: 'all',
  videoFilter: 'all',
  lightboxItems: [],
  lightboxIndex: 0
};

const $ = (sel) => document.querySelector(sel);

async function loadData() {
  const res = await fetch('/data/portfolio.json');
  state.data = await res.json();

  $('#instagramBtn').href = state.data.brand.instagram;
  $('#tiktokBtn').href = state.data.brand.tiktok;

  renderCategoryCards();
  renderPhotoFilters();
  renderDesignFilters();
  renderVideoFilters();
  renderPhotos();
  renderDesign();
  renderVideos();
}

function flatten(categories, filter) {
  return categories
    .filter(cat => filter === 'all' || cat.id === filter)
    .flatMap(cat => cat.items.map(item => ({ ...item, category: cat.title, categoryId: cat.id })));
}

function categoryPreview(cat) {
  const first = cat.items && cat.items[0];
  return first?.thumbnail || first?.src || '';
}

function renderCategoryCards() {
  const grid = $('#categoryCards');
  const cards = [
    ...state.data.photos.map(cat => ({...cat, type: 'Stills', group: 'photos', text: 'גלריית צילום'})),
    ...state.data.design.map(cat => ({...cat, type: 'Design', group: 'design', text: 'עיצוב לרשתות'})),
    ...state.data.videosByCategory.map(cat => ({...cat, type: 'Video', group: 'videos', text: 'עריכה ותוכן וידאו'}))
  ];

  grid.innerHTML = '';
  cards.forEach(cat => {
    const preview = categoryPreview(cat);
    const card = document.createElement('article');
    card.className = `category-card ${preview ? 'has-image' : ''}`;
    card.innerHTML = `
      <div class="preview" ${preview ? `style="background-image:url('${preview}')"` : ''}></div>
      <div class="category-content">
        <p class="type">${cat.type}</p>
        <h3>${cat.title}</h3>
        <p>${cat.text} · ${cat.items.length} פריטים</p>
        <span class="open-label">לפתיחת גלריה</span>
      </div>`;
    card.onclick = () => openCategoryModal(cat);
    grid.appendChild(card);
  });
}

function renderChips(container, categories, active, onClick) {
  container.innerHTML = '';
  const all = document.createElement('button');
  all.className = `chip ${active === 'all' ? 'active' : ''}`;
  all.type = 'button';
  all.textContent = 'הכול';
  all.onclick = () => onClick('all');
  container.appendChild(all);

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `chip ${active === cat.id ? 'active' : ''}`;
    btn.type = 'button';
    btn.textContent = `${cat.title} (${cat.items.length})`;
    btn.onclick = () => onClick(cat.id);
    container.appendChild(btn);
  });
}

function renderPhotoFilters() {
  renderChips($('#photoFilters'), state.data.photos, state.photoFilter, (id) => {
    state.photoFilter = id;
    renderPhotoFilters();
    renderPhotos();
  });
}

function renderDesignFilters() {
  renderChips($('#designFilters'), state.data.design, state.designFilter, (id) => {
    state.designFilter = id;
    renderDesignFilters();
    renderDesign();
  });
}

function renderVideoFilters() {
  renderChips($('#videoFilters'), state.data.videosByCategory, state.videoFilter, (id) => {
    state.videoFilter = id;
    renderVideoFilters();
    renderVideos();
  });
}

function renderPhotos() {
  const grid = $('#photoGrid');
  const items = flatten(state.data.photos, state.photoFilter);
  grid.innerHTML = items.length ? '' : '<div class="empty">כאן יופיעו התמונות אחרי שתעלי קבצים לתיקיות הסטילס. האתר כבר מוכן לגלריה גדולה.</div>';

  items.forEach((item, index) => {
    const div = document.createElement('article');
    div.className = 'tile';
    div.dataset.label = item.category;
    div.innerHTML = `<img loading="lazy" src="${item.src}" alt="${item.title}">`;
    div.onclick = () => openLightbox(items, index);
    grid.appendChild(div);
  });
}

function renderDesign() {
  const grid = $('#designGrid');
  const items = flatten(state.data.design, state.designFilter);
  grid.innerHTML = items.length ? '' : '<div class="empty">כאן יופיעו קאברים לרילס, מיתוגים ופוסטים אחרי שתעלי קבצים לתיקיות Design.</div>';

  items.forEach((item, index) => {
    const div = document.createElement('article');
    div.className = 'design-card';
    div.dataset.label = item.category;
    div.innerHTML = `
      <div class="image-wrap"><img loading="lazy" src="${item.src}" alt="${item.title}"></div>
      <div class="card-body">
        <p class="card-title">${item.title}</p>
        <p class="card-meta">${item.category}</p>
      </div>`;
    div.onclick = () => openLightbox(items, index);
    grid.appendChild(div);
  });
}

function videoMarkup(item) {
  const media = item.embed
    ? `<iframe class="video-embed" src="${item.embed}" title="${item.title}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
    : item.src
      ? `<video controls playsinline preload="metadata" src="${item.src}"></video>`
      : `<div class="video-placeholder">VIDEO</div>`;

  return `
    ${media}
    <div class="card-body">
      <p class="card-title">${item.title}</p>
      <p class="card-meta">${item.category || 'וידאו / עריכה'}</p>
    </div>`;
}

function renderVideos() {
  const grid = $('#videoGrid');
  const items = flatten(state.data.videosByCategory, state.videoFilter);
  grid.innerHTML = items.length ? '' : '<div class="empty">כאן יופיעו 3 רילס לאינסטגרם, 2 סרטוני “סליחה על השאלה”, קליפ וסרט דוקו. לקבצים כבדים עדיף לשים לינק מוטמע.</div>';

  items.forEach(item => {
    const div = document.createElement('article');
    div.className = 'video-card';
    div.innerHTML = videoMarkup(item);
    grid.appendChild(div);
  });
}

function openCategoryModal(cat) {
  $('#modalKicker').textContent = cat.type || 'Portfolio';
  $('#modalTitle').textContent = cat.title;
  $('#modalText').textContent = cat.items.length ? 'כל הפריטים שעלו לתיקייה הזו מוצגים כאן אוטומטית.' : 'כשתעלי קבצים לתיקייה הזו הם יופיעו כאן לבד.';
  const modalGrid = $('#modalGrid');
  modalGrid.innerHTML = cat.items.length ? '' : '<div class="empty">עדיין אין קבצים בקטגוריה הזו.</div>';

  cat.items.forEach((item, index) => {
    if (cat.group === 'videos') {
      const div = document.createElement('article');
      div.className = 'video-card';
      div.innerHTML = videoMarkup({...item, category: cat.title});
      modalGrid.appendChild(div);
    } else {
      const div = document.createElement('article');
      div.className = cat.group === 'design' ? 'design-card' : 'tile';
      div.dataset.label = cat.title;
      div.innerHTML = cat.group === 'design'
        ? `<div class="image-wrap"><img loading="lazy" src="${item.src}" alt="${item.title}"></div><div class="card-body"><p class="card-title">${item.title}</p><p class="card-meta">${cat.title}</p></div>`
        : `<img loading="lazy" src="${item.src}" alt="${item.title}">`;
      div.onclick = () => openLightbox(cat.items.map(i => ({...i, category: cat.title})), index);
      modalGrid.appendChild(div);
    }
  });

  $('#galleryModal').classList.add('open');
  $('#galleryModal').setAttribute('aria-hidden', 'false');
}

function closeModal() {
  $('#galleryModal').classList.remove('open');
  $('#galleryModal').setAttribute('aria-hidden', 'true');
}

function openLightbox(items, index) {
  state.lightboxItems = items;
  state.lightboxIndex = index;
  updateLightbox();
  $('#lightbox').classList.add('open');
  $('#lightbox').setAttribute('aria-hidden', 'false');
}

function updateLightbox() {
  const item = state.lightboxItems[state.lightboxIndex];
  if (!item) return;
  $('#lightboxImg').src = item.src;
  $('#lightboxImg').alt = item.title || '';
  $('#lightboxCaption').textContent = `${item.title || ''}${item.category ? ' / ' + item.category : ''}`;
}

function moveLightbox(step) {
  const total = state.lightboxItems.length;
  if (!total) return;
  state.lightboxIndex = (state.lightboxIndex + step + total) % total;
  updateLightbox();
}

function closeLightbox() {
  $('#lightbox').classList.remove('open');
  $('#lightbox').setAttribute('aria-hidden', 'true');
}

$('#closeModal').onclick = closeModal;
$('#galleryModal').onclick = (e) => { if (e.target.dataset.close) closeModal(); };
$('#closeLightbox').onclick = closeLightbox;
$('#prevLightbox').onclick = () => moveLightbox(-1);
$('#nextLightbox').onclick = () => moveLightbox(1);
$('#lightbox').onclick = (e) => { if (e.target.id === 'lightbox') closeLightbox(); };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLightbox(); closeModal(); }
  if (e.key === 'ArrowRight') moveLightbox(-1);
  if (e.key === 'ArrowLeft') moveLightbox(1);
});

loadData();
