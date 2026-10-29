on('/sobre-nosotros', () => {
  setMeta({ title: 'Sobre nosotros', desc: 'Peludo nació en Madrid en 2023: tres dueños de perros con una tienda especializada respaldada por BigBuy.' });
  return `<section class="hero"><div class="wrap" style="padding-block:72px;text-align:center">
    ${crumbs([['Sobre nosotros']])}
    <h1 style="font-size:clamp(34px,6vw,58px);font-weight:900">Porque tu perro se merece <em style="color:var(--accent)">lo mejor</em></h1>
    <p style="opacity:.8;max-width:560px;margin:16px auto 0">Productos de calidad europea, a precios justos y con envío rápido.</p></div></section>
  <div class="wrap" style="padding-block:40px"><div class="stat-grid"><div><b>2.000+</b>productos</div><div><b>30</b>días para devolver</div><div><b>48 h</b>entrega express</div><div><b>9+</b>países de stock</div></div></div>
  <section class="section"><div class="wrap two">
    <div><p class="eyebrow">Nuestra historia</p><h2 style="font-size:32px;margin-bottom:14px">De tres amigos y tres perros</h2>
      <p class="muted" style="margin-bottom:12px">Peludo nació en Madrid en 2023 cuando tres amigos se cansaron de recorrer varias tiendas para encontrar todo lo que necesitaban Max, Nala y Bruno.</p>
      <p class="muted">Hoy trabajamos con la logística de BigBuy Europe para garantizar stock y envíos rápidos a toda España.</p></div>
    <div class="hero-img"><img src="${IMG('1548199973-03cce0bbc87b', 800, 600)}" alt="Perros jugando en el parque" onerror="imgFail(this)"></div>
  </div></section>
  <section class="section" style="background:var(--bg-alt)"><div class="wrap"><h2 style="font-size:32px;margin-bottom:24px">Nuestros valores</h2><div class="cards3">
    <div class="box"><h3>🐾 Bienestar animal</h3><p class="muted">Solo productos seguros, con materiales no tóxicos y estándares europeos.</p></div>
    <div class="box"><h3>🌿 Sostenibilidad</h3><p class="muted">Embalaje reciclado y proveedores con materiales responsables.</p></div>
    <div class="box"><h3>💛 Transparencia</h3><p class="muted">Precios claros, 30 días para devolver y soporte de personas reales.</p></div>
  </div></div></section>
  <section class="section"><div class="wrap"><h2 style="font-size:32px;margin-bottom:24px">El equipo</h2><div class="cards3">
    ${[['Carlos Martínez', 'CEO · dueño de Max', '1535713875002-d1d0cf377fde'], ['Laura Sánchez', 'Marketing · dueña de Nala', '1494790108377-be9c29b29330'], ['Javier López', 'Tecnología · dueño de Bruno', '1507003211169-0a1dd7228f2d']]
      .map(([n, r, i]) => `<div style="text-align:center"><img src="${IMG(i, 200, 200)}" alt="${n}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;margin:0 auto 10px" onerror="imgFail(this)"><b>${n}</b><p class="muted" style="font-size:14px">${r}</p></div>`).join('')}
  </div></div></section>`;
});

