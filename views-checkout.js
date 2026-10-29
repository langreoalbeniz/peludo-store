function coSteps(n) {
  return `<div class="steps">${['Carrito', 'Envío', 'Pago', 'Confirmación'].map((s, i) => `<span class="${i < n ? 'done' : i === n ? 'on' : ''}">${i + 1}. ${s}</span>`).join('')}</div>`;
}
function field(id, label, opts = {}) {
  const v = esc(state.checkout[id] || '');
  return `<div class="field ${opts.full ? 'full' : ''}"><label for="${id}">${label}${opts.req === false ? '' : ' *'}</label>
    <input id="${id}" name="${id}" type="${opts.type || 'text'}" value="${v}" ${opts.req === false ? '' : 'required'} ${opts.ph ? `placeholder="${opts.ph}"` : ''} ${opts.attrs || ''}></div>`;
}
function emptyCartGuard() {
  if (state.cart.length) return '';
  return `<div class="wrap empty" style="padding-block:80px"><div>🛒</div><p>No hay nada en el carrito todavía.</p><p style="margin-top:16px"><a class="btn" href="#/tienda">Ir a la tienda</a></p></div>`;
}

on('/checkout/envio', () => {
  setMeta({ title: 'Checkout · Envío' });
  const g = emptyCartGuard(); if (g) return g;
  const ship = state.checkout.ship || 'std';
  const t = totals(ship);
  return `<div class="wrap co"><div>
    ${coSteps(1)}
    <form class="box" id="ship-form" onsubmit="submitShipping(event)" novalidate>
      <h2>Datos de envío</h2>
      <div class="fields">
        ${field('email', 'Email', { type: 'email', full: true, ph: 'tu@email.com' })}
        ${field('nombre', 'Nombre')}${field('apellidos', 'Apellidos')}
        ${field('direccion', 'Dirección', { full: true, ph: 'Calle, número, piso' })}
        ${field('cp', 'Código postal', { attrs: 'inputmode="numeric" pattern="[0-9]{5}" maxlength="5"' })}${field('ciudad', 'Ciudad')}
        <div class="field"><label for="provincia">Provincia *</label><select id="provincia" required>${['', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Asturias', 'Vizcaya', 'Zaragoza', 'Alicante', 'Otra'].map(p => `<option ${state.checkout.provincia === p ? 'selected' : ''} value="${p}">${p || 'Selecciona…'}</option>`).join('')}</select></div>
        ${field('tel', 'Teléfono', { type: 'tel', ph: '600 000 000' })}
      </div>
      <h2 style="margin-top:28px">Método de envío</h2>
      ${Object.entries(SHIPPING).map(([k, s]) => {
        const price = k === 'exp' ? s.price : ((t.sub - t.disc) >= FREE_SHIPPING ? 0 : s.price);
        return `<label class="radio"><input type="radio" name="ship" value="${k}" ${ship === k ? 'checked' : ''} onchange="state.checkout.ship=this.value;save('peludo_checkout',state.checkout);route()"><span class="grow">${s.name}</span><b>${price ? eur(price) : 'Gratis'}</b></label>`;
      }).join('')}
      <p id="ship-err" class="err-msg" hidden>Revisa los campos marcados.</p>
      <div style="display:flex;gap:12px;justify-content:space-between;margin-top:20px;flex-wrap:wrap"><a href="#/carrito" class="btn ghost">← Volver al carrito</a><button class="btn">Continuar al pago →</button></div>
    </form></div>
    ${summaryBox(t, '')}
  </div>`;
});
function submitShipping(e) {
  e.preventDefault();
  const f = e.target;
  let ok = true;
  ['email', 'nombre', 'apellidos', 'direccion', 'cp', 'ciudad', 'provincia', 'tel'].forEach(id => {
    const el = $('#' + id, f);
    const valid = el.checkValidity() && el.value.trim();
    el.closest('.field').classList.toggle('err', !valid);
    if (valid) state.checkout[id] = el.value.trim(); else ok = false;
  });
  state.checkout.ship = f.ship.value;
  save('peludo_checkout', state.checkout);
  $('#ship-err').hidden = ok;
  if (ok) go('/checkout/pago');
}

