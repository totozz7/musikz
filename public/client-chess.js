// PLAYZUP — client « Échecs » : plateau animé, glisser-déposer, pendules, paris des spectateurs, skins de plateau et de pièces.
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const GL = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
  const NAMES = { K: 'Roi', Q: 'Dame', R: 'Tour', B: 'Fou', N: 'Cavalier', P: 'Pion' };
  const VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  const WHY = { mat: 'Échec et mat !', temps: 'Tombé au temps ⏱️', abandon: 'Abandon 🏳️', colline: 'Roi au sommet de la colline ⛰️', echecs3: 'Trois échecs ! 3️⃣', roi: 'Roi capturé dans le brouillard 🌫️', pat: 'Pat — nulle', nulle: 'Nulle acceptée 🤝', repet: 'Triple répétition — nulle', '50': 'Règle des 50 coups — nulle', materiel: 'Matériel insuffisant — nulle', depart: 'Adversaire parti 🚪' };
  const MODE_HELP = { classic: 'Les échecs, les vrais.', c960: 'Pièces de la dernière rangée mélangées au hasard (fous de couleurs opposées, roi entre les tours). Pas de roque : place à l\'improvisation !', hill: 'En plus du mat, tu gagnes si ton roi atteint une des 4 cases du centre (d4, e4, d5, e5) ⛰️.', check3: 'Le premier qui met son adversaire 3 fois en échec gagne. Ça va très vite !', fog: 'Tu ne vois que les cases où tes pièces peuvent aller. Pas d\'échec ni de mat : il faut CAPTURER le roi adverse 🌫️.' };
  const EMOTES = ['👏', '😱', '🤔', '😂', '🔥', '🫡', '😭', '🐐'];
  const skinOf = (id) => SHOP.chesspc.find(x => x.id === id) || SHOP.chesspc[0];
  let V = null, key = null, sel = null, drag = null, clockIv = null, lastFx = 0, shownResult = null, prevBoard = null, flip = false, ended = false;

  function pieceHTML(p, skin) {
    const it = skinOf(skin);
    if (it.set) return `<span class="chp emo ${p.c} sk-${it.id}"><i></i><b>${it.set[p.t]}</b></span>`;
    return `<span class="chp ${p.c} sk-${it.id}"><b>${GL[p.t]}︎</b></span>`;
  }
  const skinFor = (v, c) => (c === 'w' ? P(v.white) : P(v.black))?.chesspc || 'classic';
  const pos = (s) => { const f = s & 7, r = s >> 3; return flip ? [7 - f, 7 - r] : [f, r]; };
  const sqAt = (x, y) => flip ? (7 - y) * 8 + (7 - x) : y * 8 + x;

  function build() {
    $('#v-chess').innerHTML = `
      <div class="ch-room" id="ch-room">
        <header class="ch-top">
          <div class="ch-logo"><span>♞</span>ÉCHECS</div>
          <div class="ch-meta"><span class="ch-chip" id="ch-mode"></span><span class="ch-chip" id="ch-n"></span></div>
        </header>
        <div class="ch-main">
          <div class="ch-col">
            <div class="ch-bar top" id="ch-bar-top"></div>
            <div class="ch-frame chb-${esc(save.look.chessb || 'tournoi')}" id="ch-frame">
              <div class="ch-board" id="ch-board"></div>
              <div class="ch-pcs" id="ch-pcs"></div>
              <div class="ch-fx" id="ch-fx"></div>
              <div class="ch-promo hidden" id="ch-promo"></div>
              <div class="ch-banner hidden" id="ch-banner"></div>
            </div>
            <div class="ch-bar bot" id="ch-bar-bot"></div>
          </div>
          <aside class="ch-side">
            <div class="ch-turn" id="ch-turn"></div>
            <div class="ch-offer hidden" id="ch-offer"></div>
            <div class="ch-acts" id="ch-acts"><button class="btn btn-ghost btn-sm" id="ch-draw">🤝 Proposer la nulle</button><button class="btn btn-ghost btn-sm" id="ch-resign">🏳️ Abandonner</button></div>
            <div class="ch-bets hidden" id="ch-bets"></div>
            <h4>📜 Coups</h4>
            <ol class="ch-moves" id="ch-moves"></ol>
            <div class="ch-emotes" id="ch-emotes">${EMOTES.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div>
            <h4 id="ch-table-h">🏆 La table</h4>
            <div class="ch-table" id="ch-table"></div>
            <button class="btn btn-ghost btn-sm hidden" id="ch-stop">⏹ Terminer</button>
          </aside>
        </div>
        <div id="ch-end"></div>
      </div>`;
    const sqs = [];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) sqs.push(`<div class="sq ${(x + y) % 2 ? 'd' : 'l'}" data-x="${x}" data-y="${y}"></div>`);
    $('#ch-board').innerHTML = sqs.join('');
    $('#ch-draw').onclick = () => gAct('draw');
    $('#ch-resign').onclick = () => { if (confirm('Abandonner cette partie ?')) gAct('resign'); };
    $('#ch-stop').onclick = () => { if (confirm('Terminer toute la série maintenant ?')) gAct('end'); };
    $$('#ch-emotes button').forEach(b => b.onclick = () => gAct('emote', { e: b.dataset.e }));
    $('#ch-board').onclick = (e) => { const q = e.target.closest('.sq'); if (q) clickSq(sqAt(+q.dataset.x, +q.dataset.y)); };
    const pcs = $('#ch-pcs');
    pcs.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    prevBoard = null; sel = null;
  }

  // ───────── interactions ─────────
  const myMoves = () => (V && V.stage === 'play' && V.moves) || null;
  function clickSq(s) {
    const mv = myMoves(); if (!mv) return;
    if (sel !== null && (mv[sel] || []).includes(s)) return tryMove(sel, s);
    if (mv[s]) { sel = sel === s ? null : s; sfx('click', .4); return marks(); }
    sel = null; marks();
  }
  function tryMove(from, to) {
    const p = V.board[from];
    if (p?.t === 'P' && ((to >> 3) === 0 || (to >> 3) === 7)) return askPromo(from, to);
    send(from, to);
  }
  function askPromo(from, to) {
    const box = $('#ch-promo'), sk = skinFor(V, V.color);
    box.innerHTML = `<div class="ch-promo-card"><b>Promotion !</b><div>${['Q', 'R', 'B', 'N'].map(t => `<button data-t="${t}" title="${NAMES[t]}">${pieceHTML({ t, c: V.color }, sk)}</button>`).join('')}</div></div>`;
    box.classList.remove('hidden');
    $$('#ch-promo button').forEach(b => b.onclick = () => { box.classList.add('hidden'); send(from, to, b.dataset.t); });
    box.onclick = (e) => { if (e.target === box) { box.classList.add('hidden'); sel = null; marks(); } };
  }
  async function send(from, to, promo) {
    sel = null; marks();
    // déplacement immédiat (le serveur confirme juste après)
    const el = $(`#ch-pcs [data-sq="${from}"]`);
    if (el) { const [x, y] = pos(to); el.style.setProperty('--cx', x); el.style.setProperty('--cy', y); }
    const r = await gAct('move', { from, to, promo });
    if (r?.error && V) draw(V);
  }
  function onDown(e) {
    const el = e.target.closest('.ch-pc'); if (!el) return;
    const s = +el.dataset.sq, mv = myMoves();
    if (!mv || !mv[s]) { clickSq(s); return; }
    e.preventDefault();
    const r = $('#ch-board').getBoundingClientRect();
    drag = { el, s, r, x0: e.clientX, y0: e.clientY, moved: false };
    sel = s; marks();
    el.classList.add('drag');
  }
  function onMove(e) {
    if (!drag) return;
    const { el, r } = drag;
    if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 4) drag.moved = true;
    if (!drag.moved) return;
    const w = r.width / 8;
    el.style.transform = `translate(${e.clientX - r.left - w / 2}px, ${e.clientY - r.top - w / 2}px) scale(1.15)`;
    const x = Math.floor((e.clientX - r.left) / w), y = Math.floor((e.clientY - r.top) / w);
    $$('#ch-board .sq.q-hov').forEach(q => q.classList.remove('q-hov'));
    if (x >= 0 && x < 8 && y >= 0 && y < 8) $(`#ch-board .sq[data-x="${x}"][data-y="${y}"]`)?.classList.add('q-hov');
  }
  function onUp(e) {
    if (!drag) return;
    const { el, r, s, moved } = drag; drag = null;
    el.classList.remove('drag'); el.style.transform = '';
    $$('#ch-board .sq.q-hov').forEach(q => q.classList.remove('q-hov'));
    if (!moved) return; // simple clic : la pièce reste sélectionnée
    const w = r.width / 8, x = Math.floor((e.clientX - r.left) / w), y = Math.floor((e.clientY - r.top) / w);
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    const to = sqAt(x, y);
    if ((myMoves()?.[s] || []).includes(to)) tryMove(s, to);
  }

  // ───────── dessin ─────────
  function marks() {
    const v = V; if (!v) return;
    const mv = myMoves(), targets = sel !== null && mv ? (mv[sel] || []) : [];
    const vis = v.vis ? new Set(v.vis) : null;
    $$('#ch-board .sq').forEach(q => {
      const s = sqAt(+q.dataset.x, +q.dataset.y);
      q.className = `sq ${(+q.dataset.x + +q.dataset.y) % 2 ? 'd' : 'l'}`
        + (v.last && !v.last.hidden && (v.last.from === s || v.last.to === s) ? ' q-last' : '')
        + (sel === s ? ' q-sel' : '') + (targets.includes(s) ? (v.board[s] ? ' q-cap' : ' q-dot') : '')
        + (v.check === s ? ' q-chk' : '') + (vis && !vis.has(s) ? ' q-fog' : '')
        + ((v.mode === 'hill') && [27, 28, 35, 36].includes(s) ? ' q-hill' : '');
    });
    // coordonnées
    $$('#ch-board .sq').forEach(q => {
      const x = +q.dataset.x, y = +q.dataset.y, s = sqAt(x, y);
      let h = '';
      if (x === 0) h += `<em class="rk">${8 - (s >> 3)}</em>`;
      if (y === 7) h += `<em class="fl">${'abcdefgh'[s & 7]}</em>`;
      if (q.innerHTML !== h) q.innerHTML = h;
    });
  }
  function pieces(v) {
    const box = $('#ch-pcs'), seen = new Set();
    const skW = skinFor(v, 'w'), skB = skinFor(v, 'b');
    v.board.forEach((p, s) => {
      if (!p) return;
      seen.add(String(p.id));
      let el = box.querySelector(`[data-id="${p.id}"]`);
      const html = pieceHTML(p, p.c === 'w' ? skW : skB), sig = p.t + (p.c === 'w' ? skW : skB);
      if (!el) { el = document.createElement('div'); el.className = 'ch-pc born'; el.dataset.id = p.id; box.appendChild(el); setTimeout(() => el.classList.remove('born'), 400); }
      if (el.dataset.sig !== sig) { if (el.dataset.sig && el.dataset.sig[0] !== p.t) { el.classList.remove('promo'); void el.offsetWidth; el.classList.add('promo'); } el.innerHTML = html; el.dataset.sig = sig; }
      const [x, y] = pos(s);
      el.style.setProperty('--cx', x); el.style.setProperty('--cy', y);
      el.dataset.sq = s;
      el.classList.toggle('can', !!(myMoves() && myMoves()[s]));
      el.classList.remove('dead');
    });
    box.querySelectorAll('.ch-pc').forEach(el => {
      if (seen.has(el.dataset.id) || el.classList.contains('dead')) return;
      el.classList.add('dead'); setTimeout(() => el.remove(), 600);
    });
  }
  function fxAt(s, html, cls) {
    const [x, y] = pos(s), f = document.createElement('div');
    f.className = 'ch-burst ' + (cls || ''); f.style.setProperty('--cx', x); f.style.setProperty('--cy', y); f.innerHTML = html;
    $('#ch-fx').appendChild(f); setTimeout(() => f.remove(), 1200);
  }
  const fmt = (ms) => { if (ms == null) return '∞'; ms = Math.max(0, ms); const s = ms / 1000; return s < 20 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}` : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
  function bar(v, c) {
    const pid = c === 'w' ? v.white : v.black, p = P(pid) || { name: '?', avatar: '❔' };
    const capt = v.captured[c] || [], mat = (v.captured[c] || []).reduce((a, t) => a + VAL[t], 0) - (v.captured[c === 'w' ? 'b' : 'w'] || []).reduce((a, t) => a + VAL[t], 0);
    const skOpp = skinFor(v, c === 'w' ? 'b' : 'w');
    const active = v.stage === 'play' && v.turn === c;
    const checks = v.mode === 'check3' ? `<span class="ch-3c">${[0, 1, 2].map(i => `<i class="${i < v.checks[c] ? 'on' : ''}"></i>`).join('')}</span>` : '';
    return `<div class="ch-pl ${active ? 'act' : ''} ${pid === pid0() ? 'me' : ''}">
      ${avatarHTML(p, 40)}<div class="ch-pn"><b>${c === 'w' ? '⚪' : '⚫'} ${esc(p.name)}</b><small class="ch-cap">${capt.sort((a, b) => VAL[b] - VAL[a]).map(t => pieceHTML({ t, c: c === 'w' ? 'b' : 'w' }, skOpp)).join('')}${mat > 0 ? `<em>+${mat}</em>` : ''}</small></div>
      ${checks}<div class="ch-clock ${active && v.ticking ? 'run' : ''}" data-c="${c}">${v.clock ? fmt(v.clock[c]) : '♾️'}</div></div>`;
  }
  const pid0 = () => pid;
  function clocks(v) {
    clearInterval(clockIv);
    if (!v.clock || !v.ticking) return;
    const t0 = Date.now(), base = { ...v.clock };
    clockIv = setInterval(() => {
      const el = $(`#ch-room .ch-clock[data-c="${v.turn}"]`); if (!el) return;
      const left = base[v.turn] - (Date.now() - t0);
      el.textContent = fmt(left); el.classList.toggle('low', left < 20000);
      if (left < 10000 && v.color === v.turn && Math.floor(left / 1000) !== clocks.s) { clocks.s = Math.floor(left / 1000); sfx('tick', .35); }
    }, 100);
  }
  function side(v) {
    const iPlay = !!v.color, play = v.stage === 'play';
    const pw = P(v.white), pb = P(v.black);
    $('#ch-turn').innerHTML = v.stage === 'over' ? '🏁 Série terminée' : !play ? '⏳ Partie suivante…'
      : iPlay ? (v.turn === v.color ? '<b class="go">👉 À toi de jouer !</b>' : `⏳ ${esc((v.turn === 'w' ? pw : pb)?.name || '')} réfléchit…`)
        : `👀 Tu regardes · au tour de ${v.turn === 'w' ? '⚪' : '⚫'} ${esc((v.turn === 'w' ? pw : pb)?.name || '')}`;
    $('#ch-acts').classList.toggle('hidden', !iPlay || !play);
    $('#ch-draw').disabled = v.drawOffer === v.color;
    $('#ch-draw').textContent = v.drawOffer === v.color ? '🤝 Nulle proposée…' : '🤝 Proposer la nulle';
    const offer = play && iPlay && v.drawOffer && v.drawOffer !== v.color;
    $('#ch-offer').classList.toggle('hidden', !offer);
    if (offer) { $('#ch-offer').innerHTML = `🤝 Ton adversaire propose la nulle <div><button class="btn btn-primary btn-sm" id="ch-yes">Accepter</button><button class="btn btn-ghost btn-sm" id="ch-no">Refuser</button></div>`; $('#ch-yes').onclick = () => gAct('draw'); $('#ch-no').onclick = () => gAct('nodraw'); }
    // paris
    const bets = Object.values(v.bets || {}), canBet = play && !iPlay && v.hist.length < 6;
    $('#ch-bets').classList.toggle('hidden', iPlay || !play);
    if (!iPlay && play) {
      const cnt = (o) => bets.filter(b => b === o).length;
      $('#ch-bets').innerHTML = `<h4>🎰 Ton pronostic ${canBet ? '' : '<small>(fermé)</small>'}</h4><div class="ch-betbtns">${[[v.white, '⚪ ' + (pw?.name || '')], ['draw', '🤝 Nulle'], [v.black, '⚫ ' + (pb?.name || '')]].map(([o, l]) => `<button class="${v.myBet === o ? 'on' : ''}" data-o="${o}" ${canBet ? '' : 'disabled'}>${esc(l)}<small>${cnt(o)} pari${cnt(o) > 1 ? 's' : ''}</small></button>`).join('')}</div>`;
      $$('#ch-bets button').forEach(b => b.onclick = () => { gAct('bet', { on: b.dataset.o }); sfx('pop', .5); });
    }
    // coups
    const h = v.hist, rows = [];
    for (let i = 0; i < h.length; i += 2) rows.push(`<li><span>${esc(h[i])}</span><span>${esc(h[i + 1] || '')}</span></li>`);
    $('#ch-moves').innerHTML = rows.join('') || '<li class="muted">—</li>';
    $('#ch-moves').scrollTop = 1e6;
    // table
    const ids = Object.keys(v.wins).sort((a, b) => (v.wins[b] - v.wins[a]) || v.queue.indexOf(a) - v.queue.indexOf(b));
    $('#ch-table').innerHTML = ids.map(id => { const p = P(id); if (!p) return ''; const seat = id === v.white ? '⚪' : id === v.black ? '⚫' : `#${v.queue.indexOf(id) - 1}`; return `<div class="ch-tr ${id === pid ? 'me' : ''}"><span class="seat">${seat}</span>${avatarHTML(p, 24)}<b>${esc(p.name)}</b><em>${v.wins[id]} 🏆${v.betPts[id] ? ` · ${v.betPts[id]} 🎰` : ''}</em></div>`; }).join('');
    $('#ch-emotes').classList.toggle('hidden', v.stage === 'over');
    $('#ch-stop').classList.toggle('hidden', !isHost() || v.stage === 'over');
  }
  function banner(v) {
    const b = $('#ch-banner'), r = v.result;
    if (v.stage !== 'result' || !r) { b.classList.add('hidden'); return; }
    const k = v.n + ':' + r.why; if (shownResult === k) return; shownResult = k;
    const w = r.wp ? P(r.wp) : null, mine = r.wp === pid;
    b.innerHTML = `<div class="ch-bn ${r.wp ? (mine ? 'win' : v.color ? 'lose' : 'neu') : 'draw'}"><span class="big">${r.wp ? (mine ? '🏆' : v.color ? '💀' : '♚') : '🤝'}</span><b>${r.wp ? esc(w?.name || '?') + ' gagne !' : 'Partie nulle'}</b><small>${WHY[r.why] || ''}</small>${v.n < v.total ? '<i>Partie suivante dans quelques secondes…</i>' : ''}</div>`;
    b.classList.remove('hidden');
    if (mine) { sfx('legend'); burst(save.look.winFx, 24); } else if (!r.wp) sfx('drum'); else sfx(v.color ? 'wrong' : 'drum');
    if (r.why === 'mat' || r.why === 'roi' || r.why === 'colline') { const lc = r.winner === 'w' ? 'b' : 'w'; const kel = [...$$('#ch-pcs .ch-pc')].find(e => e.dataset.sig?.[0] === 'K' && V.board[+e.dataset.sq]?.c === lc); kel?.classList.add('fall'); $('#ch-frame').classList.add('shake'); setTimeout(() => $('#ch-frame')?.classList.remove('shake'), 600); }
  }
  function soundFor(v) {
    const L = v.last; if (!L || L.hidden || !prevBoard) return;
    const k = `${L.from}-${L.to}-${v.hist.length}`; if (soundFor.k === k) return; soundFor.k = k;
    if (L.cap) { sfx('pop', .8); fxAt(L.to, '💥', 'cap'); } else sfx('click', .7);
    if (L.castle) fxAt(L.to, '🏰', 'castle');
    if (L.promo) fxAt(L.to, '✨👑✨', 'promo');
    if (v.check >= 0) { sfx('stamp', .6); fxAt(v.check, 'ÉCHEC !', 'chk'); }
  }
  function draw(v) {
    pieces(v); marks(); side(v);
    $('#ch-bar-top').innerHTML = bar(v, flip ? 'w' : 'b');
    $('#ch-bar-bot').innerHTML = bar(v, flip ? 'b' : 'w');
    clocks(v);
  }
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); shownResult = null; ended = false; soundFor.k = null; }
    const newFlip = v.color === 'b';
    if (newFlip !== flip) { flip = newFlip; $('#ch-pcs').innerHTML = ''; }
    $('#ch-frame').className = `ch-frame chb-${save.look.chessb || 'tournoi'} m-${v.mode}`;
    $('#ch-mode').textContent = v.modeName;
    $('#ch-n').textContent = `Partie ${v.n} / ${v.total}`;
    if (sel !== null && !(myMoves() || {})[sel]) sel = null;
    draw(v);
    soundFor(v);
    if (v.fx && v.fx.k !== lastFx) {
      lastFx = v.fx.k; const p = P(v.fx.pid);
      const c = v.fx.pid === v.white ? 'w' : v.fx.pid === v.black ? 'b' : null;
      const where = c ? ((c === 'w') !== flip ? 'bot' : 'top') : 'spec';
      const el = document.createElement('div'); el.className = 'ch-emote ' + where; el.innerHTML = `${v.fx.e}<small>${esc(p?.name || '')}</small>`;
      $('#ch-frame').appendChild(el); setTimeout(() => el.remove(), 2200);
    }
    banner(v);
    prevBoard = v.board;
    if (v.stage === 'over' && !ended) { ended = true; setTimeout(() => showEnd(v), 1200); }
  }
  function showEnd(v) {
    const top = v.ranking?.[0];
    $('#ch-end').innerHTML = `<div class="pz-end ch-endc"><h2>♚ ${top && top.pid === pid ? 'Grand maître de la soirée !' : 'Fin de la série'}</h2>${podium((v.ranking || []).map(r => ({ pid: r.pid, pts: r.pts })))}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('ch')}</div>`;
    endWire('ch', v.ranking || []);
    $('#ch-end').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function refresh() { if (V && $('#ch-frame')) { $('#ch-frame').className = `ch-frame chb-${save.look.chessb || 'tournoi'} m-${V.mode}`; $('#ch-pcs').innerHTML = ''; draw(V); } }
  window.CHESS = { render, refresh, pieceHTML, MODE_HELP };
})();
