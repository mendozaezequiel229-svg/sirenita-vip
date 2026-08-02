let data = [];
let defaults = [];

async function loadProducts() {
  const response = await fetch('./products.json?v=9');
  defaults = await response.json();
  const saved = JSON.parse(localStorage.getItem('sirenita_products') || 'null');
  const savedById = new Map((saved || []).map(product => [product.id, product]));
  data = defaults.map(product => ({...product, ...(savedById.get(product.id) || {}), image: product.image}));
}

enter.onclick = async () => {
  if (pin.value !== '2026') { alert('PIN incorrecto'); return; }
  await loadProducts(); login.hidden = true; panel.hidden = false; render();
};

function save() { localStorage.setItem('sirenita_products', JSON.stringify(data)); render(); }

function render() {
  list.innerHTML = data.map((product, index) => `<div class="row"><img src="${product.image}" alt=""><input value="${product.name.replaceAll('"', '&quot;')}" data-k="name" data-i="${index}"><input type="number" value="${product.price}" data-k="price" data-i="${index}"><select data-k="category" data-i="${index}">${['Cervezas','Espumantes','Whiskies','Licores','Vodkas','Tragos','Sin alcohol'].map(name => `<option ${name === product.category ? 'selected' : ''}>${name}</option>`).join('')}</select><div class="actions"><button data-toggle="${index}">${product.active ? 'Ocultar' : 'Mostrar'}</button><button class="danger" data-del="${index}">Eliminar</button></div></div>`).join('');
  list.querySelectorAll('input,select').forEach(element => { element.onchange = () => { data[+element.dataset.i][element.dataset.k] = element.dataset.k === 'price' ? +element.value : element.value; save(); }; });
  list.querySelectorAll('[data-toggle]').forEach(button => { button.onclick = () => { const index = +button.dataset.toggle; data[index].active = !data[index].active; save(); }; });
  list.querySelectorAll('[data-del]').forEach(button => { button.onclick = () => { if (confirm('¿Eliminar producto?')) { data.splice(+button.dataset.del, 1); save(); } }; });
}

add.onclick = () => { data.push({id: `nuevo-${Date.now()}`, name: 'Nuevo producto', price: 0, category: 'Tragos', image: 'assets/products/tragos.webp', active: true}); save(); };
reset.onclick = () => { if (confirm('¿Restaurar la carta original?')) { data = structuredClone(defaults); save(); } };
