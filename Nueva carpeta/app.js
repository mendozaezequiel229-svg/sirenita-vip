let data = [];
let category = 'Todos';
let query = '';

const money = value => new Intl.NumberFormat('es-AR', {style: 'currency', currency: 'ARS', maximumFractionDigits: 0}).format(value);

async function loadProducts() {
  const response = await fetch('./products.json?v=9');
  const defaults = await response.json();
  const saved = JSON.parse(localStorage.getItem('sirenita_products') || 'null');
  const savedById = new Map((saved || []).map(product => [product.id, product]));
  data = defaults.map(product => ({...product, ...(savedById.get(product.id) || {}), image: product.image}));
}

function renderFilters() {
  const categories = ['Todos', ...new Set(data.filter(product => product.active).map(product => product.category))];
  filters.innerHTML = categories.map(name => `<button class="${name === category ? 'active' : ''}" data-c="${name}">${name}</button>`).join('');
  filters.querySelectorAll('button').forEach(button => {
    button.onclick = () => { category = button.dataset.c; render(); };
  });
}

function render() {
  renderFilters();
  const visible = data.filter(product => product.active && (category === 'Todos' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()));
  products.innerHTML = visible.map(product => `<article class="card"><div class="image-wrap"><img loading="lazy" src="${product.image}" alt="${product.name}"></div><div class="card-body"><div class="category">${product.category}</div><h3>${product.name}</h3><div class="price">${money(product.price)}</div></div></article>`).join('') || '<p>No se encontraron productos.</p>';
}

searchBtn.onclick = () => { search.classList.add('open'); search.setAttribute('aria-hidden', 'false'); q.focus(); };
closeSearch.onclick = () => { search.classList.remove('open'); search.setAttribute('aria-hidden', 'true'); };
search.onclick = event => { if (event.target === search) closeSearch.click(); };
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSearch.click(); });
q.oninput = event => { query = event.target.value; render(); };

loadProducts().then(render).catch(() => { products.innerHTML = '<p>No se pudo cargar la carta. Actualizá la página.</p>'; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
