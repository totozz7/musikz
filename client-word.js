// PLAYZUP — client Speed Word (mots fléchés). Utilise app.js : $, esc, avatarHTML, nameHTML, state, pid, gAct…
(function () {
  const P = (id) => state?.players.find(p => p.id === id) || { name: '?', avatar: '❔', color: '#999' };
  let V = null, gridId = null, cur = -1, dir = 'r', solved = new Set(), cellWords = {}, tickIv = null, prog = [], lastStage = '', countdownIv = null;
  const ARROW = { r: '▶', d: '▼' };

  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const bestKey = () => `mz_word_best_${V.level}_${V.hints ? 1 : 0}`;

  function render(v) {
    const fresh = v.gridId !== gridId;
    V = v;
    if (fresh) build(v);
    else updateMeta(v);
    if (v.stage === 'over' && lastStage !== 'over') showEnd(v);
    lastStage = v.stage;
  }

  // ───── construction de la grille ─────
  function build(v) {
    gridId = v.gridId; solved = new Set(v.my.solved); prog = v.progress; cur = -1; dir = 'r'; lastStage = '';
    cellWords = {};
    v.words.forEach((w, k) => w.cells.forEach(i => { (cellWords[i] ||= {})[w.dir] = k; }));
    const host = isHost();
    $('#v-word').innerHTML = `
      <div class="uc-head">
        <span class="pill big wd-pill">🔤 Speed Word</span><span class="pill">${esc(v.levelName)}</span>
        <span class="pill">${v.hints ? '💡 Avec indices' : '🚫 Sans indices'}</span>
        <span class="wd-clock" id="wd-clock">0:00</span>
        ${host ? `<button class="btn btn-ghost btn-sm" id="wd-giveup">🏳️ ${v.multi ? 'Arrêter' : 'Abandonner'}</button><button class="btn btn-ghost btn-sm" id="wd-stop">🏠 Salon</button>` : ''}
      </div>
      <div class="wd-cluebar" id="wd-cluebar"><span class="arr">✏️</span><span>Clique sur une case pour commencer</span></div>
      <div class="wd-main">
        <div class="wd-gridwrap">
          <div class="wd-grid" id="wd-grid" style="--w:${v.W};--h:${v.H}">${v.cells.map((c, i) => cellHTML(c, i, v)).join('')}</div>
          <div class="wd-count hidden" id="wd-count">3</div>
        </div>
        <aside class="wd-side">
          <div class="wd-race" id="wd-race"></div>
          ${v.hints ? `<button class="btn btn-yellow wd-hint" id="wd-hint">💡 Révéler une lettre <b id="wd-hl">${v.my.hintsLeft}</b></button><p class="muted small">Chaque lettre révélée coûte 2 🪙 à la fin. Les mots trouvés passent en vert.</p>`
            : '<p class="muted small">🚫 Sans indices : aucune aide, aucune validation avant la fin. Bonne chance !</p>'}
          <details class="wd-list" ${innerWidth > 900 ? 'open' : ''}><summary>📖 Toutes les définitions</summary>
            <div class="wd-cols">
              <div><h5>▶ Horizontal</h5>${v.words.map((w, k) => w.dir === 'r' ? `<button class="wd-def" data-k="${k}">${esc(w.text)} <small>(${w.len})</small></button>` : '').join('')}</div>
              <div><h5>▼ Vertical</h5>${v.words.map((w, k) => w.dir === 'd' ? `<button class="wd-def" data-k="${k}">${esc(w.text)} <small>(${w.len})</small></button>` : '').join('')}</div>
            </div>
          </details>
        </aside>
      </div>
      <div id="wd-end"></div>`;
    // lettres déjà tapées (reconnexion)
    for (const [i, ch] of Object.entries(v.my.letters)) setLetter(+i, ch);
    v.my.hinted.forEach(i => { const inp = inputAt(i); if (inp) { inp.readOnly = true; inp.parentNode.classList.add('hint'); } });
    paintSolved();
    renderRace();
    bind();
    // compte à rebours
    clearInterval(countdownIv);
    const startAt = Date.now() + v.startIn;
    if (v.startIn > 0 && v.stage === 'play') {
      $('#wd-count').classList.remove('hidden'); $('#wd-grid').classList.add('locked');
      countdownIv = setInterval(() => {
        const l = startAt - Date.now();
        if (l <= 0) { clearInterval(countdownIv); $('#wd-count')?.classList.add('hidden'); $('#wd-grid')?.classList.remove('locked'); sfx('legend'); selectWord(0); return; }
        $('#wd-count').textContent = Math.ceil(l / 1000);
      }, 100);
    } else if (v.stage === 'play') selectWord(firstUnsolved());
    clearInterval(tickIv);
    tickIv = setInterval(() => {
      const el = $('#wd-clock'); if (!el) return clearInterval(tickIv);
      el.textContent = V.stage === 'over' && V.duration != null ? fmt(V.duration) : fmt(Date.now() - startAt);
    }, 250);
    if (v.stage === 'over') showEnd(v);
  }

  function cellHTML(c, i, v) {
    if (c.t === 'x') return '<div class="wd-c x"></div>';
    if (c.t === 'c') return `<div class="wd-c c n${c.clues.length}" data-i="${i}">${c.clues.map(cl => `<div class="cl" data-w="${cl.w}"><span>${esc(cl.text)}</span><b class="ar ${cl.dir}">${ARROW[cl.dir]}</b></div>`).join('')}</div>`;
    return `<div class="wd-c l" data-i="${i}"><input maxlength="2" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" data-i="${i}"></div>`;
  }
  const inputAt = (i) => $(`#wd-grid input[data-i="${i}"]`);
  function setLetter(i, ch) { const inp = inputAt(i); if (inp) inp.value = ch || ''; }

  // ───── sélection & navigation ─────
  function wordOf(i, d) { return cellWords[i]?.[d]; }
  function selectWord(k, at = null) {
    if (V.stage !== 'play' || k == null || !V.words[k]) return;
    const w = V.words[k]; dir = w.dir;
    cur = at != null ? at : (w.cells.find(i => !inputAt(i)?.value) ?? w.cells[0]);
    highlight();
  }
  function highlight() {
    $$('#wd-grid .wd-c').forEach(e => e.classList.remove('hl', 'cur', 'hlclue'));
    const k = wordOf(cur, dir) ?? wordOf(cur, dir === 'r' ? 'd' : 'r');
    if (k == null) return;
    const w = V.words[k]; dir = w.dir;
    w.cells.forEach(i => $(`#wd-grid .wd-c[data-i="${i}"]`)?.classList.add('hl'));
    $(`#wd-grid .wd-c[data-i="${w.clue}"]`)?.classList.add('hlclue');
    $(`#wd-grid .wd-c[data-i="${cur}"]`)?.classList.add('cur');
    $('#wd-cluebar').innerHTML = `<span class="arr">${ARROW[w.dir]}</span><span>${esc(w.text)}</span><small>${w.len} lettres</small>${solved.has(k) ? '<em>✅</em>' : ''}`;
    $$('#v-word .wd-def').forEach(b => b.classList.toggle('on', +b.dataset.k === k));
    const inp = inputAt(cur);
    if (inp && document.activeElement !== inp) inp.focus({ preventScroll: true });
  }
  function move(step) {
    const k = wordOf(cur, dir); if (k == null) return;
    const cells = V.words[k].cells, pos = cells.indexOf(cur) + step;
    if (pos >= 0 && pos < cells.length) { cur = cells[pos]; highlight(); }
    else if (step > 0) { // fin du mot → mot suivant non résolu
      const next = nextUnsolved(k); if (next != null) selectWord(next);
    }
  }
  function firstUnsolved() { const k = V.words.findIndex((w, j) => !solved.has(j) && w.cells.some(i => !inputAt(i)?.value)); return k >= 0 ? k : 0; }
  function nextUnsolved(k) {
    for (let s = 1; s <= V.words.length; s++) {
      const j = (k + s) % V.words.length;
      if (!solved.has(j) && V.words[j].cells.some(i => !inputAt(i)?.value)) return j;
    }
    return null;
  }
  function arrowMove(dr, dc) {
    let r = Math.floor(cur / V.W), c = cur % V.W;
    for (let s = 0; s < Math.max(V.W, V.H); s++) {
      r += dr; c += dc;
      if (r < 0 || c < 0 || r >= V.H || c >= V.W) return;
      const i = r * V.W + c;
      if (V.cells[i].t === 'l') { cur = i; dir = dc ? 'r' : 'd'; if (wordOf(i, dir) == null) dir = dir === 'r' ? 'd' : 'r'; highlight(); return; }
    }
  }

  async function type(i, ch) {
    const inp = inputAt(i); if (!inp || inp.readOnly) return;
    inp.value = ch;
    inp.parentNode.classList.remove('bad');
    const res = await gAct('cell', { i, ch });
    if (!res) return;
    if (res.solved) { const before = solved.size; solved = new Set(res.solved); paintSolved(); if (solved.size > before) sfx('pop'); }
    if (res.full && !V.hints) toast('🤔 Grille pleine… mais il reste des erreurs !', 'error');
  }
  function paintSolved() {
    $$('#wd-grid .wd-c.l').forEach(e => e.classList.remove('ok'));
    solved.forEach(k => V.words[k].cells.forEach(i => $(`#wd-grid .wd-c[data-i="${i}"]`)?.classList.add('ok')));
    $$('#wd-grid .cl').forEach(e => e.classList.toggle('done', solved.has(+e.dataset.w)));
    $$('#v-word .wd-def').forEach(b => b.classList.toggle('done', solved.has(+b.dataset.k)));
  }

  function bind() {
    const grid = $('#wd-grid');
    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('.wd-c'); if (!cell || V.stage !== 'play') return;
      const i = +cell.dataset.i;
      if (cell.classList.contains('c')) {
        const cls = [...cell.querySelectorAll('.cl')].map(x => +x.dataset.w);
        const k = cls.length > 1 && cls[0] === wordOf(cur, dir) ? cls[1] : cls[0];
        return selectWord(k);
      }
      if (cell.classList.contains('l')) {
        if (i === cur && cellWords[i]?.r != null && cellWords[i]?.d != null) dir = dir === 'r' ? 'd' : 'r';
        else if (wordOf(i, dir) == null) dir = dir === 'r' ? 'd' : 'r';
        cur = i; highlight();
      }
    });
    grid.addEventListener('focusin', (e) => { const i = +e.target.dataset.i; if (!isNaN(i) && i !== cur) { cur = i; if (wordOf(i, dir) == null) dir = dir === 'r' ? 'd' : 'r'; highlight(); } });
    grid.addEventListener('keydown', (e) => {
      if (!e.target.matches('input') || V.stage !== 'play') return;
      const i = +e.target.dataset.i;
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (e.target.value && !e.target.readOnly) type(i, '');
        else { move(-1); if (inputAt(cur) && !inputAt(cur).readOnly && inputAt(cur).value) type(cur, ''); }
      } else if (e.key === 'ArrowRight') { e.preventDefault(); arrowMove(0, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); arrowMove(0, -1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); arrowMove(1, 0); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); arrowMove(-1, 0); }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); const n = nextUnsolved(wordOf(cur, dir) ?? 0); if (n != null) selectWord(n); }
      else if (e.key === ' ') { e.preventDefault(); if (cellWords[i]?.r != null && cellWords[i]?.d != null) { dir = dir === 'r' ? 'd' : 'r'; highlight(); } }
    });
    // saisie (fonctionne aussi avec les claviers de téléphone)
    grid.addEventListener('input', (e) => {
      if (!e.target.matches('input')) return;
      const i = +e.target.dataset.i;
      const ch = (e.target.value || '').toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '').slice(-1);
      if (!ch) { e.target.value = ''; return; }
      if (e.target.readOnly) return;
      type(i, ch); move(1);
    });
    $$('#v-word .wd-def').forEach(b => b.addEventListener('click', () => selectWord(+b.dataset.k)));
    $('#wd-hint')?.addEventListener('click', async () => {
      const res = await gAct('hint', { i: cur });
      if (!res || res.error || res.ch == null) return;
      setLetter(res.i, res.ch);
      const inp = inputAt(res.i); if (inp) { inp.readOnly = true; inp.parentNode.classList.add('hint'); }
      if ($('#wd-hl')) $('#wd-hl').textContent = res.hintsLeft ?? 0;
      if (res.solved) { solved = new Set(res.solved); paintSolved(); }
      sfx('pop');
    });
    $('#wd-giveup')?.addEventListener('click', () => gAct('giveup'));
    $('#wd-stop')?.addEventListener('click', () => socket.emit('stop'));
  }

  // ───── course : progression des joueurs ─────
  function renderRace() {
    const el = $('#wd-race'); if (!el) return;
    const rows = [...prog].sort((a, b) => b.filled - a.filled);
    el.innerHTML = `<h4>${V.multi ? '🏁 La course' : '⏱️ Ta grille'}</h4>` + rows.map(r => {
      const p = P(r.pid);
      return `<div class="wd-runner ${r.pid === pid ? 'me' : ''}">${avatarHTML(p, 30)}<div class="bar-wrap"><span>${nameHTML(p)}</span><div class="bar"><i style="width:${r.filled}%"></i></div></div><b>${r.filled}%</b></div>`;
    }).join('') + (!V.multi ? bestHTML() : '');
  }
  function bestHTML() {
    let b = null; try { b = +localStorage.getItem(bestKey()) || null; } catch {}
    return `<p class="muted small">🏆 Record ${esc(V.levelName)}${V.hints ? '' : ' sans indices'} : <b>${b ? fmt(b) : '—'}</b></p>`;
  }
  socket.on('w:prog', (p) => { prog = p; if (V && $('#wd-race')) renderRace(); });

  function updateMeta(v) { prog = v.progress; renderRace(); }

  // ───── fin de partie ─────
  function showEnd(v) {
    clearInterval(countdownIv);
    $('#wd-grid')?.classList.add('locked');
    // corrections : lettres justes / fausses / manquantes
    if (v.sol) for (const [i, ch] of Object.entries(v.sol)) {
      const inp = inputAt(+i), cell = inp?.parentNode; if (!inp) continue;
      const mine = inp.value;
      cell.classList.remove('hl', 'cur');
      if (mine === ch) cell.classList.add('ok');
      else { cell.classList.add(mine ? 'bad' : 'miss'); inp.value = ch; }
      inp.readOnly = true;
    }
    const me = v.ranking?.find(r => r.pid === pid);
    const winner = v.winner ? P(v.winner) : null;
    let record = '';
    if (!v.multi && me?.done && v.duration) {
      let b = null; try { b = +localStorage.getItem(bestKey()) || null; } catch {}
      if (!b || v.duration < b) { try { localStorage.setItem(bestKey(), v.duration); } catch {} record = '<p class="wd-record">🏆 NOUVEAU RECORD !</p>'; }
    }
    const host = isHost();
    $('#wd-end').innerHTML = `<div class="wd-endcard">
      ${winner ? `<div class="wd-win">${avatarHTML(winner, 80)}<h2>${v.multi ? `${nameHTML(winner)} gagne la course !` : 'Grille terminée !'}</h2><p class="wd-time">⏱️ ${fmt(v.duration)}</p>${record}</div>`
        : `<div class="wd-win"><span class="big-em">🏳️</span><h2>Partie arrêtée</h2></div>`}
      <div class="wd-rank">${(v.ranking || []).map((r, i) => { const p = P(r.pid); return `<div class="row ${r.pid === pid ? 'me' : ''}"><b>${i + 1}</b>${avatarHTML(p, 30)}<span>${nameHTML(p)}</span><em>${r.done ? '✅ terminé' : Math.round(r.ratio * 100) + ' % juste'}</em>${r.hintsUsed ? `<small>💡×${r.hintsUsed}</small>` : ''}<strong>+${v.coins && r.pid === pid ? v.coins.coins : ''}${r.pid === pid ? ' 🪙' : ''}</strong></div>`; }).join('')}</div>
      <p class="muted small">En vert : tes bonnes lettres · en rouge : corrigées · en gris : manquantes</p>
      <div class="end-actions">${host ? '<button class="btn btn-primary" id="wd-replay">🔁 Nouvelle grille</button><button class="btn btn-yellow" id="wd-lobby">🏠 Salon</button>' : '<p class="muted">L\'hôte peut lancer une nouvelle grille.</p>'}
      <button class="btn btn-shop" id="wd-shop">🛍️ Boutique</button></div></div>`;
    $('#wd-replay')?.addEventListener('click', () => gAct('replay'));
    $('#wd-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $('#wd-shop')?.addEventListener('click', openShop);
    if (v.winner === pid) { burst(save.look.winFx, 34); sfx('legend'); setTimeout(() => sfx('legend'), 300); }
    $('#wd-end').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  window.WORD = { render };
})();
