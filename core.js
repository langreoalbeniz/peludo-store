const FALLBACK_IMG = '1587300003388-59208cc962cb';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const eur = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const productById = id => PRODUCTS.find(p => p.id === id);

function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

const state = {
  cart: load('peludo_cart', []),
  wish: load('peludo_wish', []),
  coupon: load('peludo_coupon', null),
  checkout: load('peludo_checkout', {}),
  lastOrder: load('peludo_last_order', null),
};

/* ---------- cart ---------- */
function cartKey(id, size) { return id + '|' + (size || ''); }
function addToCart(id, size = '', qty = 1) {
  const p = productById(id);
  if (!p) return;
  if (p.sizes.length && !size) size = p.sizes[Math.min(2, p.sizes.length - 1)];
  const k = cartKey(id, size);
  const line = state.cart.find(l => l.k === k);
  if (line) line.qty += qty; else state.cart.push({ k, id, size, qty });
  persistCart();
  toast(`${p.name} añadido al carrito`);
  openCart();
}
function setQty(k, qty) {
  const line = state.cart.find(l => l.k === k);
  if (!line) return;
  line.qty = qty;
  if (line.qty <= 0) state.cart = state.cart.filter(l => l.k !== k);
  persistCart();
}
function removeLine(k) { state.cart = state.cart.filter(l => l.k !== k); persistCart(); }
function persistCart() { save('peludo_cart', state.cart); renderCartUI(); if (location.hash.startsWith('#/carrito')) route(); }
function cartCount() { return state.cart.reduce((s, l) => s + l.qty, 0); }
function totals(shipKey) {
  const sub = state.cart.reduce((s, l) => s + productById(l.id).price * l.qty, 0);
  const disc = state.coupon && COUPONS[state.coupon] ? +(sub * COUPONS[state.coupon]).toFixed(2) : 0;
  const after = sub - disc;
  let ship = 0;
  if (sub > 0) {
    const opt = SHIPPING[shipKey || 'std'];
    ship = shipKey === 'exp' ? opt.price : (after >= FREE_SHIPPING ? 0 : opt.price);
  }
  return { sub, disc, ship, total: +(after + ship).toFixed(2) };
}
function applyCoupon(code) {
  code = (code || '').trim().toUpperCase();
  if (!COUPONS[code]) return false;
  state.coupon = code; save('peludo_coupon', code); renderCartUI(); return true;
}
function removeCoupon() { state.coupon = null; save('peludo_coupon', null); renderCartUI(); route(); }

/* ---------- wishlist ---------- */
function toggleWish(id) {
  const i = state.wish.indexOf(id);
  if (i >= 0) state.wish.splice(i, 1); else state.wish.push(id);
  save('peludo_wish', state.wish);
  $$(`[data-wish="${id}"]`).forEach(b => { b.classList.toggle('on', i < 0); b.textContent = i < 0 ? '♥' : '♡'; });
  $('#wish-count').textContent = state.wish.length;
  $('#wish-count').hidden = !state.wish.length;
  toast(i < 0 ? 'Guardado en favoritos' : 'Eliminado de favoritos');
}

/* ---------- UI shell ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function openCart() { renderCartUI(); $('#drawer').classList.add('open'); $('#backdrop').classList.add('show'); }
function openSearch() { $('#search').classList.add('open'); $('#backdrop').classList.add('show'); setTimeout(() => $('#search-input').focus(), 50); }
function closeAll() {
  $('#drawer').classList.remove('open'); $('#search').classList.remove('open');
  $('#backdrop').classList.remove('show'); $('#mobile-menu').classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

function renderCartUI() {
  const n = cartCount();
  $('#cart-count').textContent = n; $('#cart-count').hidden = !n;
  $('#wish-count').textContent = state.wish.length; $('#wish-count').hidden = !state.wish.length;
  const body = $('#drawer-body'), foot = $('#drawer-foot');
  if (!state.cart.length) {
    body.innerHTML = `<div class="empty"><div>🛒</div><p>Tu carrito está vacío.</p><p class="muted" style="margin-top:8px">¿Buscas inspiración? Mira lo más vendido.</p></div>`;
    foot.innerHTML = `<a class="btn block" href="#/tienda" onclick="closeAll()">Ir a la tienda</a>`;
    return;
  }
  const t = totals();
  const left = Math.max(0, FREE_SHIPPING - (t.sub - t.disc));
  body.innerHTML = `
    <p style="font-size:13px">${left > 0 ? `Te faltan <b>${eur(left)}</b> para el envío gratis` : '🎉 ¡Tienes envío <b>gratis</b>!'}</p>
    <div class="progress"><div style="width:${Math.min(100, (t.sub - t.disc) / FREE_SHIPPING * 100)}%"></div></div>
    ${state.cart.map(lineHTML).join('')}`;
  foot.innerHTML = `
    <div class="row"><span>Subtotal</span><span>${eur(t.sub)}</span></div>
    ${t.disc ? `<div class="row"><span>Descuento (${state.coupon})</span><span>−${eur(t.disc)}</span></div>` : ''}
    <div class="row total"><span>Total</span><span>${eur(t.sub - t.disc)}</span></div>
    <p class="note">Envío calculado en el checkout.</p>
    <a class="btn block" href="#/checkout/envio" onclick="closeAll()">Finalizar compra</a>
    <a class="btn ghost block" href="#/carrito" onclick="closeAll()">Ver carrito</a>`;
}
function lineHTML(l) {
  const p = productById(l.id);
  return `<div class="line">
    <a href="#/producto/${p.id}" onclick="closeAll()"><img src="${IMG(p.imgs[0], 160, 160)}" alt="${esc(p.name)}" onerror="imgFail(this)"></a>
    <div><div class="line-name">${esc(p.name)}</div>${l.size ? `<small>Talla ${l.size}</small><br>` : ''}
      <div class="qty" style="margin-top:6px"><button onclick="setQty('${l.k}',${l.qty - 1})" aria-label="Restar">−</button><span>${l.qty}</span><button onclick="setQty('${l.k}',${l.qty + 1})" aria-label="Sumar">+</button></div></div>
    <div style="text-align:right"><b>${eur(p.price * l.qty)}</b><br><button class="link-btn" onclick="removeLine('${l.k}')">Quitar</button></div>
  </div>`;
}
function imgFail(img) { if (!img.dataset.f) { img.dataset.f = 1; img.src = IMG(FALLBACK_IMG, 600, 600); } }

/* ---------- search ---------- */
function doSearch(q) {
  q = q.trim().toLowerCase();
  const out = $('#search-results');
  if (!q) { out.innerHTML = ''; return; }
  const hits = PRODUCTS.filter(p => (p.name + ' ' + CATEGORIES[p.cat].name + ' ' + p.desc).toLowerCase().includes(q)).slice(0, 8);
  out.innerHTML = hits.length
    ? hits.map(p => `<a href="#/producto/${p.id}" onclick="closeAll()"><img src="${IMG(p.imgs[0], 100, 100)}" alt="" onerror="imgFail(this)"><span><b>${esc(p.name)}</b><br><small class="muted">${CATEGORIES[p.cat].name} · ${eur(p.price)}</small></span></a>`).join('')
      + `<a href="#/tienda?q=${encodeURIComponent(q)}" onclick="closeAll()" style="justify-content:center;color:var(--accent)">Ver todos los resultados →</a>`
    : `<p class="muted" style="padding:12px 0">Sin resultados para «${esc(q)}».</p>`;
}