on('/checkout/pago', () => {
  setMeta({ title: 'Checkout · Pago' });
  const g = emptyCartGuard(); if (g) return g;
  if (!state.checkout.email) { setTimeout(() => go('/checkout/envio')); return ''; }
  const c = state.checkout;
  const t = totals(c.ship);
  return `<div class="wrap co"><div>
    ${coSteps(2)}
    <div class="box" style="margin-bottom:16px;font-size:14px"><div class="row"><span><b>Enviar a</b><br>${esc(c.nombre)} ${esc(c.apellidos)} · ${esc(c.direccion)}, ${esc(c.cp)} ${esc(c.ciudad)}<br>${SHIPPING[c.ship || 'std'].name}</span><a href="#/checkout/envio" style="color:var(--accent)">Cambiar</a></div></div>
    <form class="box" onsubmit="submitPayment(event)" novalidate>
      <h2>Método de pago</h2>
      <p class="note" style="margin-bottom:14px">🧪 Tienda de demostración: no se realiza ningún cargo. Usa la tarjeta de prueba 4242 4242 4242 4242.</p>
      <label class="radio"><input type="radio" name="pay" value="card" checked onchange="payMethod(this.value)"><span class="grow">💳 Tarjeta de crédito o débito</span></label>
      <div id="card-fields" class="fields" style="margin:6px 0 16px">
        <div class="field full"><label for="cc">Número de tarjeta *</label><input id="cc" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242" maxlength="19" oninput="this.value=this.value.replace(/\\D/g,'').replace(/(.{4})/g,'$1 ').trim()"></div>
        <div class="field"><label for="exp">Caducidad *</label><input id="exp" placeholder="MM/AA" maxlength="5" autocomplete="off"></div>
        <div class="field"><label for="cvc">CVC *</label><input id="cvc" inputmode="numeric" maxlength="4" placeholder="123" autocomplete="off"></div>
      </div>
      <label class="radio"><input type="radio" name="pay" value="paypal" onchange="payMethod(this.value)"><span class="grow">🅿️ PayPal</span></label>
      <label class="radio"><input type="radio" name="pay" value="bizum" onchange="payMethod(this.value)"><span class="grow">📱 Bizum</span></label>
      <label style="display:flex;gap:10px;align-items:flex-start;font-size:14px;margin-top:16px"><input type="checkbox" id="terms"> <span>He leído y acepto los <a href="#/terminos" style="color:var(--accent)">términos y condiciones</a> y la <a href="#/privacidad" style="color:var(--accent)">política de privacidad</a>.</span></label>
      <p id="pay-err" class="err-msg" hidden></p>
      <div style="display:flex;gap:12px;justify-content:space-between;margin-top:20px;flex-wrap:wrap"><a href="#/checkout/envio" class="btn ghost">← Volver</a><button class="btn" id="pay-btn">Pagar ${eur(t.total)}</button></div>
    </form></div>
    ${summaryBox(t, '')}
  </div>`;
});
function payMethod(v) { $('#card-fields').hidden = v !== 'card'; }
function submitPayment(e) {
  e.preventDefault();
  const f = e.target, err = $('#pay-err');
  const method = f.pay.value;
  const fail = m => { err.textContent = m; err.hidden = false; };
  if (method === 'card') {
    const cc = $('#cc').value.replace(/\s/g, '');
    if (cc.length < 15) return fail('Introduce un número de tarjeta válido (prueba 4242 4242 4242 4242).');
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test($('#exp').value)) return fail('La caducidad debe tener formato MM/AA.');
    if (!/^\d{3,4}$/.test($('#cvc').value)) return fail('El CVC debe tener 3 o 4 dígitos.');
  }
  if (!$('#terms').checked) return fail('Debes aceptar los términos y condiciones.');
  err.hidden = true;
  const btn = $('#pay-btn'); btn.disabled = true; btn.textContent = 'Procesando…';
  setTimeout(() => {
    const t = totals(state.checkout.ship);
    state.lastOrder = {
      num: 'PLD-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)),
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      items: state.cart.map(l => ({ ...l })), totals: t, method, ship: state.checkout.ship || 'std',
      to: { ...state.checkout },
    };
    save('peludo_last_order', state.lastOrder);
    state.cart = []; state.coupon = null;
    save('peludo_coupon', null); persistCart();
    go('/checkout/confirmacion');
  }, 1200);
}