on('/contacto', () => {
  setMeta({ title: 'Contacto', desc: 'Escríbenos o llámanos. Respondemos en menos de 24 horas.' });
  return phero('Contacto', 'Estamos aquí para ayudarte · Respuesta en menos de 24 h', [['Contacto']]) + `
  <div class="wrap co">
    <form class="box" id="contact" onsubmit="sendContact(event)" novalidate>
      <h2>Envíanos un mensaje</h2>
      <div class="fields">
        <div class="field"><label for="cf-n">Nombre *</label><input id="cf-n" required></div>
        <div class="field"><label for="cf-e">Email *</label><input id="cf-e" type="email" required></div>
        <div class="field full"><label for="cf-o">Nº de pedido (opcional)</label><input id="cf-o" placeholder="PLD-2026-XXXX"></div>
        <div class="field full"><label for="cf-s">Motivo</label><select id="cf-s"><option>Pregunta sobre un producto</option><option>Estado de mi pedido</option><option>Devolución o cambio de talla</option><option>Colaboraciones</option><option>Otro</option></select></div>
        <div class="field full"><label for="cf-m">Mensaje *</label><textarea id="cf-m" required></textarea></div>
      </div>
      <p id="cf-err" class="err-msg" hidden>Rellena nombre, un email válido y el mensaje.</p>
      <button class="btn" style="margin-top:16px">Enviar mensaje</button>
    </form>
    <aside style="display:grid;gap:12px">
      <div class="box"><h3>📧 Email</h3><p class="muted">hola@peludo.es</p></div>
      <div class="box"><h3>📞 Teléfono</h3><p class="muted">900 000 000 (gratuito)<br>L–V 9:00–18:00 · S 10:00–14:00</p></div>
      <div class="box"><h3>📍 Dirección</h3><p class="muted">Peludo Accesorios S.L.<br>Calle de los Perros, 42 · 28001 Madrid</p></div>
      <a class="box" href="#/seguimiento">📦 <b>Seguir mi pedido</b></a>
      <a class="box" href="#/faq">❓ <b>Preguntas frecuentes</b></a>
    </aside>
  </div>`;
});
function sendContact(e) {
  e.preventDefault();
  const ok = $('#cf-n').value.trim() && $('#cf-e').checkValidity() && $('#cf-e').value && $('#cf-m').value.trim();
  $('#cf-err').hidden = !!ok;
  if (ok) $('#contact').innerHTML = `<div class="empty"><div>🐾</div><h2>¡Mensaje recibido!</h2><p class="muted">Te responderemos en menos de 24 horas en ${esc($('#cf-e').value)}.</p></div>`;
}

const FAQ = [
  ['Pedidos', [['¿Cómo hago un pedido?', 'Añade productos al carrito, pulsa «Finalizar compra», rellena tus datos de envío y paga con tarjeta, PayPal o Bizum.'],
    ['¿Puedo modificar o cancelar un pedido?', 'Sí, durante la primera hora tras la compra. Escríbenos a hola@peludo.es con tu número de pedido.'],
    ['¿Qué códigos de descuento hay?', 'BIENVENIDA10 te da un 10 % en tu primer pedido. Suscríbete a la newsletter para recibir más.']]],
  ['Envíos', [['¿Cuánto tarda el envío?', 'Estándar 3–5 días hábiles, express 24 h si pides antes de las 13:00.'],
    ['¿Cuánto cuesta?', 'Gratis a partir de 49 €. Si no, 4,99 € el estándar y 9,99 € el express.'],
    ['¿Enviáis a Canarias?', 'Sí, con tarifa especial que verás en el checkout.']]],
  ['Devoluciones', [['¿Cuánto tiempo tengo para devolver?', '30 días naturales desde la entrega, sin dar explicaciones.'],
    ['¿Cuándo recibo el reembolso?', 'En un máximo de 14 días desde que recibimos el artículo, en el mismo método de pago.']]],
  ['Productos y tallas', [['¿Cómo sé qué talla necesita mi perro?', 'Mide el cuello y el pecho con una cinta métrica y consulta nuestra guía de tallas.'],
    ['¿Qué garantía tienen?', 'Todos los productos tienen 3 años de garantía legal.']]],
];
on('/faq', () => {
  setMeta({ title: 'Preguntas frecuentes', desc: 'Respuestas sobre pedidos, envíos, devoluciones y tallas.',
    jsonld: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.flatMap(([, qs]) => qs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))) } });
  return phero('Preguntas frecuentes', 'Encuentra respuestas al instante.', [['FAQ']]) + `
  <div class="wrap narrow prose">
    <input type="search" placeholder="Buscar en las preguntas…" oninput="filterFaq(this.value)" aria-label="Buscar en FAQ" style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:var(--r);background:var(--bg-card);color:var(--fg);font:inherit">
    ${FAQ.map(([sec, qs]) => `<h2>${sec}</h2>${qs.map(([q, a]) => `<div class="faq-item"><button class="faq-q" onclick="this.parentElement.classList.toggle('open')">${q}<span>+</span></button><div class="faq-a">${a}</div></div>`).join('')}`).join('')}
    <p style="margin-top:32px">¿No encuentras tu respuesta? <a href="#/contacto" style="color:var(--accent)">Contáctanos</a> · <a href="#/guia-tallas" style="color:var(--accent)">Guía de tallas</a></p>
  </div>`;
});
function filterFaq(q) { q = q.toLowerCase(); $$('.faq-item').forEach(i => { i.hidden = !i.textContent.toLowerCase().includes(q); }); }