/* ---------- components ---------- */
function stars(r) { return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)); }
function cardHTML(p) {
  const w = state.wish.includes(p.id);
  return `<article class="card">
    ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
    <button class="wish ${w ? 'on' : ''}" data-wish="${p.id}" onclick="toggleWish('${p.id}')" aria-label="Favorito">${w ? '♥' : '♡'}</button>
    <a href="#/producto/${p.id}" class="card-img"><img loading="lazy" src="${IMG(p.imgs[0], 500, 500)}" alt="${esc(p.name)}" onerror="imgFail(this)"></a>
    <div class="card-body">
      <span class="card-cat">${CATEGORIES[p.cat].name}</span>
      <a href="#/producto/${p.id}" class="card-name">${esc(p.name)}</a>
      <span class="stars">${stars(p.rating)} <small>(${p.reviews})</small></span>
      <div class="price"><b>${eur(p.price)}</b>${p.old ? `<s>${eur(p.old)}</s>` : ''}</div>
      <button class="add-btn" onclick="addToCart('${p.id}')">Añadir al carrito</button>
    </div></article>`;
}
function crumbs(items) {
  return `<nav class="crumbs" aria-label="Migas de pan"><a href="#/">Inicio</a>${items.map(([t, h]) => ` / ${h ? `<a href="${h}">${t}</a>` : `<span>${t}</span>`}`).join('')}</nav>`;
}
function phero(title, sub, trail) {
  return `<section class="phero"><div class="wrap">${crumbs(trail || [[title]])}<h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div></section>`;
}

/* ---------- SEO ---------- */
const SITE = 'https://langreoalbeniz.github.io/peludo-store/';
function setMeta({ title, desc, img, jsonld }) {
  document.title = title ? `${title} | Peludo` : 'Peludo — Accesorios para perros';
  const set = (sel, attr, val) => { let m = $(sel); if (m) m.setAttribute(attr, val); };
  const d = desc || 'Accesorios para perros: collares, arneses, camas y juguetes. Envío gratis desde 49 €. Devoluciones en 30 días.';
  set('meta[name="description"]', 'content', d);
  set('meta[property="og:title"]', 'content', document.title);
  set('meta[property="og:description"]', 'content', d);
  set('meta[property="og:url"]', 'content', SITE + location.hash);
  set('meta[property="og:image"]', 'content', IMG(img || FALLBACK_IMG, 1200, 630));
  set('link[rel="canonical"]', 'href', SITE + location.hash);
  $('#jsonld').textContent = JSON.stringify(jsonld || {
    '@context': 'https://schema.org', '@type': 'OnlineStore', name: 'Peludo', url: SITE,
    email: 'hola@peludo.es', address: { '@type': 'PostalAddress', addressLocality: 'Madrid', addressCountry: 'ES' } });
}

/* ---------- router ---------- */
const ROUTES = [];
function on(pattern, view) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
  ROUTES.push({ re, keys, view });
}
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path: path.startsWith('/') ? path : '/' + path, query: Object.fromEntries(new URLSearchParams(qs || '')) };
}
function route() {
  const { path, query } = parseHash();
  for (const r of ROUTES) {
    const m = path.match(r.re);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      const app = $('#app');
      app.innerHTML = r.view(params, query) || '';
      if (typeof afterRender === 'function') afterRender(path);
      return;
    }
  }
  $('#app').innerHTML = viewNotFound();
}
function onRouteChange() {
  closeAll();
  route();
  window.scrollTo(0, 0);
  $('#app').focus({ preventScroll: true });
  const top = '/' + (parseHash().path.split('/')[1] || '');
  $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + top));
}
function go(path) { location.hash = '#' + path; }
window.addEventListener('hashchange', onRouteChange);
