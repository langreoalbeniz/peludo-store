/* ---------- home ---------- */
on('/', () => {
  setMeta({});
  const best = PRODUCTS.filter(p => p.tag === 'Más vendido');
  const offers = PRODUCTS.filter(p => p.old);
  return `
  <section class="hero"><div class="wrap hero-in">
    <div><p class="eyebrow">Otoño 2026 · Nueva colección</p>
      <h1>Todo lo que tu perro <em>necesita</em>, en un solo sitio</h1>
      <p>Collares, arneses, camas y juguetes seleccionados por dueños de perros. Envío en 24–48 h desde almacén europeo.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="#/tienda">Comprar ahora</a><a class="btn ghost" style="color:var(--hero-fg);border-color:rgba(255,255,255,.3)" href="#/sobre-nosotros">Conócenos</a></div>
    </div>
    <div class="hero-img"><img src="${IMG('1587300003388-59208cc962cb', 900, 680)}" alt="Golden retriever feliz en el campo" onerror="imgFail(this)"></div>
  </div></section>
  <div class="wrap"><div class="trust">
    <div>🚚<b>Envío gratis</b><span class="muted">desde 49 €</span></div>
    <div>↩️<b>30 días</b><span class="muted">para devolver</span></div>
    <div>🛡️<b>Pago seguro</b><span class="muted">tarjeta, PayPal, Bizum</span></div>
    <div>⭐<b>4,8/5</b><span class="muted">+3.000 reseñas</span></div>
  </div></div>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Categorías</p><h2>Compra por categoría</h2></div></div>
    <div class="cats">${Object.entries(CATEGORIES).map(([k, c]) => `<a class="cat" href="#/categoria/${k}"><img loading="lazy" src="${IMG(c.img, 300, 300)}" alt="${c.name}" onerror="imgFail(this)"><span>${c.name} →</span></a>`).join('')}</div>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Favoritos de la manada</p><h2>Lo más vendido</h2></div><a href="#/tienda?orden=populares" style="color:var(--accent)">Ver todo →</a></div>
    <div class="grid">${best.map(cardHTML).join('')}</div>
  </div></section>
  <section class="section" style="background:var(--bg-alt)"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Por tiempo limitado</p><h2>Ofertas</h2></div><a href="#/ofertas" style="color:var(--accent)">Ver ofertas →</a></div>
    <div class="grid">${offers.slice(0, 4).map(cardHTML).join('')}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Blog</p><h2>Consejos de nuestros expertos</h2></div><a href="#/blog" style="color:var(--accent)">Ir al blog →</a></div>
    <div class="cards3">${BLOG.slice(0, 3).map(blogCard).join('')}</div>
  </div></section>`;
});

