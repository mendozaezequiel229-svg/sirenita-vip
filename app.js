let data = [];
let category = 'Todos';
let query = '';

const elements = {
  filters: document.getElementById('filters'), products: document.getElementById('products'),
  search: document.getElementById('search'), searchBtn: document.getElementById('searchBtn'),
  closeSearch: document.getElementById('closeSearch'), q: document.getElementById('q')
};
const money = value => new Intl.NumberFormat('es-AR', {style: 'currency', currency: 'ARS', maximumFractionDigits: 0}).format(value);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
function validProducts(value) { return Array.isArray(value) && value.every(product => product && typeof product.id === 'string' && typeof product.name === 'string' && Number.isFinite(Number(product.price)) && typeof product.category === 'string' && typeof product.image === 'string' && product.image.startsWith('assets/products/')); }

async function loadProducts() {
  const response = await fetch('./products.json?v=11', {cache: 'no-cache'});
  if (!response.ok) throw new Error(`No se pudo cargar products.json (${response.status})`);
  const defaults = await response.json();
  if (!validProducts(defaults)) throw new Error('products.json no tiene un formato válido');
  try { const saved = JSON.parse(localStorage.getItem('sirenita_products') || 'null'); data = validProducts(saved) ? saved : defaults; }
  catch { data = defaults; }
}
function renderFilters() {
  const categories = ['Todos', ...new Set(data.filter(product => product.active).map(product => product.category))];
  elements.filters.innerHTML = categories.map(name => `<button type="button" class="${name === category ? 'active' : ''}" data-c="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('');
  elements.filters.querySelectorAll('button').forEach(button => { button.onclick = () => { category = button.dataset.c; render(); }; });
}
function render() {
  renderFilters();
  const normalizedQuery = query.trim().toLocaleLowerCase('es-AR');
  const visible = data.filter(product => product.active && (category === 'Todos' || product.category === category) && product.name.toLocaleLowerCase('es-AR').includes(normalizedQuery));
  elements.products.innerHTML = visible.map(product => `<article class="card"><div class="image-wrap"><img loading="lazy" decoding="async" width="1080" height="1350" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"></div><div class="card-body"><div class="category">${escapeHtml(product.category)}</div><h3>${escapeHtml(product.name)}</h3><div class="price">${money(Number(product.price))}</div></div></article>`).join('') || '<p>No se encontraron productos.</p>';
}
elements.searchBtn.onclick = () => { elements.search.classList.add('open'); elements.search.setAttribute('aria-hidden', 'false'); elements.q.focus(); };
elements.closeSearch.onclick = () => { elements.search.classList.remove('open'); elements.search.setAttribute('aria-hidden', 'true'); elements.searchBtn.focus(); };
elements.search.onclick = event => { if (event.target === elements.search) elements.closeSearch.click(); };
document.addEventListener('keydown', event => { if (event.key === 'Escape' && elements.search.classList.contains('open')) elements.closeSearch.click(); });
elements.q.oninput = event => { query = event.target.value; render(); };
loadProducts().then(render).catch(error => { console.error(error); elements.products.innerHTML = '<p>No se pudo cargar la carta. Actualizá la página.</p>'; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
