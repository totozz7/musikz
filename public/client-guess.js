// PLAYZUP — client « Guess Party ». Utilise app.js : $, $$, esc, avatarHTML, nameHTML, state, pid, gAct, sfx, burst, toast…
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, img = null, imgSrc = null, raf = null, offset = 0, roundKey = null, lastStage = null, feedSeen = 0;
  const small = document.createElement('canvas');
  const LEVEL = { 1: '😎 Facile', 2: '🤔 Moyen', 3: '💀 Très dur' };

  function build() {
    $('#v-guess').innerHTML = `
      <div class="gp-room">
        <div class="gp-bg"><i></i><i></i><i></i><i></i><i></i></div>
        <header class="gp-top">
          <div class="gp-logo">GUESS<b>PARTY</b></div>
          <div class="gp-meta"><span id="gp-theme" class="gp-chip"></span><span id="gp-level" class="gp-chip"></span><span id="gp-count" class="gp-chip big"></span></div>
        </header>
        <div class="gp-main">
          <div class="gp-left">
            <div class="gp-polaroid" id="gp-pol">
              <span class="gp-tape t1"></span><span class="gp-tape t2"></span>
              <div class="gp-frame" id="gp-frame">
                <canvas id="gp-cv" width="640" height="640"></canvas>
                <div class="gp-intro" id="gp-intro"></div>
                <div class="gp-load" id="gp-load"><div class="gp-spin"></div><b>Chargement des images…</b></div>
                <svg class="gp-ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle id="gp-ringc" cx="22" cy="22" r="19"/></svg>
                <span class="gp-sec" id="gp-sec"></span>
              </div>
              <div class="gp-caption" id="gp-ask"></div>
              <div class="gp-reveal" id="gp-reveal"></div>
            </div>
            <div class="gp-inputbox" id="gp-inputbox">
              <div class="gp-parts" id="gp-parts"></div>
              <form class="gp-form" id="gp-form" autocomplete="off"><input id="gp-in" class="input" maxlength="80" placeholder="Ta réponse…" autocomplete="off"><button class="btn btn-primary">Envoyer</button></form>
              <div class="gp-fb" id="gp-fb"></div>
            </div>
          </div>
          <aside class="gp-side">
            <div class="gp-board" id="gp-board"></div>
            <ul class="gp-feed" id="gp-feed"></ul>
            <button class="btn btn-ghost gp-skip hidden" id="gp-skip">⏭ Passer l'image</button>
          </aside>
        </div>
        <div id="gp-end"></div>
      </div>`;
    $('#gp-form').onsubmit = async (e) => {
      e.preventDefault();
      const t = $('#gp-in').value.trim(); if (!t) return;
      $('#gp-in').value = '';
      const r = await gAct('guess', t);
      fb(r);
    };
    $('#gp-skip').onclick = () => gAct('skip');
  }
  function fb(r) {
    const el = $('#gp-fb'); if (!r) return;
    el.className = 'gp-fb show ' + (r.verdict || '');
    el.innerHTML = r.verdict === 'ok' ? `✅ ${r.all ? 'Bravo, tout trouvé !' : 'Bien vu !'} <b>+${r.gain} pts</b>` : r.verdict === 'close' ? '🔥 Presque ! Vérifie l\'orthographe' : r.verdict === 'wait' ? '⏳ Attends que l\'image apparaisse…' : '❌ Non…';
    if (r.verdict === 'ok') { sfx('legend', .6); burst(r.all ? save.look.winFx : 'party', r.all ? 16 : 8); $('#gp-pol').classList.remove('win'); void $('#gp-pol').offsetWidth; $('#gp-pol').classList.add('win'); }
    else if (r.verdict === 'close') sfx('pop'); else if (r.verdict === 'no') { sfx('buzzer', .3); $('#gp-form').classList.remove('shake'); void $('#gp-form').offsetWidth; $('#gp-form').classList.add('shake'); }
    clearTimeout(fb.t); fb.t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function render(v) {
    const fresh = v.gameKey !== key;
    V = v; window.__lastV = v;
    if (fresh) { key = v.gameKey; build(); roundKey = null; lastStage = null; feedSeen = 0; }
    if (v.round) offset = v.round.now - Date.now();
    if (v.next) { const pre = new Image(); pre.referrerPolicy = 'no-referrer'; pre.src = v.next; }
    $('#gp-load').classList.toggle('hidden', v.stage !== 'loading');
    $('#gp-level').textContent = LEVEL[v.level];
    $('#gp-count').textContent = v.idx >= 0 ? `Image ${Math.min(v.idx + 1, v.total)} / ${v.total}` : `${v.total} images`;
    const r = v.round;
    if (r) {
      $('#gp-theme').textContent = `${r.theme.emoji} ${r.theme.name}`;
      $('#gp-ask').textContent = r.theme.ask;
      const rk = v.gameKey + ':' + v.idx;
      if (rk !== roundKey) { roundKey = rk; newRound(v); }
      drawParts(v);
    }
    $('#gp-inputbox').classList.toggle('done', !r || v.stage !== 'play' || r.parts.every(p => r.mine[p.k]));
    $('#gp-skip').classList.toggle('hidden', !(isHost() && v.stage === 'play'));
    drawBoard(v);
    if (v.stage === 'reveal' && lastStage !== 'reveal') showReveal(v);
    if (v.stage !== 'reveal') $('#gp-reveal').className = 'gp-reveal';
    if (v.stage === 'over') showEnd(v); else $('#gp-end').innerHTML = '';
    lastStage = v.stage;
  }

  function newRound(v) {
    const r = v.round;
    img = null; imgSrc = r.img;
    const im = new Image(); im.referrerPolicy = 'no-referrer'; im.decoding = 'async';
    im.onload = () => { if (imgSrc === r.img) img = im; };
    im.onerror = () => { if (imgSrc === r.img) img = 'err'; };
    im.src = r.img;
    $('#gp-fb').className = 'gp-fb'; $('#gp-in').value = '';
    $('#gp-pol').classList.remove('win', 'revealed');
    // intro : thème + compte à rebours
    const intro = $('#gp-intro');
    intro.innerHTML = `<div class="gp-theme-card"><span>${r.theme.emoji}</span><b>${esc(r.theme.name)}</b><small>Image ${v.idx + 1} / ${v.total}</small><em id="gp-cd">3</em></div>`;
    intro.className = 'gp-intro on';
    sfx('pop');
    cancelAnimationFrame(raf); loop();
    setTimeout(() => $('#gp-in')?.focus(), 2600);
  }

  // ── dessin de l'image avec l'effet du niveau ──
  const ease = (x) => 1 - Math.pow(1 - x, 2);
  function loop() {
    raf = requestAnimationFrame(loop);
    const v = V; if (!v?.round) return;
    const r = v.round, cv = $('#gp-cv'); if (!cv) return;
    const now = Date.now() + offset, t = Math.min(1, Math.max(0, (now - r.startAt) / r.dur));
    // compte à rebours
    const pre = r.startAt - now;
    const intro = $('#gp-intro');
    if (pre > 0) { const cd = $('#gp-cd'); const n = Math.ceil(pre / 800); if (cd && cd.textContent !== String(n)) { cd.textContent = n; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); sfx('tick', .8); } }
    else if (intro.classList.contains('on')) { intro.className = 'gp-intro'; sfx('legend', .4); }
    // anneau de temps
    const ring = $('#gp-ringc'), sec = $('#gp-sec');
    if (v.stage === 'play' && pre <= 0) { ring.style.strokeDashoffset = String(119.4 * t); ring.classList.toggle('hot', t > .75); sec.textContent = Math.ceil((1 - t) * r.dur / 1000); }
    else { ring.style.strokeDashoffset = '0'; sec.textContent = ''; }
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    ctx.fillStyle = '#140a24'; ctx.fillRect(0, 0, W, H);
    if (!img) { drawWait(ctx, W, H, now); return; }
    if (img === 'err') { ctx.fillStyle = '#fff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Image indisponible 😕', W / 2, H / 2); return; }
    const reveal = v.stage === 'reveal' || v.stage === 'over';
    // place l'image « contain » sur fond flou
    const iw = img.naturalWidth || 600, ih = img.naturalHeight || 600, sc = Math.min(W / iw, H / ih);
    const dw = iw * sc, dh = ih * sc, dx = (W - dw) / 2, dy = (H - dh) / 2;
    if (pre > 0 && !reveal) { drawPix(ctx, img, 0, 0, iw, ih, dx, dy, dw, dh, 4); return; }
    if (reveal) {
      ctx.save(); ctx.filter = 'blur(24px) brightness(.5)'; ctx.drawImage(img, -40, -40, W + 80, H + 80); ctx.restore();
      ctx.drawImage(img, dx, dy, dw, dh); return;
    }
    if (v.level === 1) {
      const res = t >= .55 ? 0 : Math.round(10 * Math.pow(64, t / .55));
      res ? drawPix(ctx, img, 0, 0, iw, ih, dx, dy, dw, dh, res) : ctx.drawImage(img, dx, dy, dw, dh);
    } else if (v.level === 2) {
      const res = Math.round(6 * Math.pow(10, t)) + (t > .85 ? 30 : 0);
      drawPix(ctx, img, 0, 0, iw, ih, dx, dy, dw, dh, res);
    } else {
      // très dur : gros zoom sur un détail, noir et blanc, on dézoome lentement sans jamais tout montrer
      const z = 9 - 6.2 * ease(t), fx = r.fx.x / 100, fy = r.fx.y / 100;
      const sw = iw / z, sh = ih / z;
      const sx = Math.min(iw - sw, Math.max(0, fx * iw - sw / 2)), sy = Math.min(ih - sh, Math.max(0, fy * ih - sh / 2));
      ctx.save(); if (t < .7) ctx.filter = 'grayscale(1) contrast(1.15)';
      const s2 = Math.min(W / sw, H / sh), w2 = sw * s2, h2 = sh * s2;
      ctx.drawImage(img, sx, sy, sw, sh, (W - w2) / 2, (H - h2) / 2, w2, h2);
      ctx.restore();
    }
  }
  function drawPix(ctx, im, sx, sy, sw, sh, dx, dy, dw, dh, res) {
    const rw = Math.max(2, Math.round(res)), rh = Math.max(2, Math.round(res * dh / dw));
    small.width = rw; small.height = rh;
    const c2 = small.getContext('2d'); c2.imageSmoothingEnabled = true;
    c2.drawImage(im, sx, sy, sw, sh, 0, 0, rw, rh);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(small, 0, 0, rw, rh, dx, dy, dw, dh); ctx.restore();
  }
  function drawWait(ctx, W, H, now) {
    for (let i = 0; i < 6; i++) { const a = now / 400 + i; ctx.fillStyle = `hsla(${(i * 60 + now / 20) % 360},90%,60%,.5)`; ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * 60, H / 2 + Math.sin(a) * 60, 12, 0, 7); ctx.fill(); }
  }

  function drawParts(v) {
    const r = v.round, now = Date.now() + offset, t = (now - r.startAt) / r.dur;
    const showHint = v.stage === 'play' && ((v.level === 1 && t > .5) || (v.level === 2 && t > .7));
    $('#gp-parts').innerHTML = r.parts.map(p => {
      const ok = r.mine[p.k];
      return `<div class="gp-part ${ok ? 'ok' : ''}"><small>${p.label}</small><b>${ok ? '✅ trouvé' : showHint && p.hint ? esc(p.hint) : '❓'.repeat(1)}</b></div>`;
    }).join('');
    if (r.parts.length > 1) $('#gp-in').placeholder = 'Artiste ou album (un à la fois ou les deux)…';
    else $('#gp-in').placeholder = 'Ta réponse…';
    clearTimeout(drawParts.t);
    if (v.stage === 'play' && !showHint && v.level < 3) drawParts.t = setTimeout(() => V === v && drawParts(v), 1000);
  }

  function drawBoard(v) {
    const n = v.round?.parts.length || 1;
    const rows = Object.entries(v.scores).sort((a, b) => b[1] - a[1]);
    $('#gp-board').innerHTML = `<h4>🏆 Classement</h4>` + rows.map(([id, pts], i) => {
      const p = P(id), f = v.players.find(x => x.pid === id)?.n || 0;
      return `<div class="gp-row ${id === pid ? 'me' : ''} ${f >= n && v.stage === 'play' ? 'got' : ''}"><span class="gp-rk">${i + 1}</span>${p ? avatarHTML(p, 30) : ''}<span class="gp-nm">${p ? nameHTML(p) : '?'}</span><span class="gp-ok">${v.stage === 'play' ? (f >= n ? '✅' : f ? '½' : '') : ''}</span><b>${pts}</b></div>`;
    }).join('');
    const feed = v.feed || [];
    $('#gp-feed').innerHTML = feed.map(f => `<li>${P(f.pid) ? nameHTML(P(f.pid)) : '?'} ${esc(f.txt)}</li>`).join('');
    if (feed[0] && feed[0].at !== feedSeen) { if (feedSeen && feed[0].pid !== pid) sfx('pop', .5); feedSeen = feed[0].at; }
  }

  function showReveal(v) {
    const r = v.round;
    $('#gp-pol').classList.add('revealed');
    const finders = (v.players || []).filter(x => x.n > 0).map(x => P(x.pid)).filter(Boolean);
    $('#gp-reveal').innerHTML = `<div class="gp-ans"><small>C'était…</small><b>${esc(r.answer)}</b>
      <div class="gp-finders">${finders.length ? finders.map(p => `<span>${avatarHTML(p, 26)} ${esc(p.name)}</span>`).join('') : '<em>Personne n\'a trouvé 😱</em>'}</div></div>`;
    $('#gp-reveal').className = 'gp-reveal on';
    sfx(finders.length ? 'legend' : 'buzzer', .6);
  }

  function showEnd(v) {
    if ($('#gp-end').innerHTML) return;
    const rk = v.ranking || [];
    const w = P(rk[0]?.pid);
    $('#gp-end').innerHTML = `<div class="gp-endcard">
      <h2>🏁 Fin de la Guess Party !</h2>
      <div class="gp-podium">${rk.slice(0, 3).map((x, i) => { const p = P(x.pid); return `<div class="pod p${i + 1}">${p ? avatarHTML(p, i ? 56 : 76) : ''}<b>${p ? esc(p.name) : '?'}</b><span>${x.pts} pts</span><i>${i + 1}</i></div>`; }).join('')}</div>
      ${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙 · ${v.coins.good} bonne${v.coins.good > 1 ? 's' : ''} réponse${v.coins.good > 1 ? 's' : ''}</p>` : ''}
      <h4>🖼️ Les images de la partie</h4>
      <div class="gp-gallery">${(v.results || []).map(r => `<figure class="${r.finders.includes(pid) ? 'ok' : ''}"><img src="${esc(r.img)}" referrerpolicy="no-referrer" loading="lazy" alt=""><figcaption>${esc(r.show)}</figcaption></figure>`).join('')}</div>
      <div class="end-actions">${isHost() ? '<button class="btn btn-primary" id="gp-replay">🔁 Rejouer</button><button class="btn btn-yellow" id="gp-lobby">🏠 Salon</button>' : '<p class="muted">L\'hôte peut relancer une partie.</p>'}<button class="btn btn-shop" id="gp-wheel">🎡 Roue de la chance</button></div></div>`;
    $('#gp-replay')?.addEventListener('click', () => gAct('replay'));
    $('#gp-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $('#gp-wheel')?.addEventListener('click', () => window.WHEEL?.open());
    if (rk[0]?.pid === pid && rk.length > 1) { burst(save.look.winFx, 34); sfx('legend'); }
    setTimeout(() => $('#gp-end .gp-endcard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    cancelAnimationFrame(raf);
  }

  window.GUESS = { render };
})();
