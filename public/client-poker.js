// PLAYZUP — client « Poker » : table ovale en feutre, cartes qui se retournent, jetons qui volent, barre d'actions avec curseur.
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const SUIT = { s: '♠', h: '♥', d: '♦', c: '♣' }, RK = { T: '10', J: 'V', Q: 'D', K: 'R', A: 'A' };
  const EMOTES = ['😎', '🤑', '😱', '🤡', '🙄', '🔥', '😭', '👏'];
  let V = null, key = null, iv = null, lastFx = 0, boardN = 0, lastAct = 0, payK = null, ended = false, raiseVal = 0;

  const card = (c, cls = '') => c === '??' || !c ? `<div class="pk-card back ${cls}"><i></i></div>`
    : `<div class="pk-card ${'hd'.includes(c[1]) ? 'red' : ''} ${cls}" data-c="${c}"><b>${RK[c[0]] || c[0]}</b><span>${SUIT[c[1]]}</span><em>${SUIT[c[1]]}</em></div>`;
  const chipsHTML = (n) => { if (!n) return ''; const k = Math.min(6, 1 + Math.floor(Math.log10(n + 1) * 1.6)); return `<span class="pk-chips">${Array.from({ length: k }, (_, i) => `<i class="c${(i + Math.floor(n / 7)) % 4}" style="--i:${i}"></i>`).join('')}</span>`; };
  const fmt = (n) => n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'k' : String(n);

  function build() {
    $('#v-poker').innerHTML = `
      <div class="pk-room" id="pk-room">
        <div class="pk-head"><div class="pk-logo"><span>♠</span><span class="r">♥</span> POKER <span class="r">♦</span><span>♣</span></div><div class="pk-chips-info"><span id="pk-mode"></span><span id="pk-hand"></span><span id="pk-blinds"></span></div></div>
        <div class="pk-tablewrap"><div class="pk-table" id="pk-table">
          <div class="pk-felt"><div class="pk-logoF">PLAYZUP<small>HOLD'EM</small></div></div>
          <div class="pk-center"><div class="pk-pot" id="pk-pot"></div><div class="pk-board" id="pk-board"></div><div class="pk-street" id="pk-street"></div></div>
          <div class="pk-seats" id="pk-seats"></div>
          <div class="pk-fly" id="pk-fly"></div>
        </div></div>
        <div class="pk-me" id="pk-me"></div>
        <div class="pk-bar" id="pk-bar"></div>
        <div class="pk-tools"><div class="pk-emotes">${EMOTES.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div><button class="btn btn-ghost btn-sm hidden" id="pk-stop">⏹ Terminer</button></div>
        <div id="pk-end"></div>
      </div>`;
    $$('#pk-room .pk-emotes button').forEach(b => b.onclick = () => gAct('emote', { e: b.dataset.e }));
    $('#pk-stop').onclick = () => { if (confirm('Terminer la partie maintenant ?')) gAct('end'); };
    boardN = 0;
  }
  function seatPos(i, n, mi) {
    const a = Math.PI / 2 + ((i - mi) / n) * Math.PI * 2;
    return [50 + 46 * Math.cos(a), 50 + 41 * Math.sin(a)];
  }
  function seats(v) {
    const n = v.seats.length, mi = Math.max(0, v.seats.findIndex(s => s.pid === pid));
    $('#pk-seats').innerHTML = v.seats.map((s, i) => {
      const p = P(s.pid) || { name: '?', avatar: '❔' }, [x, y] = seatPos(i, n, mi);
      const bx = 50 + (x - 50) * .58, by = 50 + (y - 50) * .52;
      const winner = v.winners?.find(w => w.pid === s.pid);
      return `<div class="pk-seat ${s.turn ? 'turn' : ''} ${s.folded ? 'folded' : ''} ${s.out ? 'out' : ''} ${s.allin ? 'allin' : ''} ${s.pid === pid ? 'me' : ''} ${winner ? 'won' : ''}" style="left:${x}%;top:${y}%" data-pid="${s.pid}">
          <div class="pk-cards2">${s.cards && s.pid !== pid ? s.cards.map((c, k) => card(c, `sm k${k}`)).join('') : ''}</div>
          <div class="pk-plate">${avatarHTML(p, 42)}<div><b>${esc(p.name)}</b><small>${s.out ? '💀 éliminé' : `🪙 ${fmt(s.chips)}`}</small></div>${s.dealer ? '<i class="pk-dealer">D</i>' : ''}
            ${s.turn && v.stage === 'hand' ? '<svg class="pk-ring" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="2" y="2" width="96" height="96" rx="22" ry="22" pathLength="100"/></svg>' : ''}</div>
          ${s.last ? `<span class="pk-last ${/TAPIS/.test(s.last) ? 'hot' : /Couch/.test(s.last) ? 'fold' : ''}">${esc(s.last)}</span>` : ''}
          ${winner ? `<span class="pk-win">+${fmt(winner.amount)}${winner.hand ? ` · ${esc(winner.hand)}` : ''}</span>` : ''}
        </div>
        ${s.bet ? `<div class="pk-bet" style="left:${bx}%;top:${by}%">${chipsHTML(s.bet)}<b>${fmt(s.bet)}</b></div>` : ''}`;
    }).join('');
  }
  function center(v) {
    $('#pk-pot').innerHTML = v.pot ? `${chipsHTML(v.pot)}<b>Pot : ${fmt(v.pot)}</b>` : '';
    const B = $('#pk-board');
    if (v.board.length < boardN || !v.board.length) { B.innerHTML = Array.from({ length: 5 }, () => '<div class="pk-slot"></div>').join(''); boardN = 0; }
    const slots = B.querySelectorAll('.pk-slot');
    const win = new Set((v.winners || []).flatMap(w => w.cards || []));
    for (let i = 0; i < 5; i++) {
      const c = v.board[i];
      if (c && i >= boardN) { slots[i].innerHTML = `<div class="pk-flip" style="--d:${(i - boardN) * .18}s"><div class="pk-fb">${card("??")}</div><div class="pk-ff">${card(c)}</div></div>`; setTimeout(() => sfx('card'), (i - boardN) * 180); }
      slots[i].classList.toggle('hl', !!(c && win.has(c) && v.stage === 'payout'));
    }
    boardN = v.board.length;
    $('#pk-street').textContent = { preflop: 'Pré-flop', flop: 'Flop', turn: 'Turn', river: 'River', showdown: 'Abattage !' }[v.street] || '';
  }
  function meBox(v) {
    const s = v.seats.find(x => x.pid === pid);
    if (!s || !s.cards) { $('#pk-me').innerHTML = s?.out ? '<p class="pk-busted">💀 Tu es éliminé(e)… tu peux regarder la fin !</p>' : '<p class="muted">Tu regardes la table 👀</p>'; return; }
    const win = new Set((v.winners || []).flatMap(w => w.cards || []));
    $('#pk-me').innerHTML = `<div class="pk-hole ${s.folded ? 'folded' : ''}">${s.cards.map((c, k) => card(c, `big h${k} ${win.has(c) && v.stage === 'payout' ? 'hl' : ''}`)).join('')}</div>
      <div class="pk-mine"><b>${v.myHand ? esc(v.myHand) : s.folded ? 'Couché' : 'Ta main'}</b><small>🪙 ${fmt(s.chips)}${s.bet ? ` · misé ${fmt(s.bet)}` : ''}</small>
      ${v.stage === 'payout' && v.uncontested && v.winners?.[0]?.pid === pid ? '<button class="btn btn-ghost btn-sm" id="pk-show">👀 Montrer mes cartes</button>' : ''}</div>`;
    $('#pk-show') && ($('#pk-show').onclick = () => gAct('show'));
  }
  function bar(v) {
    const o = v.opts, el = $('#pk-bar');
    if (!o) { el.innerHTML = v.stage === 'hand' ? `<p class="pk-wait">⏳ ${esc(P(v.seats.find(s => s.turn)?.pid)?.name || '')} réfléchit…</p>` : ''; el.classList.remove('mine'); return; }
    el.classList.add('mine');
    if (!raiseVal || raiseVal < o.minRaise || raiseVal > o.max) raiseVal = o.minRaise;
    const half = Math.max(o.minRaise, Math.min(o.max, o.high + Math.round(o.pot / 2))), pot = Math.max(o.minRaise, Math.min(o.max, o.high + o.pot));
    el.innerHTML = `<div class="pk-acts">
        <button class="pk-b fold" data-a="fold">Se coucher</button>
        ${o.canCheck ? '<button class="pk-b check" data-a="check">Parole ✓</button>' : `<button class="pk-b call" data-a="call">Suivre ${fmt(o.toCall)}</button>`}
        ${o.push ? `<button class="pk-b allin" data-a="allin">💥 TAPIS ${fmt(o.max)}</button>` : o.max > o.high ? `<button class="pk-b raise" data-a="raise">${o.high ? 'Relancer' : 'Miser'} <b id="pk-rv">${fmt(raiseVal)}</b></button>` : ''}
      </div>
      ${!o.push && o.max > o.minRaise ? `<div class="pk-slider"><button data-q="${o.minRaise}">Min</button><button data-q="${half}">½ pot</button><button data-q="${pot}">Pot</button><input type="range" id="pk-range" min="${o.minRaise}" max="${o.max}" step="${Math.max(1, Math.round(V.sb / 2))}" value="${raiseVal}"><button data-q="${o.max}" class="hot">Tapis</button></div>` : ''}`;
    $$('#pk-bar .pk-b').forEach(b => b.onclick = async () => {
      const a = b.dataset.a; const r = await gAct('act', { a, amount: a === 'raise' ? raiseVal : undefined });
      if (r?.error) toast(r.error, 'error'); else sfx(a === 'fold' ? 'click' : a === 'check' ? 'tick' : 'coin');
    });
    const rng = $('#pk-range');
    if (rng) {
      rng.oninput = () => { raiseVal = +rng.value; $('#pk-rv').textContent = fmt(raiseVal); };
      $$('#pk-bar .pk-slider button').forEach(b => b.onclick = () => { raiseVal = +b.dataset.q; rng.value = raiseVal; $('#pk-rv').textContent = fmt(raiseVal); sfx('click', .4); });
    }
  }
  function timer(v) {
    clearInterval(iv);
    if (v.stage !== 'hand') return;
    const t0 = Date.now(), L = v.left, T = v.time * 1000;
    iv = setInterval(() => {
      const r = $('#pk-seats .pk-ring rect'); if (!r) return;
      const f = Math.max(0, (L - (Date.now() - t0)) / T);
      r.style.strokeDashoffset = 100 * (1 - f); r.parentElement.classList.toggle('low', f < .25);
    }, 100);
  }
  function fly(v) {
    // jetons du pot vers le(s) gagnant(s)
    if (v.stage !== 'payout' || !v.winners) return;
    const k = v.handNo; if (payK === k) return; payK = k;
    const fl = $('#pk-fly');
    v.winners.forEach((w, wi) => {
      const seat = $(`#pk-seats .pk-seat[data-pid="${w.pid}"]`); if (!seat) return;
      for (let i = 0; i < 10; i++) {
        const c = document.createElement('i'); c.className = `pk-flychip c${i % 4}`;
        c.style.setProperty('--tx', seat.style.left); c.style.setProperty('--ty', seat.style.top); c.style.animationDelay = (wi * .3 + i * .06 + (v.uncontested ? .2 : 1.2)) + 's';
        fl.appendChild(c); setTimeout(() => c.remove(), 3500);
      }
    });
    setTimeout(() => sfx('coin'), v.uncontested ? 300 : 1300);
    if (v.winners.some(w => w.pid === pid)) setTimeout(() => { sfx('legend'); if (!v.uncontested) burst('money', 18); }, v.uncontested ? 400 : 1400);
  }
  function render(v) {
    if (v.gameKey !== key) { key = v.gameKey; build(); ended = false; payK = null; }
    const prevHand = V?.handNo; V = v;
    if (prevHand !== v.handNo) { boardN = 0; raiseVal = 0; $('#pk-board').innerHTML = ''; }
    $('#pk-mode').textContent = v.modeName; $('#pk-hand').textContent = `Main ${v.handNo}${v.maxHands ? '/' + v.maxHands : ''}`; $('#pk-blinds').textContent = `Blinds ${v.sb}/${v.sb * 2}`;
    seats(v); center(v); meBox(v); bar(v); timer(v); fly(v);
    $('#pk-stop').classList.toggle('hidden', !isHost() || v.stage === 'over');
    if (v.lastAct && v.lastAct.k !== lastAct) { lastAct = v.lastAct.k; if (v.lastAct.pid !== pid) sfx(v.lastAct.a === 'fold' ? 'click' : v.lastAct.a === 'check' ? 'tick' : 'coin', .6); if (v.lastAct.a === 'allin') { sfx('drum'); } }
    if (v.opts && render.myTurn !== v.handNo + ':' + v.street + ':' + v.pot) { render.myTurn = v.handNo + ':' + v.street + ':' + v.pot; sfx('pop', .6); }
    if (v.fx && v.fx.k !== lastFx) { lastFx = v.fx.k; const seat = $(`#pk-seats .pk-seat[data-pid="${v.fx.pid}"]`); const el = document.createElement('div'); el.className = 'pk-emote'; el.textContent = v.fx.e; if (seat) { el.style.left = seat.style.left; el.style.top = seat.style.top; } $('#pk-fly').appendChild(el); setTimeout(() => el.remove(), 2200); }
    if (v.stage === 'over' && !ended) {
      ended = true;
      setTimeout(() => { $('#pk-end').innerHTML = `<div class="pz-end"><h2>🃏 ${v.ranking?.[0]?.pid === pid ? 'Tu as raflé la table !' : 'Fin de la partie'}</h2>${podium((v.ranking || []).map(r => ({ pid: r.pid, pts: r.pts, unit: 'jetons' })))}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('pk')}</div>`; endWire('pk', v.ranking || []); $('#pk-end').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 1200);
    }
  }
  window.POKER = { render };
})();
