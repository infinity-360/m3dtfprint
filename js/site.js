/* Partes comuns: cabeçalho, rodapé, WhatsApp e vitrine de produtos */
(function () {
  const C = window.M3;
  const WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1 2.1 3.2 5.1 4.5c1.9.8 2.6.9 3.6.7.6-.1 1.9-.8 2.1-1.5s.3-1.3.2-1.5-.2-.2-.5-.3z"/></svg>';
  const SHOPEE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a4.5 4.5 0 0 0-4.4 3.6H4.2a1 1 0 0 0-1 1.1l1.3 13.5A2 2 0 0 0 6.5 22h11a2 2 0 0 0 2-1.8l1.3-13.5a1 1 0 0 0-1-1.1h-3.4A4.5 4.5 0 0 0 12 2zm0 1.6a2.9 2.9 0 0 1 2.8 2H9.2A2.9 2.9 0 0 1 12 3.6zm.1 5.2c1.4 0 2.5.6 3 1l-.7 1.2c-.6-.4-1.4-.8-2.3-.8-.9 0-1.4.4-1.4.9 0 .6.7.9 1.8 1.3 1.6.5 2.9 1.2 2.9 2.8 0 1.7-1.5 2.9-3.5 2.9-1.4 0-2.6-.5-3.3-1.1l.8-1.2c.7.5 1.6.9 2.5.9 1 0 1.7-.4 1.7-1.1s-.7-1-1.9-1.4c-1.5-.5-2.8-1.1-2.8-2.6 0-1.6 1.4-2.8 3.2-2.8z"/></svg>';
  window.M3_ICONS = { WA_ICON, SHOPEE_ICON };

  window.waLink = function (msg) {
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg || 'Olá, M3 DTF PRINT! Vim pelo site e quero fazer um orçamento.');
  };
  window.brl = function (v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };

  const page = document.body.dataset.page || '';
  const link = (href, label, key) => `<a href="${href}" class="${page === key ? 'active' : ''}">${label}</a>`;

  const header = document.getElementById('site-header');
  if (header) {
    header.outerHTML = `
      <div class="topbar">🚚 Enviamos para <b>todo o Brasil</b> · Sem taxa de montagem de arte · Atendimento pelo WhatsApp</div>
      <header class="site">
        <div class="container nav">
          <a class="brand" href="index.html" aria-label="M3 DTF Print — início"><img src="assets/logo.svg" alt="M3 DTF Print"></a>
          <button class="burger" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>
          <nav class="menu">
            ${link('index.html', 'Home', 'home')}
            ${link('produtos.html', 'Produtos', 'produtos')}
            ${link('index.html#como-funciona', 'Como funciona', '')}
            ${link('index.html#tour', 'Tour 360°', '')}
            ${link('index.html#faq', 'Dúvidas', '')}
            <a class="btn btn-primary btn-sm" href="montador.html">Criar DTF</a>
          </nav>
        </div>
      </header>`;
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.menu');
    burger.addEventListener('click', () => {
      const o = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', o);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.outerHTML = `
      <footer class="site">
        <div class="container foot">
          <div>
            <div class="logo-box"><img src="assets/logo.svg" alt="M3 DTF Print"></div>
            <p>💡 Sua ideia, nossa estampa.<br>Especialistas em impressão DTF Têxtil e UV com alta qualidade.</p>
          </div>
          <div>
            <h4>Navegação</h4>
            <a href="index.html">Home</a>
            <a href="montador.html">Montar DTF online</a>
            <a href="produtos.html">Produtos</a>
            <a href="index.html#faq">Dúvidas frequentes</a>
          </div>
          <div>
            <h4>Atendimento</h4>
            <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp ${C.whatsappExibicao}</a>
            <a href="${C.instagram}" target="_blank" rel="noopener">Instagram @m3.dtf</a>
            <a href="${C.shopee}" target="_blank" rel="noopener">Loja na Shopee</a>
          </div>
          <div>
            <h4>Endereço</h4>
            <p>${C.endereco}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Av. Cristiano Kussmaul, 242, Apucarana - PR')}" target="_blank" rel="noopener">Ver no mapa →</a>
          </div>
        </div>
        <div class="container copy">
          <span>© ${new Date().getFullYear()} M3 DTF PRINT — Todos os direitos reservados.</span>
          <span>Apucarana · Paraná · Brasil</span>
        </div>
      </footer>
      <a class="wa-float" href="${waLink()}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${WA_ICON}</a>`;
  }

  document.querySelectorAll('[data-wa]').forEach(a => {
    a.href = waLink(a.dataset.wa || undefined);
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- vitrine ---------- */
  const grid = document.getElementById('grid-produtos');
  if (grid && window.M3_PRODUTOS) {
    const limit = parseInt(grid.dataset.limit || '0', 10);
    const catNames = { textil: 'DTF Têxtil', uv: 'DTF UV', etiquetas: 'Etiquetas', kits: 'Kits' };
    function card(p) {
      const shopee = `https://shopee.com.br/product/${C.shopeeId}/${p.id}`;
      const msg = `Olá, M3 DTF PRINT! Tenho interesse no produto:\n*${p.nome}*\nA partir de ${brl(p.preco)}\n\nPode me passar mais informações?`;
      return `<article class="prod" data-cat="${p.cat}">
        <div class="ph">${p.destaque ? '<span class="badge">Mais vendido</span>' : ''}<img loading="lazy" src="assets/produtos/${p.img}.jpg" alt="${p.nome}"></div>
        <div class="bd">
          <span class="meta">${catNames[p.cat]} · <span class="stars">★</span> ${p.nota.toFixed(1)}${p.vendidos ? ' · ' + p.vendidos + ' vendidos' : ''}</span>
          <h3 title="${p.nome}">${p.nome}</h3>
          <div class="pr"><small>a partir de</small>${brl(p.preco)}</div>
          <div class="acts">
            <a class="btn btn-shopee btn-sm" href="${shopee}" target="_blank" rel="noopener">${SHOPEE_ICON} Comprar na Shopee</a>
            <a class="btn btn-wa btn-sm" href="${waLink(msg)}" target="_blank" rel="noopener">${WA_ICON} Pedir no WhatsApp</a>
          </div>
        </div>
      </article>`;
    }
    let list = window.M3_PRODUTOS;
    if (limit) list = list.filter(p => p.destaque).slice(0, limit);
    grid.innerHTML = list.map(card).join('');

    document.querySelectorAll('.filters .chip').forEach(ch => ch.addEventListener('click', () => {
      document.querySelectorAll('.filters .chip').forEach(c => c.classList.remove('on'));
      ch.classList.add('on');
      const f = ch.dataset.f;
      grid.querySelectorAll('.prod').forEach(el => { el.style.display = (f === 'all' || el.dataset.cat === f) ? '' : 'none'; });
    }));
  }
})();