on('/guia-tallas', () => {
  setMeta({ title: 'Guía de tallas', desc: 'Cómo medir a tu perro y qué talla elegir en collares, arneses, camas y ropa.' });
  const tbl = (h, rows) => `<div class="tbl"><table><thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return phero('Guía de tallas', 'Mide con una cinta métrica flexible y deja dos dedos de holgura.', [['Guía de tallas']]) + `<div class="wrap narrow prose">
    <h2>Collares</h2>${tbl(['Talla', 'Cuello (cm)', 'Ejemplo de raza'], [['XS', '20–28', 'Chihuahua'], ['S', '28–36', 'Yorkshire, Teckel'], ['M', '36–46', 'Beagle, Cocker'], ['L', '46–56', 'Labrador'], ['XL', '56–66', 'Pastor alemán']])}
    <h2>Arneses</h2>${tbl(['Talla', 'Pecho (cm)', 'Peso (kg)'], [['XS', '30–40', '1–4'], ['S', '40–52', '4–9'], ['M', '52–66', '9–18'], ['L', '66–82', '18–32'], ['XL', '82–100', '32+']])}
    <h2>Camas</h2>${tbl(['Talla', 'Medidas (cm)', 'Perro'], [['S', '50 × 40', 'hasta 8 kg'], ['M', '70 × 55', '8–20 kg'], ['L', '90 × 70', '20–35 kg'], ['XL', '110 × 85', '35+ kg']])}
    <h2>Ropa</h2>${tbl(['Talla', 'Espalda (cm)', 'Pecho (cm)'], [['XS', '20', '30–36'], ['S', '25', '36–44'], ['M', '30', '44–52'], ['L', '40', '52–64'], ['XL', '50', '64–76']])}
    <p>Si tu perro está entre dos tallas, elige la mayor. ¿Dudas? <a href="#/contacto" style="color:var(--accent)">Pregúntanos</a>.</p>
  </div>`;
});

on('/envios', () => {
  setMeta({ title: 'Envíos', desc: 'Plazos y tarifas de envío de Peludo.' });
  return phero('Envíos', 'Plazos, tarifas y cobertura.', [['Envíos']]) + `<div class="wrap narrow prose">
    <div class="tbl"><table><thead><tr><th>Método</th><th>Plazo</th><th>Precio</th></tr></thead><tbody>
      <tr><td>Estándar GLS</td><td>3–5 días hábiles</td><td>4,99 € · gratis desde 49 €</td></tr>
      <tr><td>Express 24 h</td><td>1 día hábil (antes de las 13:00)</td><td>9,99 €</td></tr>
      <tr><td>Recogida en punto GLS</td><td>3–5 días hábiles</td><td>Gratis</td></tr></tbody></table></div>
    <h2>¿Desde dónde enviamos?</h2><p>Trabajamos con BigBuy Europe, con almacén principal en Valencia y stock en otros 9 países de la UE.</p>
    <h2>Seguimiento</h2><p>Recibirás el número de seguimiento por email. También puedes consultarlo en <a href="#/seguimiento" style="color:var(--accent)">Seguimiento de pedido</a>.</p>
    <h2>Incidencias</h2><p>Tras dos intentos de entrega fallidos, el paquete queda 7 días en el punto GLS más cercano.</p>
  </div>`;
});

on('/devoluciones', () => {
  setMeta({ title: 'Devoluciones', desc: '30 días para devolver cualquier producto, sin preguntas.' });
  return phero('Devoluciones', '30 días para devolver, sin preguntas.', [['Devoluciones']]) + `<div class="wrap narrow prose">
    <h2>Cómo devolver un producto</h2>
    <ol><li><b>Solicítalo</b> escribiendo a devoluciones@peludo.es con tu número de pedido.</li>
      <li><b>Empaqueta</b> el artículo sin usar y, si puedes, en su embalaje original.</li>
      <li><b>Llévalo</b> a cualquier punto GLS con la etiqueta prepagada que te enviaremos.</li>
      <li><b>Recibe tu reembolso</b> en un máximo de 14 días.</li></ol>
    <h2>Condiciones</h2>
    <ul><li>Los alimentos y suplementos abiertos no se pueden devolver por higiene.</li>
      <li>Si el producto llega defectuoso o es incorrecto, la devolución es gratuita.</li>
      <li>Por desistimiento, el coste de devolución es de 4,99 €.</li>
      <li>Los cambios de talla se gestionan como devolución y pedido nuevo.</li></ul>
    <p><a class="btn" href="#/contacto">Iniciar una devolución</a></p>
  </div>`;
});

on('/privacidad', () => {
  setMeta({ title: 'Política de privacidad', desc: 'Cómo tratamos tus datos personales conforme al RGPD.' });
  return phero('Política de privacidad', 'Última actualización: 1 de octubre de 2026', [['Privacidad']]) + `<div class="wrap narrow prose">
    <h2>1. Responsable</h2><p>Peludo Accesorios S.L., CIF B-00000000, Calle de los Perros 42, 28001 Madrid. Contacto: privacidad@peludo.es.</p>
    <h2>2. Datos que tratamos</h2><ul><li>Identificación y contacto: nombre, email, teléfono, dirección.</li><li>Datos de pedido e historial de compras.</li><li>Datos de navegación mediante cookies técnicas.</li></ul>
    <h2>3. Finalidad y base legal</h2>
    <div class="tbl"><table><thead><tr><th>Finalidad</th><th>Base legal</th></tr></thead><tbody>
      <tr><td>Gestionar tu pedido</td><td>Ejecución de contrato</td></tr><tr><td>Facturación</td><td>Obligación legal</td></tr>
      <tr><td>Newsletter</td><td>Consentimiento</td></tr><tr><td>Atención al cliente</td><td>Interés legítimo</td></tr></tbody></table></div>
    <h2>4. Destinatarios</h2><p>BigBuy Europe (logística), pasarela de pago, transportistas y proveedor de email. No vendemos tus datos.</p>
    <h2>5. Conservación</h2><p>Mientras dure la relación comercial y, después, durante los plazos legales (6 años para datos fiscales).</p>
    <h2>6. Tus derechos</h2><p>Acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a privacidad@peludo.es. Puedes reclamar ante la AEPD (www.aepd.es).</p>
    <p>Consulta también nuestra <a href="#/cookies" style="color:var(--accent)">política de cookies</a>.</p>
  </div>`;
});

on('/cookies', () => {
  setMeta({ title: 'Política de cookies' });
  return phero('Política de cookies', 'Qué guardamos en tu navegador y por qué.', [['Cookies']]) + `<div class="wrap narrow prose">
    <p>Esta tienda de demostración solo usa almacenamiento local técnico. No usamos cookies de publicidad.</p>
    <div class="tbl"><table><thead><tr><th>Nombre</th><th>Finalidad</th><th>Duración</th></tr></thead><tbody>
      <tr><td>peludo_cart</td><td>Recordar tu carrito</td><td>Persistente</td></tr>
      <tr><td>peludo_wish</td><td>Recordar tus favoritos</td><td>Persistente</td></tr>
      <tr><td>peludo_checkout</td><td>Guardar los datos de envío entre pasos</td><td>Persistente</td></tr></tbody></table></div>
    <p><button class="btn ghost" onclick="clearData()">Borrar mis datos de este navegador</button></p>
  </div>`;
});
function clearData() {
  ['peludo_cart', 'peludo_wish', 'peludo_coupon', 'peludo_checkout', 'peludo_last_order'].forEach(k => { try { localStorage.removeItem(k); } catch {} });
  Object.assign(state, { cart: [], wish: [], coupon: null, checkout: {}, lastOrder: null });
  renderCartUI(); toast('Datos borrados');
}

on('/terminos', () => {
  setMeta({ title: 'Términos y condiciones' });
  const s = [['Identificación', 'Peludo Accesorios S.L., CIF B-00000000, inscrita en el Registro Mercantil de Madrid.'],
    ['Proceso de compra', 'El contrato se perfecciona cuando recibes el email de confirmación del pedido.'],
    ['Precios y pago', 'Los precios incluyen IVA. Aceptamos tarjeta, PayPal y Bizum.'],
    ['Envío', 'Plazos y tarifas según la página de envíos. El riesgo pasa al cliente en la entrega.'],
    ['Desistimiento', 'Dispones de 30 días naturales para desistir, ampliando los 14 días legales.'],
    ['Garantía', 'Tres años de garantía legal de conformidad según el RDL 1/2007.'],
    ['Propiedad intelectual', 'Los contenidos de esta web pertenecen a Peludo o a sus licenciantes.'],
    ['Legislación', 'Se aplica la legislación española. Plataforma de resolución de litigios en línea de la UE: ec.europa.eu/consumers/odr.']];
  return phero('Términos y condiciones', 'Condiciones generales de contratación.', [['Términos']]) + `<div class="wrap narrow prose">
    ${s.map(([h, p], i) => `<h2>${i + 1}. ${h}</h2><p>${p}</p>`).join('')}
    <p>Ver también: <a href="#/envios" style="color:var(--accent)">Envíos</a> · <a href="#/devoluciones" style="color:var(--accent)">Devoluciones</a> · <a href="#/privacidad" style="color:var(--accent)">Privacidad</a></p>
  </div>`;
});

function blogCard(b) {
  return `<a class="blog-card" href="#/blog/${b.slug}"><img loading="lazy" src="${IMG(b.img, 640, 400)}" alt="" onerror="imgFail(this)"><small class="muted">${b.date} · ${CATEGORIES[b.cat].name}</small><h3>${b.title}</h3><p class="muted" style="font-size:14px">${b.excerpt}</p></a>`;
}
on('/blog', () => {
  setMeta({ title: 'Blog', desc: 'Consejos sobre cuidado, educación y accesorios para perros.' });
  return phero('Blog', 'Consejos para dueños de perros.', [['Blog']]) + `<div class="wrap section"><div class="cards3">${BLOG.map(blogCard).join('')}</div></div>`;
});
on('/blog/:slug', ({ slug }) => {
  const b = BLOG.find(x => x.slug === slug);
  if (!b) return viewNotFound();
  setMeta({ title: b.title, desc: b.excerpt, img: b.img, jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: b.title, description: b.excerpt, image: IMG(b.img, 1200, 630), author: { '@type': 'Organization', name: 'Peludo' } } });
  const rel = PRODUCTS.filter(p => p.cat === b.cat).slice(0, 4);
  return `<div class="wrap"><article class="article">
    ${crumbs([['Blog', '#/blog'], [b.title]])}
    <small class="muted">${b.date} · ${CATEGORIES[b.cat].name}</small><h1>${b.title}</h1>
    <img src="${IMG(b.img, 1200, 675)}" alt="" onerror="imgFail(this)">
    ${b.body.map(x => Array.isArray(x) ? `<h2>${x[1]}</h2>` : `<p>${x}</p>`).join('')}
  </article>
  <section class="section" style="padding-top:0"><div class="section-head"><h2>Productos relacionados</h2><a href="#/categoria/${b.cat}" style="color:var(--accent)">Ver ${CATEGORIES[b.cat].name.toLowerCase()} →</a></div><div class="grid">${rel.map(cardHTML).join('')}</div></section></div>`;
});
