/* =========================================================
   M3 DTF PRINT — Montador DTF (gang sheet)
   - upload de imagens, tamanho em cm, quantidade, DPI
   - montagem automática (MaxRects, canto inferior-esquerdo)
   - exportação PNG 300 DPI em faixas (sem limite de canvas)
   - envio para o WhatsApp
   ========================================================= */
(function () {
  const C = window.M3;
  const $ = s => document.querySelector(s);
  const state = {
    tipo: new URLSearchParams(location.search).get('tipo') === 'uv' ? 'uv' : 'textil',
    items: [],
    gap: C.espacamentoCm,
    rotate: true,
    sheets: [],
    zoom: 1,
    files: []
  };
  let uid = 0;
  const cfg = () => C.impressoes[state.tipo];
  const usableW = () => cfg().largura - 2 * C.margemCm;
  const usableH = () => cfg().alturaFolha - 2 * C.margemCm;
  const fmt = (n, d = 1) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d });

  /* ---------- tipo de impressão ---------- */
  const tipos = $('#tipos');
  tipos.innerHTML = Object.entries(C.impressoes).map(([k, t]) => `
    <label><input type="radio" name="tipo" value="${k}" ${k === state.tipo ? 'checked' : ''}>
      <strong>${t.nome}</strong><span>${t.largura} cm de largura · ${brl(t.precoMetro)}/m</span></label>`).join('');
  tipos.addEventListener('change', e => {
    state.tipo = e.target.value;
    state.items.forEach(fitItem);
    renderItems(); layout();
  });

  $('#gap').value = state.gap;
  $('#gap').addEventListener('input', e => { state.gap = Math.max(0, parseFloat(e.target.value) || 0); layout(); });
  $('#rotate').addEventListener('change', e => { state.rotate = e.target.checked; layout(); });

  /* ---------- upload ---------- */
  const drop = $('#drop'), input = $('#file');
  input.addEventListener('change', () => { const list = [...input.files]; input.value = ''; addFiles(list); });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => addFiles([...e.dataTransfer.files]));

  async function addFiles(list) {
    for (const file of list) {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { alert(`"${file.name}" não é PNG, JPG ou WEBP.`); continue; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      try { await img.decode(); } catch { alert(`Não foi possível ler "${file.name}".`); continue; }
      const pxW = img.naturalWidth, pxH = img.naturalHeight;
      // tamanho inicial = tamanho real a 300 DPI, limitado à folha
      let wCm = pxW / C.dpi * 2.54;
      const item = { id: ++uid, name: file.name, file, url, img, pxW, pxH, ratio: pxH / pxW, wCm, hCm: wCm * pxH / pxW, qty: 1 };
      if (item.wCm < 2) { item.wCm = Math.min(10, usableW()); item.hCm = item.wCm * item.ratio; }
      fitItem(item);
      state.items.push(item);
    }
    renderItems(); layout();
  }

  /* garante que a imagem caiba na folha (considerando giro) */
  function fitItem(it) {
    const maxW = usableW(), maxH = usableH();
    const fits = (w, h) => (w <= maxW && h <= maxH) || (state.rotate && h <= maxW && w <= maxH);
    if (!fits(it.wCm, it.hCm)) {
      let s = Math.min(maxW / it.wCm, maxH / it.hCm);
      if (state.rotate) s = Math.max(s, Math.min(maxW / it.hCm, maxH / it.wCm));
      it.wCm *= s; it.hCm *= s;
    }
    it.wCm = Math.floor(it.wCm * 10) / 10; it.hCm = Math.round(it.wCm * it.ratio * 10) / 10;
  }

  function dpiBadge(it) {
    const dpi = Math.round(it.pxW / (it.wCm / 2.54));
    const cls = dpi >= 250 ? 'ok' : dpi >= 150 ? 'med' : 'low';
    const txt = dpi >= 250 ? 'Ótima' : dpi >= 150 ? 'Boa' : 'Baixa — pode pixelar';
    return `<span class="dpi ${cls}">${dpi} DPI · ${txt}</span>`;
  }

  function renderItems() {
    const box = $('#items');
    box.innerHTML = state.items.map(it => `
      <div class="item" data-id="${it.id}">
        <div class="thumb"><img src="${it.url}" alt=""></div>
        <div>
          <div class="nm" title="${it.name}">${it.name}</div>
          <div class="row">
            <div><label>Largura (cm)</label><input type="number" data-f="w" min="0.5" step="0.1" value="${it.wCm}"></div>
            <div><label>Altura (cm)</label><input type="number" data-f="h" min="0.5" step="0.1" value="${it.hCm}"></div>
            <div><label>Qtd.</label><input type="number" data-f="q" min="1" step="1" value="${it.qty}"></div>
          </div>
          <span class="dpi-slot">${dpiBadge(it)}</span>
        </div>
        <button class="rm" aria-label="Remover imagem" title="Remover">×</button>
      </div>`).join('');
  }

  $('#items').addEventListener('change', e => {
    const el = e.target.closest('.item'); if (!el) return;
    const it = state.items.find(i => i.id == el.dataset.id);
    const f = e.target.dataset.f, v = parseFloat(e.target.value);
    if (!(v > 0)) { renderItems(); return; }
    if (f === 'w') { it.wCm = v; it.hCm = v * it.ratio; }
    if (f === 'h') { it.hCm = v; it.wCm = v / it.ratio; }
    if (f === 'q') it.qty = Math.max(1, Math.min(999, Math.round(v)));
    const before = it.wCm;
    fitItem(it);
    if (it.wCm < before - 0.05) alert(`A imagem foi ajustada para ${fmt(it.wCm)} × ${fmt(it.hCm)} cm, o máximo que cabe na folha de ${cfg().largura} cm.`);
    renderItems(); layout();
  });
  $('#items').addEventListener('click', e => {
    if (!e.target.classList.contains('rm')) return;
    const id = e.target.closest('.item').dataset.id;
    const i = state.items.findIndex(x => x.id == id);
    URL.revokeObjectURL(state.items[i].url);
    state.items.splice(i, 1);
    renderItems(); layout();
  });

  /* ---------- montagem: MaxRects (bottom-left) ---------- */
  function newBin(W, H) { return { W, H, free: [{ x: 0, y: 0, w: W, h: H }], used: [] }; }

  function findPos(bin, w, h, allowRot) {
    let best = null;
    for (const f of bin.free) {
      const tries = [[w, h, false]];
      if (allowRot && w !== h) tries.push([h, w, true]);
      for (const [tw, th, rot] of tries) {
        if (tw <= f.w + 1e-9 && th <= f.h + 1e-9) {
          const score = f.y + th, tie = f.x;
          if (!best || score < best.score - 1e-9 || (Math.abs(score - best.score) < 1e-9 && tie < best.tie))
            best = { x: f.x, y: f.y, w: tw, h: th, rot, score, tie };
        }
      }
    }
    return best;
  }

  function place(bin, r) {
    const out = [];
    for (const f of bin.free) {
      if (r.x >= f.x + f.w || r.x + r.w <= f.x || r.y >= f.y + f.h || r.y + r.h <= f.y) { out.push(f); continue; }
      if (r.x > f.x) out.push({ x: f.x, y: f.y, w: r.x - f.x, h: f.h });
      if (r.x + r.w < f.x + f.w) out.push({ x: r.x + r.w, y: f.y, w: f.x + f.w - r.x - r.w, h: f.h });
      if (r.y > f.y) out.push({ x: f.x, y: f.y, w: f.w, h: r.y - f.y });
      if (r.y + r.h < f.y + f.h) out.push({ x: f.x, y: r.y + r.h, w: f.w, h: f.y + f.h - r.y - r.h });
    }
    // remove retângulos contidos em outros
    bin.free = out.filter((a, i) => !out.some((b, j) => j !== i &&
      a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h && (j < i || a.w !== b.w || a.h !== b.h || a.x !== b.x || a.y !== b.y)));
    bin.used.push(r);
  }

  function layout() {
    const gap = state.gap;
    const W = usableW() + gap, H = usableH() + gap;
    const pieces = [];
    state.items.forEach(it => { for (let k = 0; k < it.qty; k++) pieces.push(it); });
    pieces.sort((a, b) => Math.max(b.wCm, b.hCm) - Math.max(a.wCm, a.hCm) || b.wCm * b.hCm - a.wCm * a.hCm);

    const bins = [];
    const skipped = new Set();
    for (const it of pieces) {
      const w = it.wCm + gap, h = it.hCm + gap;
      let done = false;
      for (const bin of bins) {
        const p = findPos(bin, w, h, state.rotate);
        if (p) { place(bin, { ...p, it }); done = true; break; }
      }
      if (!done) {
        const bin = newBin(W, H);
        const p = findPos(bin, w, h, state.rotate);
        if (p) { place(bin, { ...p, it }); bins.push(bin); } else skipped.add(it.name);
      }
    }
    state.sheets = bins.map(b => {
      const maxY = b.used.reduce((m, r) => Math.max(m, r.y + r.h - gap), 0);
      const length = Math.ceil((maxY + 2 * C.margemCm) * 10) / 10;
      return {
        length,
        items: b.used.map(r => ({
          it: r.it, rot: r.rot,
          x: r.x + C.margemCm, y: r.y + C.margemCm,
          w: r.w - gap, h: r.h - gap          // caixa ocupada (já girada)
        }))
      };
    });
    renderSheets(skipped);
    renderSummary(pieces.length, skipped);
  }

  /* ---------- pré-visualização ---------- */
  function renderSheets() {
    const box = $('#sheets');
    if (!state.sheets.length) {
      box.innerHTML = '<div class="empty"><div class="big">🖼️</div><p>Adicione imagens para ver a montagem automática aqui.</p></div>';
      return;
    }
    const avail = Math.min(box.clientWidth - 40, 560);
    const s = Math.max(2, avail / cfg().largura) * state.zoom; // px por cm
    box.innerHTML = state.sheets.map((sh, i) => `
      <div class="sheet-wrap">
        <div class="sheet" style="width:${cfg().largura * s}px;height:${sh.length * s}px">
          ${sh.items.map(p => {
            const iw = (p.rot ? p.h : p.w) * s, ih = (p.rot ? p.w : p.h) * s;
            const cx = (p.x + p.w / 2) * s, cy = (p.y + p.h / 2) * s;
            return `<img src="${p.it.url}" alt="" style="width:${iw}px;height:${ih}px;left:${cx - iw / 2}px;top:${cy - ih / 2}px;${p.rot ? 'transform:rotate(90deg);' : ''}">`;
          }).join('')}
        </div>
        <small>Folha ${i + 1} · ${cfg().largura} × ${fmt(sh.length)} cm</small>
      </div>`).join('');
  }
  $('#zin').onclick = () => { state.zoom = Math.min(4, state.zoom * 1.25); renderSheets(); };
  $('#zout').onclick = () => { state.zoom = Math.max(.25, state.zoom / 1.25); renderSheets(); };
  window.addEventListener('resize', () => renderSheets());

  function totals() {
    const used = state.sheets.reduce((a, s) => a + s.length, 0);
    const t = cfg();
    const charged = used ? Math.max(t.minimoCm, Math.ceil(used / t.arredondarCm) * t.arredondarCm) : 0;
    return { used, charged, total: charged / 100 * t.precoMetro };
  }

  function renderSummary(count, skipped) {
    const t = cfg(), { used, charged, total } = totals();
    $('#s-tipo').textContent = t.nome;
    $('#s-larg').textContent = t.largura + ' cm';
    $('#s-qtd').textContent = count - [...state.items].filter(i => skipped.has(i.name)).reduce((a, i) => a + i.qty, 0);
    $('#s-comp').textContent = fmt(used) + ' cm' + (state.sheets.length > 1 ? ` (${state.sheets.length} folhas)` : '');
    $('#s-cobr').textContent = charged ? fmt(charged / 100, 2) + ' m' : '—';
    $('#s-total').textContent = brl(total);
    let warn = '';
    if (used && used < t.minimoCm) warn += `<div class="warn">Pedido mínimo de ${fmt(t.minimoCm / 100, 2)} m. Aproveite o espaço livre para adicionar mais estampas!</div>`;
    if (state.items.some(i => i.pxW / (i.wCm / 2.54) < 150)) warn += '<div class="warn">Algumas imagens estão com baixa resolução para o tamanho escolhido e podem sair pixeladas.</div>';
    if (skipped.size) warn += `<div class="warn">Não coube na folha: ${[...skipped].join(', ')}</div>`;
    $('#s-warn').innerHTML = warn;
    $('#finalizar').disabled = !state.sheets.length;
    $('#stage-title').textContent = state.sheets.length ? `Pré-visualização · ${t.nome}` : 'Pré-visualização da montagem';
  }

  /* =========================================================
     Exportação PNG (encoder próprio em faixas + pHYs 300 DPI)
     ========================================================= */
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bufs) { let c = 0xffffffff; for (const b of bufs) for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function chunk(type, data) {
    const len = new Uint8Array(4); new DataView(len.buffer).setUint32(0, data.length);
    const t = new TextEncoder().encode(type);
    const crc = new Uint8Array(4); new DataView(crc.buffer).setUint32(0, crc32([t, data]));
    return [len, t, data, crc];
  }

  async function renderSheetPNG(sheet, onProgress) {
    const dpi = C.dpi, pxPerCm = dpi / 2.54;
    const W = Math.round(cfg().largura * pxPerCm), H = Math.round(sheet.length * pxPerCm);
    const STRIP = 256;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = STRIP;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    const outParts = [];
    const reading = (async () => { const r = cs.readable.getReader(); for (;;) { const { done, value } = await r.read(); if (done) break; outParts.push(value); } })();

    const rowLen = W * 4 + 1;
    for (let y0 = 0; y0 < H; y0 += STRIP) {
      const sh = Math.min(STRIP, H - y0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, STRIP);
      ctx.setTransform(pxPerCm, 0, 0, pxPerCm, 0, -y0);
      const top = y0 / pxPerCm, bottom = (y0 + sh) / pxPerCm;
      for (const p of sheet.items) {
        if (p.y > bottom || p.y + p.h < top) continue;
        if (p.rot) {
          ctx.save();
          ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(p.it.img, -p.h / 2, -p.w / 2, p.h, p.w);
          ctx.restore();
        } else {
          ctx.drawImage(p.it.img, p.x, p.y, p.w, p.h);
        }
      }
      const px = ctx.getImageData(0, 0, W, sh).data;
      const raw = new Uint8Array(rowLen * sh);
      for (let r = 0; r < sh; r++) {
        const o = r * rowLen, s = r * W * 4;
        raw[o] = 1; // filtro "Sub"
        for (let i = 0; i < 4; i++) raw[o + 1 + i] = px[s + i];
        for (let i = 4; i < W * 4; i++) raw[o + 1 + i] = (px[s + i] - px[s + i - 4]) & 255;
      }
      await writer.write(raw);
      onProgress(Math.min(1, (y0 + sh) / H));
      await new Promise(r => setTimeout(r, 0));
    }
    await writer.close();
    await reading;

    const ihdr = new Uint8Array(13); const dv = new DataView(ihdr.buffer);
    dv.setUint32(0, W); dv.setUint32(4, H); ihdr.set([8, 6, 0, 0, 0], 8);
    const phys = new Uint8Array(9); const pv = new DataView(phys.buffer);
    const ppm = Math.round(dpi / 0.0254); pv.setUint32(0, ppm); pv.setUint32(4, ppm); phys[8] = 1;
    const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), ...chunk('IHDR', ihdr), ...chunk('pHYs', phys)];
    // agrupa a saída comprimida em IDATs de até ~1 MB
    let buf = [], size = 0;
    const flush = () => { if (!size) return; const d = new Uint8Array(size); let o = 0; for (const b of buf) { d.set(b, o); o += b.length; } parts.push(...chunk('IDAT', d)); buf = []; size = 0; };
    for (const p of outParts) { buf.push(p); size += p.length; if (size > 1 << 20) flush(); }
    flush();
    parts.push(...chunk('IEND', new Uint8Array(0)));
    return new Blob(parts, { type: 'image/png' });
  }

  /* ---------- pedido / modal ---------- */
  const modal = $('#modal');
  const show = id => ['#step-form', '#step-gen', '#step-done'].forEach(s => $(s).classList.toggle('hidden', s !== id));
  $('#finalizar').onclick = () => { show('#step-form'); modal.classList.add('open'); setTimeout(() => $('#f-nome').focus(), 50); };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.hasAttribute('data-close')) modal.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#step-gen').offsetParent) modal.classList.remove('open'); });

  function pedidoTexto(nome, cidade, obs, arquivos) {
    const t = cfg(), { used, charged, total } = totals();
    const linhas = state.items.map(i => `• ${i.qty}x ${i.name} — ${fmt(i.wCm)} × ${fmt(i.hCm)} cm`).join('\n');
    return `Olá, M3 DTF PRINT! Montei meu DTF pelo site 👇\n\n` +
      `*Pedido — ${t.nome}*\n` +
      `Cliente: ${nome}${cidade ? '\nCidade: ' + cidade : ''}\n\n` +
      `*Estampas:*\n${linhas}\n\n` +
      `Filme: ${t.largura} cm × ${fmt(used)} cm (${state.sheets.length} folha${state.sheets.length > 1 ? 's' : ''})\n` +
      `Cobrado: ${fmt(charged / 100, 2)} m\n` +
      `*Total estimado: ${brl(total)}* (sem frete)\n\n` +
      `Arquivo${arquivos.length > 1 ? 's' : ''} PNG 300 DPI: ${arquivos.join(', ')}` +
      (obs ? `\n\nObs.: ${obs}` : '');
  }

  $('#gerar').onclick = async () => {
    const nome = $('#f-nome').value.trim();
    if (!nome) { $('#f-nome').focus(); $('#f-nome').style.borderColor = 'var(--m)'; return; }
    if (!('CompressionStream' in window)) { alert('Seu navegador é antigo para gerar o arquivo. Atualize o navegador ou use o Chrome.'); return; }
    const cidade = $('#f-cidade').value.trim(), obs = $('#f-obs').value.trim();
    show('#step-gen');
    state.files.forEach(f => URL.revokeObjectURL(f.url));
    state.files = [];
    const slug = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'cliente';
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      for (let i = 0; i < state.sheets.length; i++) {
        const sh = state.sheets[i];
        $('#gen-txt').textContent = `Montando folha ${i + 1} de ${state.sheets.length} (${cfg().largura} × ${fmt(sh.length)} cm)…`;
        const blob = await renderSheetPNG(sh, p => { $('#gen-bar').style.width = ((i + p) / state.sheets.length * 100) + '%'; });
        const name = `M3-${state.tipo === 'uv' ? 'DTF-UV' : 'DTF'}-${slug}-${stamp}-folha${i + 1}-${cfg().largura}x${Math.round(sh.length)}cm.png`;
        state.files.push({ name, blob, url: URL.createObjectURL(blob) });
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o arquivo neste aparelho (memória insuficiente). Tente no computador ou com menos imagens por pedido.');
      show('#step-form');
      return;
    }

    const names = state.files.map(f => f.name);
    const texto = pedidoTexto(nome, cidade, obs, names);
    $('#files').innerHTML = state.files.map(f => `<a href="${f.url}" download="${f.name}">📄 ${f.name} <span>${(f.blob.size / 1048576).toFixed(1)} MB · Baixar</span></a>`).join('');
    $('#wa-open').href = waLink(texto);

    const fileObjs = state.files.map(f => new File([f.blob], f.name, { type: 'image/png' }));
    const canShare = navigator.canShare && navigator.canShare({ files: fileObjs });
    const share = $('#share');
    share.classList.toggle('hidden', !canShare);
    share.onclick = async () => {
      try { await navigator.share({ files: fileObjs, title: 'Pedido DTF — M3', text: texto }); }
      catch (e) { if (e.name !== 'AbortError') alert('Não foi possível compartilhar. Baixe o arquivo e anexe no WhatsApp.'); }
    };

    // baixa automaticamente os arquivos para o cliente anexar
    state.files.forEach((f, i) => setTimeout(() => { const a = document.createElement('a'); a.href = f.url; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); }, i * 400));

    $('#howto').innerHTML = canShare
      ? '<strong>Celular:</strong> toque em “Enviar arquivo no WhatsApp”, escolha o WhatsApp e a conversa da M3 (' + C.whatsappExibicao + '). Para não perder qualidade, se o WhatsApp oferecer, envie como <b>documento</b>. Depois toque em “Abrir WhatsApp com o pedido” para mandar o resumo.'
      : '<strong>Como enviar:</strong> o arquivo já foi baixado. Clique em “Abrir WhatsApp com o pedido”, envie a mensagem e anexe o PNG baixado como <b>documento</b> (📎 → Documento) para manter a qualidade de impressão.';
    show('#step-done');
  };

  renderItems(); layout();
})();
