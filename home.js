const API_KEY = '57ebea8e5cdcf68d4e8f4d20ca5bd4ac';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BASE_URL = 'https://api.themoviedb.org/3';
const ANIME_URL = 'https://api.jikan.moe/v4/top/anime';

async function fetchData(url) {
  const res = await fetch(url);
  return res.ok ? res.json() : [];
}

function createCard(item, type) {
  const imgSrc = type === 'anime' ? item.images.jpg.image_url : IMG_URL + item.poster_path;
  if (!imgSrc || imgSrc.includes("null")) return null;
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = item.title || item.name;
  img.addEventListener("click", () => showDetails(item, type));
  return img;
}

async function loadSection(type) {
  let items = [];
  if (type === 'anime') {
    const res = await fetchData(ANIME_URL);
    items = res.data.slice(0, 10);
  } else {
    const res = await fetchData(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
    items = res.results;
  }

  const rowsWrapper = document.getElementById("rows-wrapper");
  rowsWrapper.innerHTML = '';
  const banner = document.getElementById("banner");
  const bannerTitle = document.getElementById("banner-title");
  const highlight = items[0];
  banner.style.backgroundImage = `url(${type === 'anime' ? highlight.images.jpg.image_url : IMG_URL + highlight.backdrop_path})`;
  bannerTitle.textContent = highlight.title || highlight.name;

  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<h2>${type.toUpperCase()}</h2><div class="list"></div>`;
  const list = row.querySelector(".list");

  items.forEach(item => {
    const card = createCard(item, type);
    if (card) list.appendChild(card);
  });

  rowsWrapper.appendChild(row);
}

function showDetails(item, type) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-poster").src = type === 'anime' ? item.images.jpg.image_url : IMG_URL + item.poster_path;
  document.getElementById("modal-title").textContent = item.title || item.name;
  document.getElementById("modal-overview").textContent = item.overview || item.synopsis || '';
  document.getElementById("modal-vote").textContent = `â­ ${(item.vote_average || item.score).toFixed(1)}`;

  const id = item.mal_id || item.id;
  const selected = document.getElementById("server-select").value;
  let embedUrl = "";

  if (selected === "vidsrc") {
    embedUrl = `https://vidsrc.to/embed/movie/${id}`;
  } else if (selected === "github") {
    embedUrl = `https://raw.githack.com/user/repo/main/${id}.html`;
  } else if (selected === "cloudfare") {
    embedUrl = `https://cloudflarestream.com/${id}`;
  }

  document.getElementById("video-wrapper").innerHTML = `<iframe width="100%" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
  modal.style.display = "flex";
}

document.getElementById("modal-close").onclick = () => {
  document.getElementById("modal").style.display = "none";
  document.getElementById("video-wrapper").innerHTML = "";
};

document.getElementById("btn-trending").onclick = () => loadSection("movie");
document.getElementById("btn-tv").onclick = () => loadSection("tv");
document.getElementById("btn-anime").onclick = () => loadSection("anime");

loadSection("movie");
