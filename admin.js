let data = [];
let defaults = [];
const elements = Object.fromEntries(['login','panel','pin','enter','add','reset','list'].map(id => [id, document.getElementById(id)]));
const categories = ['Cervezas','Espumantes','Whiskies','Licores','Vodkas','Tragos','Energizantes','Sin alcohol'];
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
function validProducts(value) { return Array.isArray(value) && value.every(product => product && typeof product.id === 'string' && typeof product.name === 'string' && Number.isFinite(Number(product.price)) && typeof product.category === 'string' && typeof product.image === 'string' && product.image.startsWith('assets/products/')); }
async function loadProducts() {
  const response = await fetch('./products.json?v=11', {cache: 'no-cache'});
  if (!response.ok) throw new Error(`No se pudo cargar products.json (${response.status})`);
  defaults = await response.json();
  if (!validProducts(defaults)) throw new Error('products.json no tiene un formato válido');
  try { const saved = JSON.parse(localStorage.getItem('sirenita_products') || 'null'); data = validProducts(saved) ? saved : structuredClone(defaults); }
  catch { data = structuredClone(defaults); }
}
elements.enter.onclick = async () => {
  if (elements.pin.value !== '2026') { alert('PIN incorrecto'); return; }
  elements.enter.disabled = true;
  try { await loadProducts(); elements.login.hidden = true; elements.panel.hidden = false; render(); }
  catch (error) { console.error(error); alert('No se pudo cargar la carta. Actualizá la página.'); }
  finally { elements.enter.disabled = false; }
};
elements.pin.addEventListener('keydown', event => { if (event.key === 'Enter') elements.enter.click(); });
function save() { localStorage.setItem('sirenita_products', JSON.stringify(data)); render(); }
function render() {
  elements.list.innerHTML = data.map((product, index) => `<div class="row"><img src="${escapeHtml(product.image)}" alt=""><input aria-label="Nombre" value="${escapeHtml(product.name)}" data-k="name" data-i="${index}"><input aria-label="Precio" type="number" min="0" step="1" value="${Number(product.price)}" data-k="price" data-i="${index}"><select aria-label="Categoría" data-k="category" data-i="${index}">${categories.map(name => `<option ${name === product.category ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select><div class="actions"><button type="button" data-toggle="${index}">${product.active ? 'Ocultar' : 'Mostrar'}</button><button type="button" class="danger" data-del="${index}">Eliminar</button></div></div>`).join('');
  elements.list.querySelectorAll('input,select').forEach(element => { element.onchange = () => { const value = element.dataset.k === 'price' ? Math.max(0, Number(element.value) || 0) : element.value.trim(); data[Number(element.dataset.i)][element.dataset.k] = value; save(); }; });
  elements.list.querySelectorAll('[data-toggle]').forEach(button => { button.onclick = () => { const index = Number(button.dataset.toggle); data[index].active = !data[index].active; save(); }; });
  elements.list.querySelectorAll('[data-del]').forEach(button => { button.onclick = () => { if (confirm('¿Eliminar producto?')) { data.splice(Number(button.dataset.del), 1); save(); } }; });
}
elements.add.onclick = () => { data.push({id:`nuevo-${Date.now()}`,name:'Nuevo producto',price:0,category:'Tragos',image:'assets/products/tragos.webp',active:true}); save(); };
elements.reset.onclick = () => { if (confirm('¿Restaurar la carta original?')) { data = structuredClone(defaults); save(); } };
