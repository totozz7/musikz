// PLAYZUP — client Petits chevaux. Utilise app.js : $, esc, avatarHTML, nameHTML, state, pid, gAct, SHOP…
(function () {
  // ── géométrie du plateau (grille 15 × 15) ──
  const TRACK = [];
  const push = (cells) => cells.forEach(c => TRACK.push(c));
  push([[6, 1], [6, 2], [6, 3], [6, 4], [6, 5]]);
  push([[5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6]]); push([[0, 7], [0, 8]]);
  push([[1, 8], [2, 8], [3, 8], [4, 8], [5, 8]]);
  push([[6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14]]); push([[7, 14], [8, 14]]);
  push([[8, 13], [8, 12], [8, 11], [8, 10], [8, 9]]);
  push([[9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8]]); push([[14, 7], [14, 6]]);
  push([[13, 6], [12, 6], [11, 6], [10, 6], [9, 6]]);
  push([[8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0]]); push([[7, 0], [6, 0]]);
  const START = [0, 13, 26, 39];
  const HOME = [
    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]], [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  ];
  const STABLE = [[0, 0], [0, 9], [9, 9], [9, 0]]; // coin de chaque écurie (carré 6 × 6)
  const FINISH_SPOT = [[7, 6.25], [6.25, 7], [7, 7.75], [7.75, 7]];
  // option échelle : 6e marche au bord du centre, arrivée un peu plus au cœur
  const STEP6 = [[7, 6], [6, 7], [7, 8], [8, 7]];
  const FINISH_L = [[7, 6.72], [6.72, 7], [7, 7.28], [7.28, 7]];
  const GATE = [50, 11, 24, 37]; // case du tour juste avant le couloir de chaque couleur (pied de l'escalier)
  const HEX = ['#ff2e4d', '#22c55e', '#ffc21a', '#2f8bff'];

  function cellOf(color, rel, h, nH) {
    if (rel === -1) { const [r, c] = STABLE[color]; const off = [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]][h % 4]; return [r + off[0], c + off[1]]; }
    if (rel <= 50) return TRACK[(START[color] + rel) % 52];
    if (rel <= 55) return HOME[color][rel - 51];
    const ladder = V?.ladder;
    if (ladder && rel === 56) return STEP6[color];
    const [r, c] = (ladder ? FINISH_L : FINISH_SPOT)[color]; const o = (h - (nH - 1) / 2) * (ladder ? .22 : .28);
    return color % 2 ? [r, c + o] : [r + o, c];
  }

  let V = null, key = null, lastN = -1, anim = null, timerIv = null, lastStage = '';
  const P = (id) => state?.players.find(p => p.id === id);

  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (!v.finish) v.finish = v.ladder ? 57 : 56;
    if (fresh) build(v);
    skinBoard();
    updatePanel(v);
    if (v.last && v.last.n !== lastN) {
      const L = v.last; lastN = L.n;
      rollDice(L.dice, L.type === 'roll');
      if (L.type === 'move') animateMove(L, v);
      else placeAll(v);
    } else if (!anim) placeAll(v);
    if (v.stage === 'over' && lastStage !== 'over') showEnd(v);
    lastStage = v.stage;
  }

  // ── construction du plateau ──
  function build(v) {
    key = v.gameKey; lastN = -1; anim = null; lastStage = '';
    const used = new Set(v.seats.map(s => s.color));
    let board = '';
    // écuries (coins)
    [[0, 0, 0], [0, 9, 1], [9, 9, 2], [9, 0, 3]].forEach(([r, c, k]) => {
      const seat = v.seats.find(s => s.color === k);
      board += `<div class="pc-stable ${used.has(k) ? '' : 'off'}" style="--r:${r};--c:${c};--k:${HEX[k]}"><div class="pc-yard"></div>
        ${seat ? `<div class="pc-owner">${seat.bot ? '🤖' : esc(seat.avatar || '')} ${esc(seat.name)}</div>` : ''}</div>`;
    });
    // cases du parcours
    const ARROW = ['→', '↓', '←', '↑'];
    TRACK.forEach(([r, c], i) => {
      const st = START.indexOf(i), gt = GATE.indexOf(i);
      const k = st >= 0 ? st : gt;
      board += `<div class="pc-cell ${st >= 0 ? 'start' : ''} ${gt >= 0 ? 'gate' : ''}" style="--r:${r};--c:${c};${k >= 0 ? `--k:${HEX[k]}` : ''}">${st >= 0 ? '★' : gt >= 0 ? ARROW[gt] : ''}</div>`;
    });
    board += '<div class="pc-center"><i></i></div>';
    HOME.forEach((cells, k) => cells.forEach(([r, c], j) => { board += `<div class="pc-cell home" style="--r:${r};--c:${c};--k:${HEX[k]}">${v.ladder ? j + 1 : j === 4 ? '▲' : ''}</div>`; }));
    if (v.ladder) STEP6.forEach(([r, c], k) => { board += `<div class="pc-cell home step6" style="--r:${r};--c:${c};--k:${HEX[k]}">6</div>`; });
    // pions
    let tokens = '';
    v.seats.forEach((s, si) => v.horses[si].forEach((_, h) => {
      tokens += `<button class="pc-tok" id="tok-${si}-${h}" data-s="${si}" data-h="${h}" style="--k:${s.hex}"></button>`;
    }));
    $('#v-horses').innerHTML = `
      <div class="uc-head">
        <span class="pill big pc-pill">🐎 Petits chevaux</span>
        <span class="pill">${v.mode === 'auto' ? '🎲 100 % hasard' : '🧠 Tu choisis ton cheval'}</span>
        <span class="pill">${v.nHorses} chevaux chacun</span>${v.ladder ? '<span class="pill">🪜 Échelle 1→6</span>' : ''}
        ${isHost() ? '<button class="btn btn-ghost btn-sm pc-push" id="pc-stop">🏠 Salon</button>' : ''}
      </div>
      <div class="pc-main">
        <div class="pc-boardwrap"><div class="pc-board" id="pc-board">${board}<div class="pc-tokens">${tokens}</div><div class="pc-fx" id="pc-fx"></div></div></div>
        <aside class="pc-side">
          <div class="pc-turn" id="pc-turn"></div>
          <div class="pc-dicebox"><div class="pc-dice" id="pc-dice"></div><button class="btn btn-primary btn-xl pc-roll" id="pc-roll">🎲 Lancer le dé</button></div>
          <div class="uc-timer pc-timer" id="pc-timer"><i></i><span></span></div>
          <div class="pc-seats" id="pc-seats"></div>
          <ul class="pc-log" id="pc-log"></ul>
        </aside>
      </div>
      <div id="pc-end"></div>`;
    $$('#v-horses .pc-tok').forEach(t => {
      skin(t, v.seats[+t.dataset.s]);
      t.addEventListener('click', () => { if (V.phase === 'move' && V.me === V.turn && +t.dataset.s === V.me) gAct('move', +t.dataset.h); });
    });
    $('#pc-roll').addEventListener('click', () => { $('#pc-roll').disabled = true; gAct('roll'); });
    $('#pc-stop')?.addEventListener('click', () => socket.emit('stop'));
    face($('#pc-dice'), 6);
    placeAll(v);
  }

  function skin(el, seat) {
    const sk = SHOP.pawns.find(x => x.id === seat.skin) || SHOP.pawns[0];
    el.className = `pc-tok sk-${sk.id} ${sk.fx ? 'fx-' + sk.fx : ''} ${sk.anim ? 'an-' + sk.anim : ''}`;
    el.innerHTML = `<span>${sk.emoji}</span>`;
  }

  const pos = (el, [r, c]) => { el.style.setProperty('--r', r); el.style.setProperty('--c', c); };
  function placeAll(v) {
    v.seats.forEach((s, si) => v.horses[si].forEach((rel, h) => {
      const el = $(`#tok-${si}-${h}`); if (!el) return;
      pos(el, cellOf(s.color, rel, h, v.nHorses));
      el.classList.toggle('done', rel === v.finish);
    }));
    stackOffsets(v);
  }
  // deux pions sur la même case (le temps d'une capture) : léger décalage
  function stackOffsets() {
    const seen = {};
    $$('#v-horses .pc-tok').forEach(t => { const k = t.style.getPropertyValue('--r') + ',' + t.style.getPropertyValue('--c'); seen[k] = (seen[k] || 0) + 1; t.style.setProperty('--o', seen[k] - 1); });
  }

  function animateMove(L, v) {
    const seat = v.seats[L.seat], el = $(`#tok-${L.seat}-${L.h}`);
    // tous les autres pions à leur place (sauf les capturés, qui partent après l'impact)
    const capturedKeys = new Set(L.captures.map(c => `${c.seat}-${c.h}`));
    v.seats.forEach((s, si) => v.horses[si].forEach((rel, h) => {
      if ((si === L.seat && h === L.h) || capturedKeys.has(`${si}-${h}`)) return;
      const t = $(`#tok-${si}-${h}`); if (t) pos(t, cellOf(s.color, rel, h, v.nHorses));
    }));
    const steps = L.from === -1 ? [0] : Array.from({ length: L.to - L.from }, (_, i) => L.from + 1 + i);
    clearInterval(anim); let i = 0;
    el.classList.add('moving');
    if (L.from === -1) { el.classList.add('v-out'); setTimeout(() => el.classList.remove('v-out'), 600); }
    anim = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(anim); anim = null; el.classList.remove('moving');
        const here = cellOf(seat.color, L.to, L.h, v.nHorses);
        if (L.to === v.finish) {
          el.classList.add('v-win'); setTimeout(() => el.classList.remove('v-win'), 1400);
          playFx('finish', seat.fx, cellOf(seat.color, v.ladder ? 56 : 55, L.h, v.nHorses), seat.hex);
          if (seat.pid === pid) burst('fireworks', 10);
          setTimeout(() => el.classList.add('done'), 900);
        } else if (v.ladder && L.to > 50) { el.classList.add('v-step'); setTimeout(() => el.classList.remove('v-step'), 600); sfx('pop', .6); }
        if (L.captures.length) {
          const it = playFx('capture', seat.fx, here, seat.hex);
          const delay = ['meteor', 'dragon'].includes(it.special) ? 560 : 220;
          L.captures.forEach(c => setTimeout(() => victim(c, it.victim || 'spin', v), delay));
        }
        if (!L.captures.length) placeAll(V);
        return;
      }
      pos(el, cellOf(seat.color, steps[i], L.h, v.nHorses)); sfx('pop', .35); i++;
    }, 140);
  }

  // le pion mangé : petite cinématique selon l'animation de l'attaquant, puis retour à l'écurie
  function victim(c, kind, v) {
    const t = $(`#tok-${c.seat}-${c.h}`); if (!t) return;
    const home = cellOf(v.seats[c.seat].color, -1, c.h, v.nHorses);
    const PH = { spin: 0, launch: 650, burn: 600, zap: 520, suck: 650 };
    t.classList.add('v-' + kind);
    setTimeout(() => {
      t.classList.remove('v-' + kind);
      if (kind === 'launch' || kind === 'suck') { t.classList.add('v-teleport'); pos(t, home); void t.offsetWidth; t.classList.remove('v-teleport'); t.classList.add('v-drop'); setTimeout(() => t.classList.remove('v-drop'), 700); }
      else { t.classList.add('bumped'); if (kind === 'burn') t.classList.add('sooty'); pos(t, home); setTimeout(() => t.classList.remove('bumped'), 700); setTimeout(() => t.classList.remove('sooty'), 2200); }
      setTimeout(() => placeAll(V), 750);
    }, PH[kind] ?? 0);
  }

  // ── animations (capture / cheval rentré) ──
  const rnd = (a, b) => a + Math.random() * (b - a);
  function node(layer, cls, r, c, html = '', extra = {}) {
    const d = document.createElement('div');
    d.className = 'pf ' + cls; d.innerHTML = html;
    d.style.setProperty('--r', r); d.style.setProperty('--c', c);
    for (const [k, val] of Object.entries(extra)) d.style.setProperty(k, val);
    layer.appendChild(d); setTimeout(() => d.remove(), 2800);
    return d;
  }
  const later = (ms, fn) => setTimeout(fn, ms);
  function playFx(type, fxId, [r, c], hex, layer = $('#pc-fx')) {
    const it = SHOP.pcfx.find(x => x.id === fxId) || SHOP.pcfx[0];
    if (!layer) return it;
    const rar = it.price ? SHOP.rarity(it.price) : 'free';
    layer.style.setProperty('--fc', it.color); layer.style.setProperty('--pk', hex || it.color);
    const parts = [...it.parts];
    const big = rar === 'legendary' ? 1.5 : rar === 'epic' ? 1.25 : 1;
    const impact = type === 'capture' && ['meteor', 'dragon'].includes(it.special) ? 500 : 0;
    const board = layer.closest('.pc-board');
    if (type === 'finish') {
      node(layer, 'pf-beam', r, c);
      node(layer, 'pf-ring', r, c, '', { '--d': '0s' }); node(layer, 'pf-ring', r, c, '', { '--d': '.18s' });
      node(layer, 'pf-text fin', r, c, '🏁 RENTRÉ !');
      for (let k = 0; k < 14 * big; k++) node(layer, 'pf-part', r, c, parts[k % parts.length], { '--dx': rnd(-3, 3) * big + '', '--dy': rnd(-3.6, -.5) * big + '', '--rot': rnd(-360, 360) + 'deg', '--d': rnd(0, .25) + 's' });
      if (rar === 'legendary') node(layer, 'pf-cosmic small', r, c);
      sfx('legend');
      return it;
    }
    // capture
    const sp = it.special;
    if (sp === 'meteor') node(layer, 'pf-meteor', r, c, it.emoji);
    if (sp === 'dragon') { node(layer, 'pf-dragon', r, c, '🐉'); later(250, () => node(layer, 'pf-breath', r, c)); }
    if (sp === 'bolt') { node(layer, 'pf-bolt', r, c); later(90, () => node(layer, 'pf-bolt b2', r, c)); }
    later(impact, () => {
      if (board && type === 'capture') { board.classList.remove('shake-hard'); void board.offsetWidth; board.classList.add('shake-hard'); }
      if (it.flash && board) { const f = document.createElement('div'); f.className = 'pf-flash'; f.style.setProperty('--fl', it.flash); board.appendChild(f); setTimeout(() => f.remove(), 700); }
      if (sp === 'comic') node(layer, 'pf-comic', r, c);
      if (sp === 'dust') for (let k = 0; k < 7; k++) node(layer, 'pf-puff', r, c, '', { '--dx': Math.cos(k / 7 * 6.28) * 1.4 + '', '--dy': Math.sin(k / 7 * 6.28) * 1.1 + '', '--d': rnd(0, .1) + 's' });
      if (sp === 'vortex') node(layer, 'pf-vortex', r, c);
      if (sp === 'splash') { node(layer, 'pf-wave', r, c); node(layer, 'pf-wave', r, c, '', { '--d': '.2s' }); }
      if (sp === 'flame' || sp === 'meteor' || sp === 'dragon') { node(layer, 'pf-fireball', r, c); node(layer, 'pf-smoke', r, c, '', { '--d': '.25s' }); }
      if (sp === 'hole') node(layer, 'pf-hole', r, c);
      if (sp === 'cosmic') { node(layer, 'pf-cosmic', r, c); node(layer, 'pf-cosmic', r, c, '', { '--d': '.25s' }); }
      if (sp === 'rain') for (let k = 0; k < 16; k++) node(layer, 'pf-fall', r, c, parts[k % parts.length], { '--dx': rnd(-2.2, 2.2) + '', '--d': rnd(0, .6) + 's' });
      node(layer, 'pf-ring', r, c, '', { '--d': '0s' }); node(layer, 'pf-ring', r, c, '', { '--d': '.15s' });
      if (sp !== 'rain') for (let k = 0; k < 12 * big; k++) {
        const a = rnd(0, 6.28), d = rnd(1.2, 2.8) * big;
        node(layer, 'pf-part', r, c, parts[k % parts.length], { '--dx': Math.cos(a) * d + '', '--dy': Math.sin(a) * d + '', '--rot': rnd(-400, 400) + 'deg', '--d': rnd(0, .12) + 's' });
      }
      node(layer, 'pf-text', r, c, esc(it.text), { '--tilt': rnd(-12, 12) + 'deg' });
      sfx(rar === 'legendary' || rar === 'epic' ? 'legend' : 'buzzer', .6);
    });
    return it;
  }
  // aperçu dans la boutique
  function demo(fxId) {
    let lay = $('#pf-demo');
    if (!lay) { lay = document.createElement('div'); lay.id = 'pf-demo'; lay.innerHTML = '<div class="pc-fx"></div>'; document.body.appendChild(lay); }
    playFx('capture', fxId, [0, 0], '#ffc21a', lay.firstChild);
    setTimeout(() => playFx('finish', fxId, [0, 0], '#ffc21a', lay.firstChild), 1900);
  }
  function skinBoard() {
    const b = $('#pc-board'); if (!b) return;
    const id = save.look.board || 'bois';
    b.style.setProperty('--U', b.clientWidth / 15 + 'px');
    b.className = b.className.replace(/\bbd-\S+/g, '').trim() + ' bd-' + id;
  }

  const bump = () => { const b = $('#pc-board'); b.classList.remove('shake-hard'); void b.offsetWidth; b.classList.add('shake-hard'); };

  // ── dé ──
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function face(el, n) { el.innerHTML = Array.from({ length: 9 }, (_, k) => `<i class="${PIPS[n].includes(k) ? 'on' : ''}"></i>`).join(''); }
  function rollDice(n, fresh) {
    const el = $('#pc-dice'); if (!el || !n) return;
    if (!fresh) return face(el, n);
    el.classList.add('rolling'); sfx('scratch', .5);
    let k = 0; const iv = setInterval(() => { face(el, 1 + Math.floor(Math.random() * 6)); if (++k > 6) { clearInterval(iv); face(el, n); el.classList.remove('rolling'); if (n === 6) el.classList.add('six'), setTimeout(() => el.classList.remove('six'), 900); } }, 70);
  }

  // ── panneau ──
  function updatePanel(v) {
    const cur = v.seats[v.turn], mine = v.me === v.turn && v.stage === 'play';
    $('#pc-turn').innerHTML = v.stage === 'over' ? '🏁 Partie terminée'
      : `<span class="dot" style="--k:${cur.hex}"></span>${mine ? '<b>À toi de jouer !</b>' : `C'est à <b>${esc(cur.name)}</b>`}${v.phase === 'move' && mine ? '<small>Clique sur le cheval à déplacer</small>' : ''}`;
    $('#pc-turn').style.setProperty('--k', cur.hex);
    $('#pc-turn').classList.toggle('mine', mine);
    const canRoll = mine && v.phase === 'roll';
    $('#pc-roll').disabled = !canRoll;
    $('#pc-roll').classList.toggle('ready', canRoll);
    $('#pc-roll').textContent = canRoll ? '🎲 Lancer le dé' : v.stage === 'over' ? '🏁 Fin' : mine ? '⏳…' : '🎲 Patiente…';
    if (canRoll && lastStage === 'play') sfx('pop');
    $$('#v-horses .pc-tok').forEach(t => t.classList.toggle('pick', v.phase === 'move' && mine && +t.dataset.s === v.me && v.legal.includes(+t.dataset.h)));
    $('#pc-seats').innerHTML = v.seats.map((s, k) => {
      const p = P(s.pid);
      return `<div class="pc-seat ${k === v.turn && v.stage === 'play' ? 'cur' : ''} ${k === v.me ? 'me' : ''}" style="--k:${s.hex}">
        ${p ? avatarHTML(p, 32) : '<span class="bot">🤖</span>'}<div><span>${p ? nameHTML(p) : esc(s.name)}</span><small>${s.colorName}${s.online ? '' : ' · absent'}</small></div>
        <b>${'🏁'.repeat(s.home)}${'·'.repeat(v.nHorses - s.home)}</b>${s.captures ? `<em>💥${s.captures}</em>` : ''}</div>`;
    }).join('');
    $('#pc-log').innerHTML = v.log.map(l => `<li>${esc(l)}</li>`).join('');
    // minuteur du tour
    clearInterval(timerIv);
    const tEl = $('#pc-timer');
    if (mine && ['roll', 'move'].includes(v.phase)) {
      tEl.classList.remove('hidden');
      const end = Date.now() + v.left, total = v.phase === 'roll' ? 20000 : 15000;
      const tick = () => { const l = Math.max(0, end - Date.now()); tEl.querySelector('i').style.transform = `scaleX(${l / total})`; tEl.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; if (!l) clearInterval(timerIv); };
      tick(); timerIv = setInterval(tick, 250);
    } else tEl.classList.add('hidden');
  }

  function showEnd(v) {
    const W = v.seats[v.winner], meWon = v.winner === v.me;
    const wp = P(W.pid);
    $('#pc-end').innerHTML = `<div class="wd-endcard pc-endcard" style="--k:${W.hex}">
      <div class="wd-win">${wp ? avatarHTML(wp, 80) : '<span class="big-em">🤖</span>'}<h2>${esc(W.name)} gagne la course !</h2><p class="muted">Tous ses chevaux sont rentrés à l'écurie centrale 🏁</p></div>
      <div class="wd-rank">${v.ranking.map((k, i) => { const s = v.seats[k], p = P(s.pid); return `<div class="row ${k === v.me ? 'me' : ''}"><b>${i + 1}</b><span class="dot" style="--k:${s.hex}"></span>${p ? nameHTML(p) : esc(s.name)}<em>${s.home}/${v.nHorses} rentrés${s.captures ? ' · 💥' + s.captures : ''}</em>${k === v.me && v.coins ? `<strong>+${v.coins.coins} 🪙</strong>` : ''}</div>`; }).join('')}</div>
      <div class="end-actions">${isHost() ? '<button class="btn btn-primary" id="pc-replay">🔁 Revanche</button><button class="btn btn-yellow" id="pc-lobby">🏠 Salon</button>' : '<p class="muted">L\'hôte peut lancer une revanche.</p>'}
      <button class="btn btn-shop" id="pc-shop">🐎 Pions</button><button class="btn btn-shop" id="pc-shop2">🎲 Plateaux</button><button class="btn btn-shop" id="pc-shop3">💥 Animations</button></div></div>`;
    $('#pc-replay')?.addEventListener('click', () => gAct('replay'));
    $('#pc-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $('#pc-shop')?.addEventListener('click', () => { shopTab = 'pawns'; openShop(); });
    $('#pc-shop2')?.addEventListener('click', () => { shopTab = 'boards'; openShop(); });
    $('#pc-shop3')?.addEventListener('click', () => { shopTab = 'pcfx'; openShop(); });
    if (meWon) { burst(save.look.winFx, 34); sfx('legend'); setTimeout(() => sfx('legend'), 300); }
    $('#pc-end').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  window.addEventListener('resize', () => skinBoard());
  window.HORSES = { render, demo, skinBoard, fx: playFx };
})();
