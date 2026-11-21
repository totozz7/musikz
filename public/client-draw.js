// PLAYZUP — client « DRAW TIME » (dessine et fais deviner). Utilise app.js : $, $$, esc, avatarHTML, nameHTML, state, pid, gAct, sfx, burst, toast, socket…
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const W = 800, H = 600;
  const COLORS = ['#000000', '#4a4a4a', '#9a9a9a', '#ffffff', '#e8152b', '#ff6a00', '#ffc21a', '#fff04d', '#22c55e', '#0f7a3c', '#00c8d4', '#2f8bff',
    '#1a3fa8', '#7c3aed', '#c13cff', '#ff4fa3', '#ffb3c7', '#8b4513', '#d2a06d', '#ffd9b3'];
  const SIZES = [4, 10, 20, 38];
  const KIND = { classic: '✏️', fun: '😂', spicy: '🌶️' };
  let V = null, key = null, turnKey = null, offset = 0, tick = null;
  let strokes = [], tool = 'pen', color = '#000000', size = 10, drawing = null, buf = [], flushT = null, lastStage = null, lastChat = 0;

  function build() {
    $('#v-draw').innerHTML = `
      <div class="dt-room">
        <header class="dt-top">
          <div class="dt-logo">DRAW<span>✏️</span>TIME</div>
          <div class="dt-word" id="dt-word"></div>
          <div class="dt-info"><span class="dt-round" id="dt-round"></span><div class="dt-clock" id="dt-clock"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle id="dt-clockc" cx="22" cy="22" r="19"/></svg><b id="dt-sec"></b></div></div>
        </header>
        <div class="dt-main">
          <div class="dt-center">
            <div class="dt-board" id="dt-board">
              <canvas id="dt-cv" width="${W}" height="${H}"></canvas>
              <div class="dt-over" id="dt-over"></div>
            </div>
            <div class="dt-tools hidden" id="dt-tools">
              <div class="dt-colors">${COLORS.map(c => `<button class="dt-col" data-c="${c}" style="--c:${c}"></button>`).join('')}</div>
              <div class="dt-sizes">${SIZES.map(s => `<button class="dt-size" data-s="${s}"><i style="--s:${Math.max(4, s * .7)}px"></i></button>`).join('')}</div>
              <div class="dt-acts">
                <button class="dt-tool" data-t="pen" title="Pinceau">🖌️</button><button class="dt-tool" data-t="eraser" title="Gomme">🧽</button><button class="dt-tool" data-t="fill" title="Pot de peinture">🪣</button>
                <button class="dt-tool" id="dt-undo" title="Annuler">↩️</button><button class="dt-tool" id="dt-clear" title="Tout effacer">🗑️</button>
              </div>
            </div>
          </div>
          <aside class="dt-players" id="dt-players"></aside>
          <aside class="dt-chatbox">
            <ul class="dt-chat" id="dt-chat"></ul>
            <form class="dt-form" id="dt-form" autocomplete="off"><input class="input" id="dt-in" maxlength="80" placeholder="Devine ici…" autocomplete="off"><button class="btn btn-primary">➤</button></form>
          </aside>
        </div>
        <div id="dt-end"></div>
      </div>`;
    const cv = $('#dt-cv');
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    cv.addEventListener('pointerleave', () => { if (drawing) up(); });
    $$('.dt-col').forEach(b => b.onclick = () => { color = b.dataset.c; if (tool === 'eraser') tool = 'pen'; tools(); });
    $$('.dt-size').forEach(b => b.onclick = () => { size = +b.dataset.s; tools(); });
    $$('.dt-tool[data-t]').forEach(b => b.onclick = () => { tool = b.dataset.t; tools(); });
    $('#dt-undo').onclick = () => { if (!isDrawer()) return; strokes.pop(); redraw(); socket.emit('gdraw', { op: 'undo' }); };
    $('#dt-clear').onclick = () => { if (!isDrawer()) return; strokes = []; redraw(); socket.emit('gdraw', { op: 'clear' }); };
    $('#dt-form').onsubmit = async (e) => {
      e.preventDefault();
      const t = $('#dt-in').value.trim(); if (!t) return;
      $('#dt-in').value = '';
      const r = await gAct('guess', t);
      if (r?.verdict === 'ok') { sfx('legend'); burst('party', 10); flash('ok', `+${r.pts}`); }
      else if (r?.verdict === 'close') { toast('🔥 Presque ! Tu y es presque…'); sfx('pop'); }
      else if (r?.verdict === 'leak') toast('🤫 Ne donne pas la réponse !', 'error');
    };
    tools();
    redraw();
  }
  const isDrawer = () => V && V.drawer === pid && V.stage === 'draw';
  function tools() {
    $$('.dt-col').forEach(b => b.classList.toggle('on', b.dataset.c === color && tool !== 'eraser'));
    $$('.dt-size').forEach(b => b.classList.toggle('on', +b.dataset.s === size));
    $$('.dt-tool[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === tool));
    const cv = $('#dt-cv'); if (cv) cv.dataset.tool = tool;
  }

  // ── dessin ──
  const ctx = () => $('#dt-cv').getContext('2d');
  const toPx = (x, y) => [x * W / 1000, y * H / 1000];
  function pos(e) { const r = $('#dt-cv').getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 1000), Math.round((e.clientY - r.top) / r.height * 1000)]; }
  function down(e) {
    if (!isDrawer()) return;
    e.preventDefault();
    $('#dt-cv').setPointerCapture?.(e.pointerId);
    const [x, y] = pos(e);
    if (tool === 'fill') { const s = { fill: true, c: color, x, y }; strokes.push(s); fill(s); socket.emit('gdraw', { op: 'fill', c: color, x, y }); sfx('pop', .4); return; }
    const c = tool === 'eraser' ? '#ffffff' : color, w = tool === 'eraser' ? Math.max(20, size * 1.6) : size;
    drawing = { id: Math.floor(Math.random() * 1e9), c, w, p: [x, y] };
    strokes.push(drawing);
    dot(drawing, x, y);
    socket.emit('gdraw', { op: 'begin', id: drawing.id, c, w, x, y });
  }
  function move(e) {
    if (!drawing) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) {
      const [x, y] = pos(ev), p = drawing.p, lx = p[p.length - 2], ly = p[p.length - 1];
      if (Math.abs(x - lx) + Math.abs(y - ly) < 3) continue;
      p.push(x, y); seg(drawing, lx, ly, x, y); buf.push(x, y);
    }
    if (!flushT) flushT = setTimeout(flush, 33);
  }
  function flush() { flushT = null; if (buf.length && drawing) socket.emit('gdraw', { op: 'move', id: drawing.id, pts: buf }); buf = []; }
  function up() { if (!drawing) return; flush(); drawing = null; }
  function dot(s, x, y) { const c = ctx(), [px, py] = toPx(x, y); c.fillStyle = s.c; c.beginPath(); c.arc(px, py, s.w / 2, 0, 7); c.fill(); }
  function seg(s, x1, y1, x2, y2) {
    const c = ctx(), [a, b] = toPx(x1, y1), [d, f] = toPx(x2, y2);
    c.strokeStyle = s.c; c.lineWidth = s.w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(a, b); c.lineTo(d, f); c.stroke();
  }
  function paint(s) {
    if (s.fill) return fill(s);
    const p = s.p; dot(s, p[0], p[1]);
    if (p.length < 4) return;
    const c = ctx(); c.strokeStyle = s.c; c.lineWidth = s.w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); let [x0, y0] = toPx(p[0], p[1]); c.moveTo(x0, y0);
    for (let i = 2; i < p.length - 2; i += 2) { const [x1, y1] = toPx(p[i], p[i + 1]), [x2, y2] = toPx(p[i + 2], p[i + 3]); c.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2); }
    const [xl, yl] = toPx(p[p.length - 2], p[p.length - 1]); c.lineTo(xl, yl); c.stroke();
  }
  function redraw() { const c = ctx(); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); strokes.forEach(paint); }
  // pot de peinture (remplissage par balayage, avec une petite tolérance)
  function fill(s) {
    const c = ctx(), [fx, fy] = toPx(s.x, s.y), x0 = Math.min(W - 1, Math.max(0, Math.round(fx))), y0 = Math.min(H - 1, Math.max(0, Math.round(fy)));
    const img = c.getImageData(0, 0, W, H), d = img.data, at = (x, y) => (y * W + x) * 4;
    const i0 = at(x0, y0), tr = d[i0], tg = d[i0 + 1], tb = d[i0 + 2];
    const nr = parseInt(s.c.slice(1, 3), 16), ng = parseInt(s.c.slice(3, 5), 16), nb = parseInt(s.c.slice(5, 7), 16);
    if (Math.abs(tr - nr) + Math.abs(tg - ng) + Math.abs(tb - nb) < 10) return;
    const same = (i) => Math.abs(d[i] - tr) + Math.abs(d[i + 1] - tg) + Math.abs(d[i + 2] - tb) < 90;
    const stack = [[x0, y0]];
    while (stack.length) {
      let [x, y] = stack.pop();
      while (y >= 0 && same(at(x, y))) y--;
      y++; let l = false, r = false;
      while (y < H && same(at(x, y))) {
        const i = at(x, y); d[i] = nr; d[i + 1] = ng; d[i + 2] = nb; d[i + 3] = 255;
        if (x > 0) { if (same(at(x - 1, y))) { if (!l) { stack.push([x - 1, y]); l = true; } } else l = false; }
        if (x < W - 1) { if (same(at(x + 1, y))) { if (!r) { stack.push([x + 1, y]); r = true; } } else r = false; }
        y++;
      }
    }
    c.putImageData(img, 0, 0);
  }
  // traits reçus du dessinateur
  socket.on('gdraw', (d) => {
    if (!V || V.game !== 'draw' || !$('#dt-cv')) return;
    if (d.op === 'begin') { const s = { id: d.id, c: d.c, w: d.w, p: [d.x, d.y] }; strokes.push(s); dot(s, d.x, d.y); }
    else if (d.op === 'move') {
      const s = [...strokes].reverse().find(x => x.id === d.id); if (!s) return;
      for (let i = 0; i < d.pts.length; i += 2) { const p = s.p; seg(s, p[p.length - 2], p[p.length - 1], d.pts[i], d.pts[i + 1]); p.push(d.pts[i], d.pts[i + 1]); }
    }
    else if (d.op === 'fill') { const s = { fill: true, c: d.c, x: d.x, y: d.y }; strokes.push(s); fill(s); }
    else if (d.op === 'undo') { strokes.pop(); redraw(); }
    else if (d.op === 'clear') { strokes = []; redraw(); }
  });

  // ── rendu de l'état ──
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v; window.__dv = v; offset = v.now - Date.now();
    if (fresh) { key = v.gameKey; build(); turnKey = null; lastStage = null; lastChat = 0; }
    const tk = v.gameKey + ':' + v.round + ':' + v.drawer;
    if (tk !== turnKey) { turnKey = tk; strokes = []; redraw(); }
    if (v.stage === 'draw' && (fresh || lastStage === null) && !isDrawer()) gAct('strokes').then(r => { if (r?.strokes && V?.gameKey === v.gameKey) { strokes = r.strokes; redraw(); } });
    $('#dt-tools').classList.toggle('hidden', !isDrawer());
    $('#dt-cv').classList.toggle('can', isDrawer());
    $('#dt-round').textContent = `Manche ${Math.min(v.round, v.rounds)} / ${v.rounds}`;
    drawWord(v); drawPlayers(v); drawChat(v); drawOver(v);
    clearInterval(tick); tick = setInterval(clock, 250); clock();
    $('#dt-in').placeholder = v.drawer === pid && v.stage === 'draw' ? 'Discute (sans donner le mot !)…' : v.found.includes(pid) ? 'Bien joué ! Discute avec ceux qui ont trouvé…' : 'Devine ici…';
    if (v.stage === 'over') showEnd(v); else $('#dt-end').innerHTML = '';
    if (v.stage === 'draw' && lastStage !== 'draw') { sfx('legend', .4); if (!isDrawer()) setTimeout(() => $('#dt-in')?.focus(), 200); }
    lastStage = v.stage;
  }
  function drawWord(v) {
    const el = $('#dt-word');
    if (v.stage === 'choose') { el.innerHTML = '<span class="dt-wait">✏️ choix du mot…</span>'; return; }
    if (v.stage === 'over') { el.innerHTML = ''; return; }
    const shown = v.word || v.mask;
    let i = 0;
    const words = shown.split(' ').map(wd => `<span class="dt-wd">${[...wd].map(c => { i++; return /[-'’]/.test(c) ? `<span class="pn">${esc(c)}</span>` : `<span class="${c === '_' ? 'q' : 'l'}" style="--i:${i}">${c === '_' ? '' : esc(c.toUpperCase())}</span>`; }).join('')}</span>`);
    el.innerHTML = `<div class="dt-tiles ${v.word ? 'known' : ''}">${words.join('')}</div>
      <small>${v.word && v.drawer === pid && v.stage === 'draw' ? `${KIND[v.kind] || ''} À toi de dessiner !` : v.word && v.stage === 'draw' ? '✅ Trouvé !' : `${[...shown].filter(c => /[^\s'’-]/.test(c)).length} lettres`}</small>`;
  }
  function clock() {
    const v = V; if (!v) return;
    const now = Date.now() + offset;
    let left = 0, tot = 1;
    if (v.stage === 'draw') { tot = v.time; left = Math.max(0, v.startAt + v.time - now); }
    else if (v.stage === 'choose') { tot = 15000; left = Math.max(0, v.left - (Date.now() - (V._at || (V._at = Date.now())))); }
    const sec = Math.ceil(left / 1000);
    $('#dt-sec').textContent = v.stage === 'draw' || v.stage === 'choose' ? sec : '';
    const c = $('#dt-clockc'); c.style.strokeDashoffset = String(119.4 * (1 - left / tot));
    $('#dt-clock').classList.toggle('hot', v.stage === 'draw' && sec <= 10);
    if (v.stage === 'draw' && sec <= 10 && sec > 0 && clock.last !== sec) { clock.last = sec; sfx('tick', .6); }
  }
  function drawPlayers(v) {
    const ids = Object.keys(v.scores).sort((a, b) => v.scores[b] - v.scores[a]);
    $('#dt-players').innerHTML = ids.map((id, i) => {
      const p = P(id); if (!p) return '';
      const g = v.gains?.[id];
      return `<div class="dt-pl ${id === v.drawer ? 'drawer' : ''} ${v.found.includes(id) ? 'found' : ''} ${id === pid ? 'me' : ''}">
        <span class="dt-rk">#${i + 1}</span>${avatarHTML(p, 36)}<div class="dt-pn"><b>${esc(p.name)}</b><small>${v.scores[id]} pts</small></div>
        ${id === v.drawer ? '<span class="dt-pen">✏️</span>' : ''}${g && v.stage !== 'over' ? `<span class="dt-gain">+${g}</span>` : ''}</div>`;
    }).join('');
  }
  function drawChat(v) {
    const ul = $('#dt-chat');
    ul.innerHTML = v.chat.map(m => m.sys ? `<li class="sys ${m.good ? 'good' : ''}">${esc(m.txt)}</li>` : `<li class="${m.secret ? 'secret' : ''}"><b>${esc(m.name || '?')}</b> ${esc(m.txt)}</li>`).join('');
    ul.scrollTop = ul.scrollHeight;
    if (v.chat.length !== lastChat) { const m = v.chat[v.chat.length - 1]; if (lastChat && m?.good && m.pid !== pid) sfx('pop', .7); lastChat = v.chat.length; }
  }
  function drawOver(v) {
    const o = $('#dt-over'), dr = P(v.drawer);
    if (v.stage === 'choose') {
      o.className = 'dt-over on';
      o.innerHTML = v.choices ? `<div class="dt-choose"><h3>✏️ Choisis ton mot</h3><div class="dt-cards">${v.choices.map((c, i) => `<button class="dt-wcard k-${c.k}" data-i="${i}" style="--i:${i}"><em>${KIND[c.k]}</em><b>${esc(c.w)}</b></button>`).join('')}</div><small>15 s pour choisir…</small></div>`
        : `<div class="dt-waiting">${dr ? avatarHTML(dr, 80) : ''}<b>${esc(dr?.name || '?')}</b><span>choisit un mot<i>.</i><i>.</i><i>.</i></span></div>`;
      o.querySelectorAll('.dt-wcard').forEach(b => b.onclick = () => { gAct('choose', +b.dataset.i); sfx('pop'); });
      V._at = Date.now();
    } else if (v.stage === 'reveal' && v.last) {
      o.className = 'dt-over on reveal';
      const L = v.last, rows = Object.entries(L.gains).sort((a, b) => b[1] - a[1]);
      o.innerHTML = `<div class="dt-reveal"><small>${L.why === 'all' ? '🎉 Tout le monde a trouvé !' : L.why === 'time' ? '⏰ Temps écoulé !' : '⏭ Dessin passé'}</small><h3>Le mot était</h3><b class="dt-the">${esc(L.word)}</b>
        <div class="dt-gains">${rows.length ? rows.map(([id, g], i) => `<div style="--i:${i}">${P(id) ? avatarHTML(P(id), 26) : ''}<span>${esc(P(id)?.name || '?')}${id === L.drawer ? ' ✏️' : ''}</span><b>+${g}</b></div>`).join('') : '<em>Personne n\'a trouvé 😬</em>'}</div></div>`;
      if (lastStage !== 'reveal') sfx(L.n ? 'legend' : 'buzzer', .5);
    } else { o.className = 'dt-over'; o.innerHTML = ''; }
  }
  function flash(type, txt) {
    const b = $('#dt-board'), f = document.createElement('div');
    f.className = 'dt-flash ' + type; f.innerHTML = `<b>${txt}</b>`; b.appendChild(f); setTimeout(() => f.remove(), 1400);
  }
  function showEnd(v) {
    if ($('#dt-end').innerHTML) return;
    const rk = v.ranking || [];
    $('#dt-end').innerHTML = `<div class="dt-endcard"><h2>🏁 Fin de Draw Time !</h2>
      <div class="gp-podium">${rk.slice(0, 3).map((x, i) => { const p = P(x.pid); return `<div class="pod p${i + 1}">${p ? avatarHTML(p, i ? 56 : 76) : ''}<b>${esc(p?.name || '?')}</b><span>${x.pts} pts</span><i>${i + 1}</i></div>`; }).join('')}</div>
      ${rk.length > 3 ? `<div class="dt-rest">${rk.slice(3).map((x, i) => `<span>#${i + 4} ${esc(P(x.pid)?.name || '?')} — ${x.pts} pts</span>`).join('')}</div>` : ''}
      ${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}
      <div class="end-actions">${isHost() ? '<button class="btn btn-primary" id="dt-replay">🔁 Rejouer</button><button class="btn btn-yellow" id="dt-lobby">🏠 Salon</button>' : '<p class="muted">L\'hôte peut relancer une partie.</p>'}<button class="btn btn-shop" id="dt-wheel">🎡 Roue de la chance</button></div></div>`;
    $('#dt-replay')?.addEventListener('click', () => gAct('replay'));
    $('#dt-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $('#dt-wheel')?.addEventListener('click', () => window.WHEEL?.open());
    if (rk[0]?.pid) celebrateWinner(rk[0].pid);
    setTimeout(() => $('#dt-end .dt-endcard')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  }

  window.DRAW = { render };
})();
