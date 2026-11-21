// PLAYZUP — client « Puissance 4 » : jetons qui tombent et rebondissent, colonne survolée, ligne gagnante, bombes.
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const EMOTES = ['👏', '😱', '🤔', '😂', '🔥', '😭', '🐐', '🫡'];
  let V = null, key = null, seen = {}, armed = false, lastFx = 0, shown = null, ended = false, iv = null, blastK = 0, hov = -1;

  function build(v) {
    $('#v-c4').innerHTML = `
      <div class="c4-room" id="c4-room">
        <div class="c4-head"><div class="c4-logo"><i class="t r"></i><i class="t y"></i><span>PUISSANCE <b id="c4-k">4</b></span></div><div class="c4-chips"><span id="c4-mode"></span><span id="c4-n"></span></div></div>
        <div class="c4-players" id="c4-players"></div>
        <div class="c4-turn" id="c4-turn"></div>
        <div class="c4-stage">
          <div class="c4-board" id="c4-board" style="--W:${v.W};--H:${v.H}">
            <div class="c4-ghost" id="c4-ghost"></div>
            <div class="c4-tokens" id="c4-tokens"></div>
            <svg class="c4-front" viewBox="0 0 ${v.W * 100} ${v.H * 100}" preserveAspectRatio="none">
              <defs><mask id="c4m"><rect width="100%" height="100%" fill="#fff"/>${Array.from({ length: v.W * v.H }, (_, i) => `<circle cx="${(i % v.W) * 100 + 50}" cy="${Math.floor(i / v.W) * 100 + 50}" r="38" fill="#000"/>`).join('')}</mask>
              <linearGradient id="c4g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7bff"/><stop offset="1" stop-color="#1638b8"/></linearGradient></defs>
              <rect width="100%" height="100%" fill="url(#c4g)" mask="url(#c4m)"/>
              ${Array.from({ length: v.W * v.H }, (_, i) => `<circle cx="${(i % v.W) * 100 + 50}" cy="${Math.floor(i / v.W) * 100 + 50}" r="38" fill="none" stroke="#0d2a8a" stroke-width="5"/><path d="M${(i % v.W) * 100 + 20} ${Math.floor(i / v.W) * 100 + 36} a38 38 0 0 1 30 -24" fill="none" stroke="#9fc0ff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`).join('')}
            </svg>
            <div class="c4-cols" id="c4-cols">${Array.from({ length: v.W }, (_, c) => `<button data-c="${c}"></button>`).join('')}</div>
            <svg class="c4-win" id="c4-win" viewBox="0 0 ${v.W * 100} ${v.H * 100}" preserveAspectRatio="none"></svg>
            <div class="c4-fx" id="c4-fx"></div>
            <div class="c4-banner hidden" id="c4-banner"></div>
          </div>
          <div class="c4-feet"><i></i><i></i></div>
        </div>
        <div class="c4-tools"><button class="btn btn-ghost btn-sm hidden" id="c4-bomb">💣 Bombe</button><div class="c4-emotes" id="c4-emotes">${EMOTES.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div><button class="btn btn-ghost btn-sm" id="c4-resign">🏳️ Abandonner</button><button class="btn btn-ghost btn-sm hidden" id="c4-stop">⏹ Terminer</button></div>
        <div id="c4-end"></div>
      </div>`;
    seen = {}; armed = false;
    $$('#c4-cols button').forEach(b => {
      b.onmouseenter = () => { hov = +b.dataset.c; ghost(); if (mine()) gAct('hover', { col: hov }); };
      b.onclick = () => play(+b.dataset.c);
    });
    $('#c4-cols').onmouseleave = () => { hov = -1; ghost(); };
    $('#c4-bomb').onclick = () => { armed = !armed; $('#c4-bomb').classList.toggle('on', armed); ghost(); sfx('click'); };
    $('#c4-resign').onclick = () => { if (confirm('Abandonner cette manche ?')) gAct('resign'); };
    $('#c4-stop').onclick = () => { if (confirm('Terminer la série ?')) gAct('end'); };
    $$('#c4-emotes button').forEach(b => b.onclick = () => gAct('emote', { e: b.dataset.e }));
  }
  const mine = () => V && V.stage === 'play' && V.me && V.turn === V.me;
  async function play(c) {
    if (!mine()) return;
    const r = await gAct('drop', { col: c, bomb: armed });
    if (r?.error) toast(r.error, 'error'); else { armed = false; $('#c4-bomb').classList.remove('on'); }
  }
  function ghost() {
    const g = $('#c4-ghost'), v = V; if (!g || !v) return;
    const col = mine() ? hov : (v.stage === 'play' && v.hoverCol != null && !v.me ? v.hoverCol : -1);
    if (col < 0 || v.stage !== 'play') { g.className = 'c4-ghost'; return; }
    g.className = `c4-ghost on ${v.turn === 1 ? 'r' : 'y'} ${armed && mine() ? 'bomb' : ''}`;
    g.style.setProperty('--c', col);
  }
  function tokens(v) {
    const box = $('#c4-tokens');
    const blasted = v.blast && v.blast.k !== blastK;
    if (blasted) {
      blastK = v.blast.k;
      // explosion : on retire les jetons touchés, puis tout le monde retombe
      const fx = $('#c4-fx');
      const b = document.createElement('div'); b.className = 'c4-boom'; b.style.setProperty('--c', v.blast.c); b.style.setProperty('--r', v.blast.r); b.innerHTML = '💥'; fx.appendChild(b); setTimeout(() => b.remove(), 1100);
      sfx('bang', .9); document.body.classList.add('sn-shake'); setTimeout(() => document.body.classList.remove('sn-shake'), 400);
      box.innerHTML = ''; seen = {};
    }
    for (let r = 0; r < v.H; r++) for (let c = 0; c < v.W; c++) {
      const k = r + ',' + c, val = v.grid[r][c];
      if (!val) { if (seen[k]) { seen[k].remove(); delete seen[k]; } continue; }
      if (seen[k] && seen[k].dataset.v == val) continue;
      if (seen[k]) seen[k].remove();
      const t = document.createElement('div');
      const isNew = v.last && v.last.r === r && v.last.c === c && !v.last.bomb;
      t.className = `c4-t ${val === 1 ? 'r' : 'y'} ${isNew || blasted ? 'drop' : ''}`;
      t.dataset.v = val; t.style.setProperty('--c', c); t.style.setProperty('--r', r);
      t.style.setProperty('--dur', (isNew ? .25 + r * .07 : .45) + 's');
      t.innerHTML = '<i></i>';
      box.appendChild(t); seen[k] = t;
      if (isNew) setTimeout(() => sfx('pop', .7), (.25 + r * .07) * 1000 - 40);
    }
    // ligne gagnante
    const w = $('#c4-win');
    if (v.line && v.stage !== 'play') {
      const pts = v.line.map(([r, c]) => [c * 100 + 50, r * 100 + 50]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const [a, b] = [pts[0], pts[pts.length - 1]];
      w.innerHTML = `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="c4-line"/>`;
      v.line.forEach(([r, c]) => seen[r + ',' + c]?.classList.add('win'));
    } else w.innerHTML = '';
  }
  function players(v) {
    const card = (pid, n) => {
      const p = P(pid) || { name: '?', avatar: '❔' }, act = v.stage === 'play' && v.turn === n;
      return `<div class="c4-pl ${n === 1 ? 'r' : 'y'} ${act ? 'act' : ''} ${pid === pid ? 'me' : ''}">
        <i class="c4-chip-tok ${n === 1 ? 'r' : 'y'}"></i>${avatarHTML(p, 40)}<div><b>${esc(p.name)}</b><small>${v.wins[pid] || 0} 🏆${v.mode === 'bomb' ? ` · ${'💣'.repeat(v.bombs[n] || 0) || '—'}` : ''}</small></div>
        ${act && v.time ? `<div class="c4-clock" data-n="${n}"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle cx="18" cy="18" r="15" class="arc"/></svg><span></span></div>` : ''}</div>`;
    };
    $('#c4-players').innerHTML = card(v.p1, 1) + '<span class="c4-vs">VS</span>' + card(v.p2, 2);
    const q = v.queue.filter(x => x !== v.p1 && x !== v.p2);
    $('#c4-turn').innerHTML = v.stage === 'over' ? '🏁 Série terminée' : v.stage === 'result' ? '⏳ Manche suivante…'
      : v.me ? (v.turn === v.me ? `<b class="go">👉 À toi ! Choisis une colonne</b>` : `⏳ ${esc(P(v.turn === 1 ? v.p1 : v.p2)?.name || '')} réfléchit…`)
        : `👀 Tu regardes${q.length ? ` · file d'attente : ${q.map(x => esc(P(x)?.name || '')).join(', ')}` : ''}`;
    clearInterval(iv);
    if (v.stage === 'play' && v.time) {
      const t0 = Date.now(), L = v.left, T = v.time * 1000;
      iv = setInterval(() => {
        const el = $('#c4-players .c4-clock'); if (!el) return;
        const left = Math.max(0, L - (Date.now() - t0)), f = Math.min(1, left / T);
        el.querySelector('span').textContent = Math.ceil(left / 1000);
        el.querySelector('.arc').style.strokeDashoffset = 94.2 * (1 - f);
        el.classList.toggle('low', left < 5000);
      }, 120);
    }
  }
  function banner(v) {
    const b = $('#c4-banner');
    if (v.stage !== 'result' || !v.result) { b.classList.add('hidden'); return; }
    const k = v.n + ':' + v.result.why; if (shown === k) return; shown = k;
    const w = v.result.wp ? P(v.result.wp) : null, mineW = v.result.wp === pid;
    b.innerHTML = `<div class="c4-bn ${v.result.winner === 1 ? 'r' : v.result.winner === 2 ? 'y' : 'd'}"><span>${w ? (mineW ? '🏆' : '🔥') : '🤝'}</span><b>${w ? esc(w.name) + ' gagne !' : 'Match nul'}</b><small>${{ ligne: `${v.K} alignés !`, plein: 'Grille pleine', double: 'Double ligne après la bombe', abandon: 'Abandon', depart: 'Adversaire parti' }[v.result.why] || ''}</small></div>`;
    setTimeout(() => b.classList.remove('hidden'), 700);
    setTimeout(() => { if (mineW) { sfx('legend'); burst(save.look.winFx, 22); } else sfx(w ? (v.me ? 'wrong' : 'drum') : 'drum'); }, 700);
  }
  function render(v) {
    if (v.gameKey !== key || !$('#c4-board') || +$('#c4-board').style.getPropertyValue('--W') !== v.W) { key = v.gameKey; build(v); shown = null; ended = false; blastK = 0; }
    if (V && V.n !== v.n) { $('#c4-tokens').innerHTML = ''; seen = {}; }
    V = v;
    $('#c4-k').textContent = v.K;
    $('#c4-mode').textContent = v.modeName; $('#c4-n').textContent = `Manche ${v.n}/${v.total}`;
    $('#c4-board').classList.toggle('mine', !!mine());
    $('#c4-bomb').classList.toggle('hidden', !(v.mode === 'bomb' && v.me && v.stage === 'play' && v.bombs[v.me] > 0));
    $('#c4-resign').classList.toggle('hidden', !(v.me && v.stage === 'play'));
    $('#c4-stop').classList.toggle('hidden', !isHost() || v.stage === 'over');
    players(v); tokens(v); ghost(); banner(v);
    if (v.fx && v.fx.k !== lastFx) { lastFx = v.fx.k; const p = P(v.fx.pid); const el = document.createElement('div'); el.className = 'c4-emote'; el.innerHTML = `${v.fx.e}<small>${esc(p?.name || '')}</small>`; $('#c4-fx').appendChild(el); setTimeout(() => el.remove(), 2200); }
    if (v.stage === 'play' && mine() && render.turnK !== v.moves) { render.turnK = v.moves; if (v.moves) sfx('click', .5); }
    if (v.stage === 'over' && !ended) {
      ended = true;
      setTimeout(() => { $('#c4-end').innerHTML = `<div class="pz-end"><h2>🔴🟡 ${v.ranking?.[0]?.pid === pid ? 'Champion du Puissance 4 !' : 'Fin de la série'}</h2>${podium((v.ranking || []).map(r => ({ pid: r.pid, pts: r.pts })))}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('c4')}</div>`; endWire('c4', v.ranking || []); $('#c4-end').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 1500);
    }
  }
  window.C4 = { render };
})();
