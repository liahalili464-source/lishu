const config = window.PORTFOLIO_CONFIG;
const imagePattern = /\.(jpe?g|png|webp|avif|gif)$/i;

const state = {
  categories: [],
  activePhotos: [],
  lightboxIndex: 0
};

const categoryGrid = document.getElementById("categoryGrid");
const galleryView = document.getElementById("galleryView");
const photoGrid = document.getElementById("photoGrid");
const loadError = document.getElementById("loadError");
const heroBg = document.getElementById("heroBg");

function joinUrl(...parts) {
  return parts
    .join("/")
    .replace(/([^:]\/)\/+/g, "$1")
    .replace(/\/$/, "");
}

function encodePath(path) {
  return path.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

function humanizeFolder(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function categoryDetails(folder) {
  const predefined = config.categories[folder] || {};
  return {
    title: predefined.title || humanizeFolder(folder),
    subtitle: predefined.subtitle || "Photography",
    order: predefined.order ?? 999
  };
}

async function readFolder(path) {
  const url = `${joinUrl(config.sirvBaseUrl, path)}/?json=true&sort=mtime`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Sirv returned ${response.status}`);
  return response.json();
}

async function loadPortfolio() {
  try {
    const rootData = await readFolder(config.rootFolder);
    const dirs = (rootData.dirs || [])
      .map(dir => typeof dir === "string" ? dir : dir.name)
      .filter(Boolean)
      .filter(name => !name.startsWith(config.hiddenPrefix));

    const categories = await Promise.all(
      dirs.map(async folder => {
        const path = `${config.rootFolder}/${folder}`;
        const data = await readFolder(path);
        const files = (data.files || [])
          .filter(file => imagePattern.test(file.name))
          .filter(file => !file.name.startsWith(config.hiddenPrefix))
          .sort((a,b) => new Date(b.mtime || 0) - new Date(a.mtime || 0));

        const details = categoryDetails(folder);
        return { folder, path, files, ...details };
      })
    );

    state.categories = categories
      .filter(category => category.files.length)
      .sort((a,b) => a.order - b.order || a.title.localeCompare(b.title, "he"));

    if (!state.categories.length) throw new Error("No public image folders found");

    renderCategories();
    setHeroImage(state.categories[0].files[0], state.categories[0].path);
  } catch (error) {
    console.error(error);
    categoryGrid.innerHTML = "";
    loadError.hidden = false;
    setHeroFallback();
  }
}

function imageUrl(path, filename, options = "") {
  const raw = joinUrl(config.sirvBaseUrl, encodePath(path), encodeURIComponent(filename));
  return options ? `${raw}?${options}` : raw;
}

function setHeroImage(file, path) {
  heroBg.style.backgroundImage = `url("${imageUrl(path, file.name, "w=2200&quality=85")}");`;
}

function setHeroFallback() {
  heroBg.style.backgroundImage =
    'linear-gradient(135deg, #15131f, #09090d 55%, #211a42)';
}

function renderCategories() {
  categoryGrid.innerHTML = state.categories.map((category, index) => {
    const cover = category.files[0];
    return `
      <article class="category-card" data-index="${index}" tabindex="0" role="button"
        aria-label="פתיחת גלריית ${category.title}">
        <img src="${imageUrl(category.path, cover.name, "w=1300&quality=82")}"
          alt="${category.title}" loading="${index < 2 ? "eager" : "lazy"}">
        <div class="category-meta">
          <div>
            <h3>${category.title}</h3>
            <p>${category.subtitle} · ${category.files.length} תמונות</p>
          </div>
          <span class="category-arrow">←</span>
        </div>
      </article>
    `;
  }).join("");

  categoryGrid.querySelectorAll(".category-card").forEach(card => {
    const open = () => openCategory(Number(card.dataset.index));
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
}

function openCategory(index) {
  const category = state.categories[index];
  state.activePhotos = category.files.map(file => ({
    file,
    path: category.path,
    title: file.meta?.title || category.title
  }));

  document.getElementById("galleryTitle").textContent = category.title;
  document.getElementById("galleryEyebrow").textContent = category.subtitle.toUpperCase();
  document.getElementById("galleryCount").textContent = `${category.files.length} תמונות`;

  photoGrid.innerHTML = state.activePhotos.map((photo, photoIndex) => `
    <figure class="photo-card" data-index="${photoIndex}">
      <img
        src="${imageUrl(photo.path, photo.file.name, "w=900&quality=82")}"
        alt="${photo.file.meta?.description || photo.title}"
        loading="lazy"
        decoding="async">
    </figure>
  `).join("");

  photoGrid.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("click", () => openLightbox(Number(card.dataset.index)));
  });

  categoryGrid.hidden = true;
  galleryView.hidden = false;
  galleryView.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("backToCategories").addEventListener("click", () => {
  galleryView.hidden = true;
  categoryGrid.hidden = false;
  document.getElementById("work").scrollIntoView({ behavior: "smooth" });
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");

function openLightbox(index) {
  state.lightboxIndex = index;
  updateLightbox();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
}

function updateLightbox() {
  const photo = state.activePhotos[state.lightboxIndex];
  lightboxImage.src = imageUrl(photo.path, photo.file.name, "w=2400&quality=92");
  lightboxImage.alt = photo.file.meta?.description || photo.title;
  lightboxCaption.textContent = photo.file.meta?.title || "";
}

function moveLightbox(step) {
  state.lightboxIndex =
    (state.lightboxIndex + step + state.activePhotos.length) % state.activePhotos.length;
  updateLightbox();
}

document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
document.getElementById("previousImage").addEventListener("click", () => moveLightbox(-1));
document.getElementById("nextImage").addEventListener("click", () => moveLightbox(1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") moveLightbox(1);
  if (event.key === "ArrowRight") moveLightbox(-1);
});

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

window.addEventListener("scroll", () => {
  document.querySelector(".header").classList.toggle("scrolled", window.scrollY > 20);
});

document.getElementById("year").textContent = new Date().getFullYear();
loadPortfolio();
