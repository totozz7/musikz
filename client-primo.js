// PLAYZUP — client « PRIMO ! » (jeu de cartes de défausse). Utilise app.js : $, $$, esc, avatarHTML, nameHTML, state, pid, gAct, sfx, burst, toast…
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const HEX = { R: '#ff3b5c', Y: '#ffc21a', G: '#22d38a', B: '#2f8bff', W: '#b46bff' };
  const CN = { R: 'Rouge', Y: 'Jaune', G: 'Vert', B: 'Bleu' };
  let V = null, key = null, lastEv = 0, timerIv = null, prevHand = new Set(), queue = Promise.resolve();
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // ── dessin des cartes ──
  function sym(c) {
    if (/^\d$/.test(c.v)) return { t: c.v, big: c.v };
    return { skip: { t: '⊘', big: '⊘' }, rev: { t: '⇄', big: '⇄' }, p2: { t: '+2', big: '+2' }, p4: { t: '+4', big: '+4' }, p6: { t: '+6', big: '+6' }, wild: { t: '✦', big: '✦' } }[c.v] || { t: '★', big: '★' };
  }
  function cardHTML(c, cls = '', extra = '') {
    if (!c) return `<div class="pm-card back ${cls}" ${extra}><span class="pm-logo">PRIMO<b>!</b></span></div>`;
    const sp = V?.specials?.[c.v];
    if (sp) return `<div class="pm-card sp c-${c.c} ${cls}" data-id="${c.id}" ${extra} title="${esc(sp.n)} : ${esc(sp.d)}">
      <span class="pm-band"></span><span class="pm-emo">${sp.e}</span><span class="pm-sn">${esc(sp.n)}</span><span class="pm-holo"></span></div>`;
    const s = sym(c);
    return `<div class="pm-card c-${c.c} v-${c.v} ${cls}" data-id="${c.id}" ${extra}>
      <span class="pm-c tl">${s.t}</span><span class="pm-med"><b>${s.big}</b></span><span class="pm-c br">${s.t}</span>${c.c === 'W' ? '<span class="pm-quad"></span>' : ''}<span class="pm-shine"></span></div>`;
  }
  window.PRIMO_CARD = cardHTML;

  function seatPos(v, k) {
    const n = v.seats.length, me = v.me >= 0 ? v.me : 0, i = (k - me + n) % n;
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    const narrow = ($('#pm-table')?.clientWidth || 800) < 560;
    return { x: 50 + (narrow ? 39 : 45) * Math.cos(a), y: 50 + (narrow ? 40 : 41) * Math.sin(a) };
  }

  function build() {
    $('#v-primo').innerHTML = `
      <div class="pm-room" id="pm-room">
        <div class="pm-glow" id="pm-glow"></div>
        <header class="pm-top"><div class="pm-title">PRIMO<b>!</b></div><div class="pm-chips" id="pm-chips"></div></header>
        <div class="pm-table" id="pm-table">
          <div class="pm-felt"></div>
          <div class="pm-dir" id="pm-dir"><i>➜</i><i>➜</i><i>➜</i><i>➜</i></div>
          <div class="pm-center">
            <div class="pm-deck" id="pm-deck" title="Piocher"></div>
            <div class="pm-pile" id="pm-pile"></div>
          </div>
          <div class="pm-pending" id="pm-pending"></div>
          <div id="pm-seats"></div>
          <div class="pm-fx" id="pm-fx"></div>
        </div>
        <div class="pm-handbar">
          <div class="pm-turnrow"><div class="pm-turn" id="pm-turn"></div><div class="pm-timer hidden" id="pm-timer"><i></i><span></span></div></div>
          <div class="pm-actions" id="pm-actions"></div>
          <div class="pm-hand" id="pm-hand"></div>
        </div>
        <div class="pm-bottom"><ul class="pm-log" id="pm-log"></ul><div class="pm-legend" id="pm-legend"></div></div>
        <div class="pm-modal hidden" id="pm-modal"></div>
        <div class="pm-spy hidden" id="pm-spy"></div>
        <div id="pm-end"></div>
      </div>`;
    $('#pm-deck').onclick = () => { if (V?.turn === V?.me && V.phase === 'turn') gAct('draw'); };
  }

  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); lastEv = v.events.length ? v.events[0].id - 1 : 0; prevHand = new Set(); }
    drawTop(v); drawSeats(v); drawCenter(v); drawHand(v); drawSide(v); drawSpy(v);
    const evs = v.events.filter(e => e.id > lastEv);
    if (evs.length) { lastEv = evs[evs.length - 1].id; evs.forEach(e => { queue = queue.then(() => anim(e, v)).catch(() => {}); }); }
    if (v.stage === 'over') showEnd(v); else $('#pm-end').innerHTML = '';
  }

  function drawTop(v) {
    $('#pm-chips').innerHTML = `${v.chaos ? '<span class="pm-chip chaos">🤪 Pagaille</span>' : '<span class="pm-chip">🃏 Classique</span>'}${v.stack ? '<span class="pm-chip">➕ Cumul</span>' : ''}<span class="pm-chip">🂠 ${v.deck}</span>`;
    const col = HEX[v.color] || '#888';
    $('#pm-room').style.setProperty('--cc', col);
    $('#pm-dir').classList.toggle('ccw', v.dir < 0);
  }

  function drawSeats(v) {
    $('#pm-seats').innerHTML = v.seats.map((s, k) => {
      const p = P(s.pid), pos = seatPos(v, k), cur = v.stage === 'play' && v.turn === k;
      const n = Math.min(s.n, 12);
      const fan = Array.from({ length: n }, (_, i) => `<i style="--i:${(i - (n - 1) / 2).toFixed(2)}"></i>`).join('');
      return `<div class="pm-seat ${cur ? 'cur' : ''} ${k === v.me ? 'me' : ''} ${s.frozen ? 'frozen' : ''} ${s.n === 1 ? 'last' : ''} ${s.online ? '' : 'off'}" id="pm-seat-${k}" style="left:${pos.x}%;top:${pos.y}%">
        <div class="pm-fan">${fan}</div>
        <div class="pm-av">${p ? avatarHTML(p, 50) : `<span class="pm-bot">🤖</span>`}${s.frozen ? `<span class="pm-ice">🧊<b>${s.frozen}</b></span>` : ''}</div>
        <div class="pm-nm">${p ? nameHTML(p) : esc(s.name)}</div>
        <div class="pm-n ${s.n <= 2 ? 'hot' : ''}">${s.n} carte${s.n > 1 ? 's' : ''}${s.primo ? ' · 📣' : ''}</div>
      </div>`;
    }).join('');
  }

  function drawCenter(v) {
    $('#pm-deck').innerHTML = cardHTML(null, 'deckc') + cardHTML(null, 'deckc d2') + cardHTML(null, 'deckc d3');
    $('#pm-deck').classList.toggle('can', v.turn === v.me && v.phase === 'turn' && v.stage === 'play');
    const under = (v.under || []).map((c, i) => cardHTML(c, 'under', `style="--r:${((c.id * 37) % 50) - 25}deg;--x:${((c.id * 13) % 20) - 10}px;--y:${((c.id * 7) % 16) - 8}px"`)).join('');
    $('#pm-pile').innerHTML = under + (v.top ? cardHTML(v.top, 'topc', `style="--r:${((v.top.id * 37) % 30) - 15}deg"`) : '');
    $('#pm-pile').style.setProperty('--cc', HEX[v.color]);
    const pd = $('#pm-pending');
    pd.innerHTML = v.pending ? `<b>+${v.pending.n}</b><small>en attente !</small>` : '';
    pd.classList.toggle('on', !!v.pending);
  }

  function drawHand(v) {
    const hand = v.hand || [], n = hand.length;
    const set = new Set(hand.map(c => c.id));
    const fresh = hand.filter(c => !prevHand.has(c.id)).map(c => c.id);
    $('#pm-hand').innerHTML = hand.map((c, i) => cardHTML(c, `inh ${v.playable.includes(c.id) ? 'ok' : v.turn === v.me && v.stage === 'play' ? 'no' : ''} ${fresh.includes(c.id) && prevHand.size ? 'new' : ''} ${v.drawn === c.id ? 'drawn' : ''}`,
      `style="--i:${(i - (n - 1) / 2).toFixed(2)};--d:${(fresh.indexOf(c.id) * 80)}ms"`)).join('') || (v.me >= 0 ? '' : '<p class="pm-spect">👀 Tu regardes la partie</p>');
    prevHand = set;
    // on resserre l'éventail pour que toute la main tienne à l'écran
    const hEl = $('#pm-hand'), first = hEl.querySelector('.pm-card');
    if (first && n > 1) {
      const cw = first.offsetWidth, avail = hEl.clientWidth - 24;
      const ov = Math.min(-10, Math.floor((avail - n * cw) / (n - 1)));
      hEl.style.setProperty('--ov', Math.max(ov, -cw + 14) + 'px');
    }
    $$('#pm-hand .pm-card').forEach(el => el.onclick = () => tryPlay(+el.dataset.id, el));
    // boutons
    const me = v.seats[v.me], mine = v.turn === v.me && v.stage === 'play';
    const a = [];
    if (mine && v.phase === 'turn') a.push(`<button class="btn pm-draw" id="pm-bdraw">${v.pending ? `😱 Piocher ${v.pending.n}` : '🂠 Piocher'}</button>`);
    if (mine && v.phase === 'drawn') a.push('<button class="btn btn-ghost" id="pm-bpass">Garder et passer ⏭</button>');
    if (me && me.n <= 2 && !me.primo && v.stage === 'play') a.push('<button class="btn pm-primo" id="pm-bprimo">📣 PRIMO !</button>');
    if (v.watch !== null && v.watch !== v.me && v.stage === 'play') a.push(`<button class="btn pm-catch" id="pm-bcatch">🚨 ${esc(v.seats[v.watch].name)} a oublié PRIMO !</button>`);
    $('#pm-actions').innerHTML = a.join('');
    $('#pm-bdraw')?.addEventListener('click', () => gAct('draw'));
    $('#pm-bpass')?.addEventListener('click', () => gAct('pass'));
    $('#pm-bprimo')?.addEventListener('click', () => { gAct('primo'); sfx('legend', .5); });
    $('#pm-bcatch')?.addEventListener('click', () => gAct('catch', v.watch));
  }

  async function tryPlay(id, el) {
    const v = V, c = v.hand.find(x => x.id === id);
    if (!v.playable.includes(id)) { el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); sfx('buzzer', .25); return; }
    let color, target;
    if (c.c === 'W') { color = await pickColor(); if (!color) return; }
    const sp = v.specials?.[c.v];
    if (sp?.target) { target = await pickTarget(sp); if (target === null) return; }
    const r = rect(el);
    flyFromRect(r, $('#pm-pile'), cardHTML(c), 0, 'play');
    el.style.visibility = 'hidden';
    const res = await gAct('play', { id, color, target });
    if (res?.error) { toast(res.error, 'error'); el.style.visibility = ''; }
  }
  function pickColor() {
    return new Promise(res => {
      const m = $('#pm-modal');
      m.innerHTML = `<div class="pm-pick"><h3>🎨 Choisis la couleur</h3><div class="pm-colors">${['R', 'Y', 'G', 'B'].map(c => `<button class="pm-col" data-c="${c}" style="--k:${HEX[c]}"><span>${CN[c]}</span></button>`).join('')}</div><button class="btn btn-ghost" data-c="">Annuler</button></div>`;
      m.classList.remove('hidden');
      m.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { m.classList.add('hidden'); res(b.dataset.c || null); });
    });
  }
  function pickTarget(sp) {
    return new Promise(res => {
      const m = $('#pm-modal'), v = V;
      m.innerHTML = `<div class="pm-pick"><h3>${sp.e} ${esc(sp.n)}</h3><p>${esc(sp.d)} — qui vises-tu ?</p><div class="pm-targets">${v.seats.map((s, k) => k === v.me ? '' : `<button class="pm-tg" data-k="${k}">${P(s.pid) ? avatarHTML(P(s.pid), 40) : '<span class="pm-bot">🤖</span>'}<b>${esc(s.name)}</b><small>${s.n} carte${s.n > 1 ? 's' : ''}</small></button>`).join('')}</div><button class="btn btn-ghost" data-k="">Annuler</button></div>`;
      m.classList.remove('hidden');
      m.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { m.classList.add('hidden'); res(b.dataset.k === '' ? null : +b.dataset.k); });
    });
  }

  function drawSide(v) {
    const cur = v.seats[v.turn], mine = v.turn === v.me && v.stage === 'play' && ['turn', 'drawn'].includes(v.phase);
    $('#pm-turn').innerHTML = v.stage === 'over' ? '🏁 Partie terminée'
      : v.phase === 'deal' ? '🃏 Distribution…'
      : mine ? (v.phase === 'drawn' ? '<b>Tu peux jouer la carte piochée</b> (ou la garder)' : v.pending ? `<b>À toi !</b> +${v.pending.n} en attente : contre-attaque ou pioche !` : '<b>À toi de jouer !</b> Pose une carte ou pioche.')
      : `C'est à <b>${esc(cur.name)}</b>…`;
    $('#pm-turn').classList.toggle('mine', mine);
    $('#pm-turn').style.setProperty('--cc', HEX[v.color]);
    $('#pm-log').innerHTML = v.log.map(l => `<li>${esc(l)}</li>`).join('');
    $('#pm-legend').innerHTML = v.specials ? `<h4>🤪 Cartes Pagaille</h4>${Object.entries(v.specials).map(([k, s]) => `<span><i>${s.e}</i><b>${esc(s.n)}</b> ${esc(s.d)}</span>`).join('')}` : '';
    clearInterval(timerIv);
    const tEl = $('#pm-timer');
    if (mine && ['turn', 'drawn'].includes(v.phase)) {
      tEl.classList.remove('hidden');
      const end = Date.now() + v.left, total = v.phase === 'drawn' ? Math.min(v.time, 12000) : v.time;
      const tick = () => { const l = Math.max(0, end - Date.now()); tEl.querySelector('i').style.transform = `scaleX(${l / total})`; tEl.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; if (!l) clearInterval(timerIv); };
      tick(); timerIv = setInterval(tick, 250);
      document.title = '🃏 À toi ! — PlayZup';
    } else { tEl.classList.add('hidden'); document.title = 'PlayZup'; }
  }

  function drawSpy(v) {
    const el = $('#pm-spy');
    if (!v.spy) { el.classList.add('hidden'); return; }
    el.innerHTML = `<h4>👁️ Main de ${esc(v.seats[v.spy.target].name)}</h4><div class="pm-spyh">${v.spy.hand.map(c => cardHTML(c, 'mini')).join('')}</div>`;
    el.classList.remove('hidden');
    clearTimeout(drawSpy.t); drawSpy.t = setTimeout(() => el.classList.add('hidden'), v.spy.until);
  }

  // ── animations ──
  const rect = (el) => el.getBoundingClientRect();
  const seatEl = (k) => $('#pm-seat-' + k);
  const handEl = () => $('#pm-hand');
  function target(k) { return k === V.me ? handEl() : seatEl(k); }
  function flyFromRect(a, toEl, html, delay = 0, cls = '') {
    const box = rect($('#pm-table')), b = rect(toEl), d = document.createElement('div');
    d.className = 'pm-fly ' + cls; d.innerHTML = html;
    d.style.left = (a.left + a.width / 2 - box.left) + 'px'; d.style.top = (a.top + a.height / 2 - box.top) + 'px';
    d.style.setProperty('--dx', (b.left + b.width / 2 - a.left - a.width / 2) + 'px');
    d.style.setProperty('--dy', (b.top + b.height / 2 - a.top - a.height / 2) + 'px');
    d.style.setProperty('--rot', (Math.random() * 50 - 25) + 'deg');
    d.style.animationDelay = delay + 'ms';
    $('#pm-fx').appendChild(d); setTimeout(() => d.remove(), 800 + delay);
  }
  const fly = (fromEl, toEl, html, delay, cls) => fromEl && toEl && flyFromRect(rect(fromEl), toEl, html, delay, cls);
  function pop(k, html, cls = '', ms = 1800) {
    const pos = k === null ? { x: 50, y: 50 } : seatPos(V, k), b = document.createElement('div');
    b.className = 'pm-pop ' + cls; b.innerHTML = html; b.style.left = pos.x + '%'; b.style.top = pos.y + '%';
    $('#pm-fx').appendChild(b); setTimeout(() => b.remove(), ms);
  }
  function banner(html, cls = '', ms = 1900) {
    const b = document.createElement('div'); b.className = 'pm-banner ' + cls; b.innerHTML = html;
    $('#pm-fx').appendChild(b); setTimeout(() => b.remove(), ms);
  }
  function rain(fromK, toK, n, gap = 70) { for (let i = 0; i < n; i++) fly(fromK === 'deck' ? $('#pm-deck') : target(fromK), toK === 'deck' ? $('#pm-deck') : target(toK), cardHTML(null, 'mini'), i * gap, 'draw'); }
  function shake(el) { if (!el) return; el.classList.remove('shake2'); void el.offsetWidth; el.classList.add('shake2'); }
  function wave(color) { const w = document.createElement('div'); w.className = 'pm-wave'; w.style.setProperty('--k', HEX[color]); $('#pm-fx').appendChild(w); setTimeout(() => w.remove(), 1100); }

  async function anim(e, v) {
    if (!$('#pm-fx')) return;
    switch (e.type) {
      case 'deal': {
        banner('<b>PRIMO<em>!</em></b><small>Distribution…</small>', 'logo', 2200);
        sfx('drum', .5);
        v.seats.forEach((s, k) => { for (let i = 0; i < 7; i++) setTimeout(() => { fly($('#pm-deck'), target(k), cardHTML(null, 'mini'), 0, 'draw'); if (!k) sfx('card', .25); }, i * 110 + k * 30); });
        await wait(1200); break;
      }
      case 'play': {
        if (e.seat !== v.me) { fly(seatEl(e.seat), $('#pm-pile'), cardHTML(e.card), 0, 'play'); }
        sfx('card', .9);
        await wait(380);
        const pile = $('#pm-pile'); pile.classList.remove('slam'); void pile.offsetWidth; pile.classList.add('slam');
        if (e.card.c === 'W') { wave(e.color); sfx('legend', .5); pop(null, `<span class="pm-cname" style="--k:${HEX[e.color]}">${CN[e.color]} !</span>`, 'big', 1400); }
        if (['p4', 'p6'].includes(e.card.v)) shake($('#pm-table'));
        break;
      }
      case 'skip': pop(e.seat, '<span class="pm-stamp">⊘ PASSE !</span>', 'stamp', 1500); sfx('stamp'); shake(seatEl(e.seat)); break;
      case 'rev': banner('<span class="pm-rev">⇄</span><small>Changement de sens !</small>', 'rev', 1500); sfx('spin', .7); break;
      case 'stack': banner(`<span class="pm-plus">+${e.n}</span><small>${e.n > 4 ? 'ÇA MONTE !!' : 'qui va piocher ?'}</small>`, 'plus', 1300); sfx(e.n > 4 ? 'legend' : 'pop'); shake($('#pm-table')); break;
      case 'draw': {
        if (!e.n) break;
        rain('deck', e.seat, Math.min(e.n, 10), e.n > 2 ? 60 : 0);
        sfx('card', .5);
        if (e.n >= 2) { pop(e.seat, `<span class="pm-hit">+${e.n}</span>`, 'hit', 1600); setTimeout(() => shake(seatEl(e.seat)), 300); if (e.n >= 4) sfx('buzzer', .5); }
        break;
      }
      case 'reshuffle': banner('<span>🔀</span><small>On remélange la pioche</small>', '', 1200); sfx('spin', .5); break;
      case 'primo': pop(e.seat, '<span class="pm-shout">PRIMO !</span>', 'shout', 1900); sfx('klaxon', .6); break;
      case 'caught': pop(e.seat, '<span class="pm-caught">🚨 PRIS ! +2</span>', 'shout', 2000); sfx('buzzer', .7); shake(seatEl(e.seat)); break;
      case 'frozen': pop(e.seat, '<span class="pm-icepop">🧊 Congelé !</span>', 'hit', 1300); sfx('click', .8); shake(seatEl(e.seat)); break;
      case 'special': await special(e, v); break;
      case 'win': {
        const w = v.seats[e.seat];
        banner(`<span>🏆</span><b>${esc(w.name)}</b><small>n'a plus de cartes !</small>`, 'win', 3000);
        if (e.seat === v.me) { burst(save.look.winFx, 40); sfx('legend'); setTimeout(() => sfx('legend'), 300); } else burst('party', 20);
        break;
      }
    }
  }

  async function special(e, v) {
    const sp = v.specials?.[e.kind]; if (!sp) return;
    const T = e.target, k = e.seat;
    banner(`<span class="pm-sp-e">${sp.e}</span><b>${esc(sp.n)}</b><small>${esc(sp.d)}</small>`, 'sp sp-' + e.kind, 1900);
    sfx('legend', .5);
    if (e.final) return;
    await wait(500);
    const others = v.seats.map((_, i) => i).filter(i => i !== k);
    switch (e.kind) {
      case 'swap': for (let i = 0; i < 5; i++) { fly(target(k), target(T), cardHTML(null, 'mini'), i * 60, 'arc'); fly(target(T), target(k), cardHTML(null, 'mini'), i * 60, 'arc2'); } sfx('spin', .6); break;
      case 'tornado': pop(null, '<span class="pm-tornado">🌪️</span>', 'tornado', 1800); v.seats.forEach((_, i) => { for (let j = 0; j < 3; j++) fly(target(i), target((i + v.dir + v.seats.length) % v.seats.length), cardHTML(null, 'mini'), j * 90, 'arc'); }); sfx('spin', .9); shake($('#pm-table')); break;
      case 'gift': case 'thief': rain(k, T, e.kind === 'gift' ? (e.n || 2) : 2, 110); if (e.kind === 'thief') fly(target(T), target(k), cardHTML(null, 'mini'), 0, 'arc'); pop(T, `<span class="pm-hit">${e.kind === 'gift' ? '🎁 +2' : '🧤 +1'}</span>`, 'hit', 1500); break;
      case 'bomb': pop(null, '<span class="pm-boom">💥</span>', 'boom', 1100); sfx('bang', .8); shake($('#pm-table')); others.forEach(i => rain('deck', i, 2, 80)); others.forEach(i => setTimeout(() => pop(i, '<span class="pm-hit">+2</span>', 'hit', 1300), 300)); break;
      case 'sniper': pop(T, '<span class="pm-scope"></span>', 'scope', 1500); await wait(800); sfx('bang', .5); rain('deck', T, 3, 80); pop(T, '<span class="pm-hit">+3</span>', 'hit', 1400); shake(seatEl(T)); break;
      case 'freeze': pop(T, '<span class="pm-icepop">❄️ GELÉ ×2</span>', 'hit', 1800); sfx('click', 1); shake(seatEl(T)); break;
      case 'mirror': if (e.back !== undefined) { pop(k, '<span class="pm-mirror">🪞</span>', 'boom', 1100); await wait(300); pop(e.back, `<span class="pm-hit">↩ +${e.n}</span>`, 'hit', 1600); shake(seatEl(e.back)); sfx('stamp'); } break;
      case 'clover': for (let i = 0; i < (e.n || 2); i++) fly(target(k), $('#pm-pile'), cardHTML(null, 'mini'), i * 150, 'play'); pop(k, '<span class="pm-luck">🍀✨</span>', 'boom', 1300); break;
      case 'dyn': pop(e.victim, '<span class="pm-fuse">🧨</span>', 'fuse', 1200); await wait(1000); pop(e.victim, '<span class="pm-boom">💥</span>', 'boom', 1000); sfx('bang', 1); shake($('#pm-table')); rain('deck', e.victim, 4, 70); pop(e.victim, '<span class="pm-hit">+4</span>', 'hit', 1500); break;
      case 'clean': pop(k, '<span class="pm-luck">🧹💨</span>', 'boom', 1300); for (let i = 0; i < Math.min(e.n || 0, 8); i++) fly(target(k), $('#pm-pile'), cardHTML(null, 'mini'), i * 90, 'play'); break;
      case 'roulette': (e.res || []).forEach((n, i) => { pop(i, `<span class="pm-slot"><b>${n ? '+' + n : '0'}</b></span>`, 'slot', 2200); if (n) setTimeout(() => rain('deck', i, n, 90), 900); }); sfx('spin', .8); break;
      case 'spy': pop(T, '<span class="pm-mirror">👁️</span>', 'boom', 1400); break;
      case 'charity': v.seats.forEach((_, i) => fly(target(i), target((i + v.dir + v.seats.length) % v.seats.length), cardHTML(null, 'mini'), i * 70, 'arc')); break;
      case 'again': pop(k, '<span class="pm-shout">👑 ENCORE !</span>', 'shout', 1500); break;
    }
    await wait(700);
  }

  function showEnd(v) {
    if ($('#pm-end').innerHTML) return;
    const w = v.seats[v.winner], wp = P(w.pid);
    $('#pm-end').innerHTML = `<div class="pm-endcard">
      <div class="pm-endtop">${wp ? avatarHTML(wp, 90) : '<span class="pm-bot big">🤖</span>'}<h2>${esc(w.name)}</h2><p>a vidé sa main — PRIMO GAGNÉ ! 🏆</p></div>
      <div class="pm-rank">${v.ranking.map((r, i) => { const s = v.seats[r.k], p = P(s.pid); return `<div class="row ${r.k === v.me ? 'me' : ''}"><b>${i ? i + 1 : '👑'}</b>${p ? nameHTML(p) : esc(s.name)}<em>${r.left} carte${r.left > 1 ? 's' : ''} · ${r.pts} pts</em>${r.k === v.me && v.coins ? `<strong>+${v.coins.coins} 🪙</strong>` : ''}</div>`; }).join('')}</div>
      <div class="end-actions">${isHost() ? '<button class="btn btn-primary" id="pm-replay">🔁 Revanche</button><button class="btn btn-yellow" id="pm-lobby">🏠 Salon</button>' : '<p class="muted">L\'hôte peut lancer une revanche.</p>'}<button class="btn btn-shop" id="pm-wheel">🎡 Roue de la chance</button></div></div>`;
    $('#pm-replay')?.addEventListener('click', () => gAct('replay'));
    $('#pm-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $('#pm-wheel')?.addEventListener('click', () => window.WHEEL?.open());
    setTimeout(() => $('#pm-end .pm-endcard')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 1500);
  }

  window.PRIMO = { render };
})();