on('/checkout/confirmacion', () => {
  setMeta({ title: 'Pedido confirmado' });
  const o = state.lastOrder;
  if (!o) return `<div class="wrap empty" style="padding-block:80px"><div>📦</div><p>No hay ningún pedido reciente.</p><p style="margin-top:16px"><a class="btn" href="#/tienda">Ir a la tienda</a></p></div>`;
  return `<div class="wrap narrow" style="padding-block:48px 72px">
    ${coSteps(3)}
    <div class="box" style="text-align:center;padding-block:40px">
      <div style="font-size:56px">🐾</div>
      <h1 style="font-size:36px;margin:8px 0">¡Gracias, ${esc(o.to.nombre)}!</h1>
      <p class="muted">Tu pedido <b>${o.num}</b> está confirmado. Te hemos enviado un email a <b>${esc(o.to.email)}</b>.</p>
    </div>
    <div class="box" style="margin-top:16px">
      <h2>Resumen del pedido</h2>
      ${o.items.map(l => { const p = productById(l.id); return `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--border)"><span>${l.qty} × ${esc(p.name)}${l.size ? ` (${l.size})` : ''}</span><span>${eur(p.price * l.qty)}</span></div>`; }).join('')}
      <div style="display:grid;gap:6px;margin-top:12px">
        ${o.totals.disc ? `<div class="row"><span>Descuento</span><span>−${eur(o.totals.disc)}</span></div>` : ''}
        <div class="row"><span>Envío (${SHIPPING[o.ship].name})</span><span>${o.totals.ship ? eur(o.totals.ship) : 'Gratis'}</span></div>
        <div class="row total"><span>Total pagado</span><span>${eur(o.totals.total)}</span></div>
      </div>
      <p class="muted" style="margin-top:16px;font-size:14px"><b>Dirección:</b> ${esc(o.to.direccion)}, ${esc(o.to.cp)} ${esc(o.to.ciudad)} (${esc(o.to.provincia)})</p>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap">
      <a class="btn" href="#/seguimiento?pedido=${o.num}">Seguir mi pedido</a><a class="btn ghost" href="#/tienda">Seguir comprando</a>
    </div>
  </div>`;
});

on('/seguimiento', (_, q) => {
  setMeta({ title: 'Seguimiento de pedido', desc: 'Consulta el estado de tu pedido de Peludo.' });
  const num = q.pedido || '';
  return phero('Seguimiento de pedido', 'Introduce tu número de pedido y el email de compra.', [['Seguimiento']]) + `
  <div class="wrap narrow" style="padding-block:40px 72px">
    <form class="box" onsubmit="event.preventDefault();trackOrder()">
      <div class="fields">
        <div class="field"><label for="tr-num">Número de pedido *</label><input id="tr-num" value="${esc(num)}" placeholder="PLD-2026-0892"></div>
        <div class="field"><label for="tr-email">Email *</label><input id="tr-email" type="email" value="${esc(num && state.lastOrder ? state.lastOrder.to.email : '')}" placeholder="tu@email.com"></div>
      </div>
      <p id="tr-err" class="err-msg" hidden style="margin-top:8px">Introduce el número de pedido y el email.</p>
      <button class="btn" style="margin-top:16px">Buscar pedido</button>
    </form>
    <div id="tr-out"></div>
  </div>`;
});
function trackOrder() {
  const num = $('#tr-num').value.trim().toUpperCase(), email = $('#tr-email').value.trim();
  $('#tr-err').hidden = !!(num && email);
  if (!num || !email) return;
  const today = new Date(), d = n => new Date(today - n * 864e5).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  $('#tr-out').innerHTML = `<div class="box" style="margin-top:16px">
    <div class="row"><b>Pedido ${esc(num)}</b><span class="tag" style="position:static">En camino</span></div>
    <p class="muted" style="font-size:14px;margin-top:6px">Transportista GLS · Entrega estimada: mañana, 9:00–14:00</p>
    <div class="timeline">
      <div class="done"><b>Pedido confirmado</b><br><small class="muted">${d(2)}</small></div>
      <div class="done"><b>Preparado en almacén BigBuy (Valencia)</b><br><small class="muted">${d(1)}</small></div>
      <div class="done"><b>En tránsito — hub de reparto</b><br><small class="muted">Hoy</small></div>
      <div><b>Entregado</b><br><small class="muted">Pendiente</small></div>
    </div></div>`;
}

on('/mi-cuenta', () => {
  setMeta({ title: 'Mi cuenta' });
  const o = state.lastOrder;
  return phero('Mi cuenta', 'Tus pedidos, favoritos y Peludo Points.', [['Mi cuenta']]) + `<div class="wrap" style="padding-block:40px 72px">
    <div class="cards3">
      <a class="box" href="#/favoritos"><h2>♡ Favoritos</h2><p class="muted">${state.wish.length} productos guardados</p></a>
      <a class="box" href="#/seguimiento${o ? '?pedido=' + o.num : ''}"><h2>📦 Pedidos</h2><p class="muted">${o ? `Último: ${o.num} · ${eur(o.totals.total)}` : 'Aún no tienes pedidos'}</p></a>
      <div class="box"><h2>⭐ Peludo Points</h2><p class="muted">${o ? Math.floor(o.totals.total) : 0} puntos · 1 punto por cada euro. 100 puntos = 5 € de descuento.</p></div>
    </div>
    <p class="note" style="margin-top:20px">Demo: los datos se guardan solo en este navegador.</p>
  </div>`;
});