/* ---------- listing ---------- */
function listing(list, query, base) {
  const sort = query.orden || 'relevancia';
  const sorted = [...list];
  if (sort === 'precio-asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'precio-desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'valoracion') sorted.sort((a, b) => b.rating - a.rating);
  if (sort === 'populares') sorted.sort((a, b) => b.reviews - a.reviews);
  const opts = [['relevancia', 'Relevancia'], ['populares', 'Más populares'], ['valoracion', 'Mejor valorados'], ['precio-asc', 'Precio: menor a mayor'], ['precio-desc', 'Precio: mayor a menor']];
  return `<div class="toolbar"><span class="muted" style="font-size:14px">${sorted.length} productos</span>
    <label style="margin-left:auto;font-size:14px">Ordenar <select onchange="setQuery('${base}','orden',this.value)">${opts.map(([v, t]) => `<option value="${v}" ${v === sort ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
    ${sorted.length ? `<div class="grid">${sorted.map(cardHTML).join('')}</div>` : `<div class="empty"><div>🔎</div><p>No hay productos que coincidan.</p></div>`}`;
}
function setQuery(base, key, val) {
  const { query } = parseHash();
  query[key] = val;
  if (!val) delete query[key];
  const qs = new URLSearchParams(query).toString();
  go(base + (qs ? '?' + qs : ''));
}

on('/tienda', (_, q) => {
  const term = (q.q || '').toLowerCase();
  const cat = q.cat || '';
  let list = PRODUCTS.filter(p => (!cat || p.cat === cat) && (!term || (p.name + ' ' + p.desc).toLowerCase().includes(term)));
  setMeta({ title: term ? `Resultados para «${q.q}»` : 'Tienda', desc: 'Todo el catálogo de accesorios para perros de Peludo.' });
  return phero(term ? `Resultados para «${esc(q.q)}»` : 'Toda la tienda', 'Más de 20 productos seleccionados para tu perro.', [['Tienda']]) + `
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="chips" style="margin-bottom:20px"><button class="chip ${!cat ? 'on' : ''}" onclick="setQuery('/tienda','cat','')">Todo</button>
      ${Object.entries(CATEGORIES).map(([k, c]) => `<button class="chip ${cat === k ? 'on' : ''}" onclick="setQuery('/tienda','cat','${k}')">${c.name}</button>`).join('')}</div>
    ${listing(list, q, '/tienda')}
  </div></section>`;
});

on('/categoria/:cat', ({ cat }, q) => {
  const c = CATEGORIES[cat];
  if (!c) return viewNotFound();
  setMeta({ title: c.name + ' para perros', desc: c.desc, img: c.img });
  return phero(c.name, c.desc, [['Tienda', '#/tienda'], [c.name]]) + `
  <section class="section" style="padding-top:28px"><div class="wrap">${listing(PRODUCTS.filter(p => p.cat === cat), q, '/categoria/' + cat)}</div></section>`;
});

on('/ofertas', (_, q) => {
  setMeta({ title: 'Ofertas', desc: 'Descuentos en accesorios para perros por tiempo limitado.' });
  return phero('Ofertas', 'Descuentos por tiempo limitado. Además, usa el cupón <b>PELUDO10</b> para un 10 % extra.', [['Ofertas']]) +
    `<section class="section" style="padding-top:28px"><div class="wrap">${listing(PRODUCTS.filter(p => p.old), q, '/ofertas')}</div></section>`;
});

on('/novedades', (_, q) => {
  setMeta({ title: 'Novedades', desc: 'Los últimos accesorios para perros que han llegado a Peludo.' });
  return phero('Novedades', 'Lo último que ha llegado al almacén.', [['Novedades']]) +
    `<section class="section" style="padding-top:28px"><div class="wrap">${listing(PRODUCTS.filter(p => p.tag === 'Nuevo'), q, '/novedades')}</div></section>`;
});

on('/favoritos', () => {
  setMeta({ title: 'Mis favoritos' });
  const list = state.wish.map(productById).filter(Boolean);
  return phero('Mis favoritos', 'Los productos que has guardado.', [['Favoritos']]) + `<section class="section" style="padding-top:28px"><div class="wrap">
    ${list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>` : `<div class="empty"><div>♡</div><p>Aún no has guardado nada.</p><p style="margin-top:16px"><a class="btn" href="#/tienda">Explorar la tienda</a></p></div>`}
  </div></section>`;
});

/* ---------- product ---------- */
const pdp = { size: '', qty: 1, img: 0 };
on('/producto/:id', ({ id }) => {
  const p = productById(id);
  if (!p) return viewNotFound();
  pdp.size = ''; pdp.qty = 1; pdp.img = 0;
  const c = CATEGORIES[p.cat];
  setMeta({ title: p.name, desc: p.desc, img: p.imgs[0], jsonld: {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.desc, image: p.imgs.map(i => IMG(i, 1200, 1200)),
    brand: { '@type': 'Brand', name: 'Peludo' }, sku: p.id, category: c.name,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: { '@type': 'Offer', price: p.price, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: SITE + '#/producto/' + p.id } } });
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const w = state.wish.includes(p.id);
  return `<div class="wrap">
  <div style="padding-top:24px">${crumbs([[c.name, '#/categoria/' + p.cat], [p.name]])}</div>
  <div class="pdp">
    <div><div class="gallery-main"><img id="main-img" src="${IMG(p.imgs[0], 900, 900)}" alt="${esc(p.name)}" onerror="imgFail(this)"></div>
      <div class="thumbs">${p.imgs.map((im, i) => `<button class="${i ? '' : 'on'}" onclick="pdpImg(${i},'${p.id}')" aria-label="Imagen ${i + 1}"><img src="${IMG(im, 200, 200)}" alt="" onerror="imgFail(this)"></button>`).join('')}</div></div>
    <div>
      <span class="card-cat">${c.name}</span>
      <h1>${esc(p.name)}</h1>
      <span class="stars">${stars(p.rating)} <small>${p.rating} · <a href="#resenas" onclick="event.preventDefault();document.getElementById('resenas').open=true;document.getElementById('resenas').scrollIntoView({behavior:'smooth'})" style="text-decoration:underline">${p.reviews} reseñas</a></small></span>
      <div class="price" style="margin:14px 0"><b>${eur(p.price)}</b>${p.old ? `<s>${eur(p.old)}</s> <span class="tag" style="position:static">Ahorras ${eur(p.old - p.price)}</span>` : ''}</div>
      <p class="muted">${esc(p.desc)}</p>
      ${p.sizes.length ? `<div class="opt-label">Talla <a href="#/guia-tallas" style="font-weight:400;color:var(--accent);margin-left:8px">Guía de tallas</a></div>
        <div class="sizes">${p.sizes.map(s => `<button class="size" onclick="pdpSize(this,'${s}')">${s}</button>`).join('')}</div>
        <p id="size-err" class="err-msg" hidden style="margin-top:6px">Selecciona una talla.</p>` : ''}
      <div class="opt-label">Cantidad</div>
      <div class="qty"><button onclick="pdpQty(-1)" aria-label="Restar">−</button><span id="pdp-qty">1</span><button onclick="pdpQty(1)" aria-label="Sumar">+</button></div>
      <div class="buy-row">
        <button class="btn" onclick="pdpAdd('${p.id}',false)">Añadir al carrito</button>
        <button class="btn ghost" onclick="pdpAdd('${p.id}',true)">Comprar ya</button>
        <button class="btn ghost wish-inline ${w ? 'on' : ''}" data-wish="${p.id}" onclick="toggleWish('${p.id}')" aria-label="Favorito" style="flex:0">${w ? '♥' : '♡'}</button>
      </div>
      <p class="note" style="margin-top:12px">🚚 Pide antes de las 13:00 y sale hoy · Envío gratis desde 49 € · Devolución gratuita 30 días</p>
      <ul class="feat">${p.feats.map(f => `<li>${f}</li>`).join('')}</ul>
      <div class="pdp-tabs">
        <details open><summary>Descripción</summary><p>${esc(p.desc)} Producto distribuido por BigBuy Europe, con garantía de 3 años según la legislación española.</p></details>
        <details><summary>Envío y devoluciones</summary><p>Envío estándar 3–5 días (gratis desde 49 €), express 24 h por 9,99 €. Devoluciones gratuitas durante 30 días. <a href="#/envios" style="color:var(--accent)">Más información</a>.</p></details>
        <details id="resenas"><summary>Reseñas (${p.reviews})</summary>
          ${[['Marta G.', 5, 'Calidad muy buena y llegó en dos días. A mi perra le queda perfecto.'], ['Jorge R.', 5, 'Repetiré. Mucho mejor que el que tenía.'], ['Ana P.', 4, 'Muy bien, aunque la talla viene algo justa. Pedid una más.']]
            .map(([n, r, t]) => `<div class="review"><b>${n}</b><span class="stars">${stars(r)}</span><p>${t}</p></div>`).join('')}
        </details>
      </div>
    </div>
  </div>
  ${related.length ? `<section class="section" style="padding-top:16px"><div class="section-head"><h2>También te puede gustar</h2></div><div class="grid">${related.map(cardHTML).join('')}</div></section>` : ''}
  </div>`;
});
function pdpImg(i, id) {
  const p = productById(id);
  $('#main-img').dataset.f = '';
  $('#main-img').src = IMG(p.imgs[i], 900, 900);
  $$('.thumbs button').forEach((b, j) => b.classList.toggle('on', i === j));
}
function pdpSize(btn, s) { pdp.size = s; $$('.size').forEach(b => b.classList.toggle('on', b === btn)); $('#size-err').hidden = true; }
function pdpQty(d) { pdp.qty = Math.max(1, Math.min(10, pdp.qty + d)); $('#pdp-qty').textContent = pdp.qty; }
function pdpAdd(id, buyNow) {
  const p = productById(id);
  if (p.sizes.length && !pdp.size) { $('#size-err').hidden = false; return; }
  addToCart(id, pdp.size, pdp.qty);
  if (buyNow) { closeAll(); go('/checkout/envio'); }
}

/* ---------- cart page ---------- */
on('/carrito', () => {
  setMeta({ title: 'Carrito' });
  if (!state.cart.length) return phero('Tu carrito', '', [['Carrito']]) + `<div class="wrap empty"><div>🛒</div><p>Tu carrito está vacío.</p><p style="margin-top:16px"><a class="btn" href="#/tienda">Ir a la tienda</a></p></div>`;
  const t = totals();
  return phero('Tu carrito', `${cartCount()} artículos`, [['Carrito']]) + `<div class="wrap co">
    <div class="box">${state.cart.map(lineHTML).join('')}<p style="margin-top:16px"><a href="#/tienda" style="color:var(--accent)">← Seguir comprando</a></p></div>
    ${summaryBox(t, `<a class="btn block" href="#/checkout/envio">Finalizar compra</a>`)}
  </div>`;
});
function summaryBox(t, cta) {
  return `<aside class="box"><h2>Resumen</h2>
    <div style="display:grid;gap:10px">
      <div class="row"><span>Subtotal</span><span>${eur(t.sub)}</span></div>
      ${t.disc ? `<div class="row"><span>Descuento ${state.coupon} <button class="link-btn" onclick="removeCoupon()">quitar</button></span><span>−${eur(t.disc)}</span></div>` : ''}
      <div class="row"><span>Envío</span><span>${t.ship ? eur(t.ship) : 'Gratis'}</span></div>
      <div class="row total" style="border-top:1px solid var(--border);padding-top:10px"><span>Total</span><span>${eur(t.total)}</span></div>
      <p class="note">IVA incluido.</p>
      ${state.coupon ? '' : `<div class="coupon"><input id="coupon" placeholder="Código de descuento" aria-label="Código de descuento"><button class="btn ghost" onclick="tryCoupon()">Aplicar</button></div><p id="coupon-msg" class="note">Prueba con BIENVENIDA10</p>`}
      ${cta}
      <p class="note" style="text-align:center">🔒 Pago seguro · Tarjeta · PayPal · Bizum</p>
    </div></aside>`;
}
function tryCoupon() {
  if (applyCoupon($('#coupon').value)) { toast('Cupón aplicado: −10 %'); route(); }
  else { const m = $('#coupon-msg'); m.className = 'err-msg'; m.textContent = 'Código no válido.'; }
}

function viewNotFound() {
  setMeta({ title: 'Página no encontrada' });
  return `<div class="wrap empty" style="padding-block:96px"><div>🐾</div><h1 style="font-size:40px;margin-bottom:8px">404</h1><p class="muted">Esta página se ha ido a perseguir una ardilla.</p><p style="margin-top:20px"><a class="btn" href="#/">Volver al inicio</a></p></div>`;
}
