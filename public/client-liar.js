// PLAYZUP — client « Bar des Menteurs ». Utilise app.js : $, $$, esc, avatarHTML, nameHTML, state, pid, gAct, sfx, burst…
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const RN = { Q: 'Dame', K: 'Roi', A: 'As', J: 'Joker' };
  const RL = { Q: 'D', K: 'R', A: 'A', J: '★' };
  const RG = { Q: '♛', K: '♚', A: '♠', J: '🃏' };
  let V = null, key = null, lastEv = 0, sel = new Set(), timerIv = null, busy = false;

  const cardHTML = (c, cls = '') => c ? `<div class="lb-card face r-${c.r} ${cls}" data-id="${c.id}">
      <span class="cr tl">${RL[c.r]}<i>${RG[c.r]}</i></span><span class="cg">${RG[c.r]}</span><span class="cn">${RN[c.r].toUpperCase()}</span><span class="cr br">${RL[c.r]}<i>${RG[c.r]}</i></span></div>`
    : `<div class="lb-card back ${cls}"><span>PZ</span></div>`;
  const PL = (r) => r === 'A' ? 'As' : RN[r] + 's';
  const plural = (n, r) => `${n} ${n > 1 ? PL(r) : RN[r]}`;

  // positions autour de la table (moi en bas)
  function seatPos(v, k) {
    const n = v.seats.length, me = v.me >= 0 ? v.me : 0;
    const i = (k - me + n) % n;
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    const narrow = ($('#lb-table')?.clientWidth || 800) < 560;
    return { x: 50 + (narrow ? 37 : 44) * Math.cos(a), y: 50 + (narrow ? 37 : 40) * Math.sin(a) };
  }

  function build(v) {
    $('#v-liar').innerHTML = `
      <div class="lb-room">
        <div class="lb-lamp"></div>
        <div class="lb-neon"><span>BAR</span> <b>DES</b> <span>MENTEURS</span></div>
        <div class="lb-main">
          <div class="lb-tablewrap">
            <div class="lb-table" id="lb-table">
              <div class="lb-felt"></div>
              <div class="lb-center">
                <div class="lb-tcard" id="lb-tcard"></div>
                <div class="lb-pile" id="lb-pile"></div>
                <div class="lb-claim" id="lb-claim"></div>
              </div>
              <div id="lb-seats"></div>
              <div class="lb-flyer" id="lb-flyer"></div>
            </div>
          </div>
        </div>
        <div class="lb-handbar" id="lb-handbar">
          <div class="lb-turnrow"><div class="lb-turn" id="lb-turn"></div><div class="lb-timer hidden" id="lb-timer"><i></i><span></span></div></div>
          <div class="lb-hand" id="lb-hand"></div>
          <div class="lb-actions" id="lb-actions"></div>
        </div>
        <div class="lb-side">
          <div class="lb-deck" id="lb-deck"></div>
          <ul class="lb-log" id="lb-log"></ul>
          <details class="lb-rules"><summary>📜 Règles</summary>
            <p>À chaque manche, une <b>carte du tour</b> est tirée (Dame, Roi ou As). À ton tour, pose <b>1 à 3 cartes face cachée</b> en prétendant que ce sont des cartes du tour. Les <b>Jokers</b> valent tout.</p>
            <p>Le joueur suivant peut te croire et jouer… ou crier <b>MENTEUR !</b> On retourne les cartes : le menteur — ou l'accusateur qui s'est trompé — joue à la <b>roulette du pistolet à bouchon</b>.</p>
            <p>Chaque barillet a 6 chambres et un seul bouchon : à chaque tir, le risque monte (1/6, 1/5, 1/4…). Si tout le monde est à sec, le dernier joueur avec des cartes doit dénoncer. Dernier debout = gagnant !</p>
          </details>
        </div>
        <div class="lb-stage" id="lb-stage"></div>
        <div id="lb-end"></div>
      </div>`;
  }

  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(v); lastEv = 0; sel.clear(); busy = false; }
    drawSeats(v); drawCenter(v); drawHand(v); drawSide(v);
    if (v.event && v.event.id !== lastEv) { const e = v.event; lastEv = e.id; play(e, v); }
    if (v.stage === 'over') showEnd(v); else $('#lb-end').innerHTML = '';
  }

  function drawSeats(v) {
    const box = $('#lb-seats');
    box.innerHTML = v.seats.map((s, k) => {
      const p = P(s.pid), pos = seatPos(v, k);
      const cur = v.stage === 'play' && v.turn === k && ['turn', 'anim'].includes(v.phase);
      const backs = Array.from({ length: Math.min(s.cards, 5) }, (_, i) => `<i style="--i:${i - (Math.min(s.cards, 5) - 1) / 2}"></i>`).join('');
      const ch = Array.from({ length: 6 }, (_, i) => `<b class="${i < s.shots ? 'used' : ''} ${s.bullet && i === s.bullet - 1 ? 'live' : ''}"></b>`).join('');
      const risk = s.alive ? `1/${6 - s.shots}` : '';
      return `<div class="lb-seat ${cur ? 'cur' : ''} ${s.alive ? '' : 'dead'} ${k === v.me ? 'me' : ''} ${s.online ? '' : 'off'}" id="lb-seat-${k}" style="left:${pos.x}%;top:${pos.y}%">
        <div class="lb-av">${p ? avatarHTML(p, 52) : `<span class="lb-bot">${s.bot ? '🤖' : '👤'}</span>`}${s.alive ? '' : '<span class="lb-skull">💀</span>'}</div>
        <div class="lb-nm">${p ? nameHTML(p) : esc(s.name)}</div>
        <div class="lb-backs">${s.alive ? backs : ''}</div>
        <div class="lb-cyl" title="Barillet : ${s.shots}/6 tirs — risque au prochain tir ${risk}">${ch}<em>${risk}</em></div>
      </div>`;
    }).join('');
  }

  function drawCenter(v) {
    const t = v.table;
    $('#lb-tcard').innerHTML = t ? `<small>CARTE DU TOUR</small>${cardHTML({ r: t, id: -1 }, 'big')}<b>${PL(t)}</b>` : '';
    const n = Math.min(v.pile, 14);
    $('#lb-pile').innerHTML = Array.from({ length: n }, (_, i) => `<div class="lb-card back mini" style="--r:${(i * 47) % 40 - 20}deg;--x:${(i * 13) % 18 - 9}px;--y:${(i * 7) % 12 - 6}px"><span>PZ</span></div>`).join('');
    const L = v.last;
    $('#lb-claim').innerHTML = L && v.phase !== 'reveal' && v.phase !== 'shoot' ? `<b>${esc(v.seats[L.seat].name)}</b> annonce <strong>${plural(L.n, t)}</strong>` : '';
  }

  function drawHand(v) {
    const hand = v.hand || [];
    [...sel].forEach(id => { if (!hand.some(c => c.id === id)) sel.delete(id); });
    const me = v.seats[v.me];
    const hb = $('#lb-handbar');
    hb.classList.toggle('hidden', v.stage === 'over');
    hb.classList.toggle('dead', !!me && !me.alive);
    const n = hand.length;
    $('#lb-hand').innerHTML = me && !me.alive ? '<p class="lb-ghost">💀 Tu es éliminé·e… regarde les autres bluffer !</p>'
      : hand.map((c, i) => cardHTML(c, `inhand ${sel.has(c.id) ? 'sel' : ''} ${c.r === v.table || c.r === 'J' ? 'good' : ''}`).replace('class="lb-card', `style="--i:${i - (n - 1) / 2};--n:${n}" class="lb-card`)).join('') || (me ? '<p class="lb-ghost">Plus de cartes : attends la fin de la manche…</p>' : '');
    $$('#lb-hand .lb-card').forEach(el => el.onclick = () => {
      if (!v.canPlay) return;
      const id = +el.dataset.id;
      if (sel.has(id)) sel.delete(id); else if (sel.size < 3) sel.add(id); else return toast('3 cartes maximum', 'error');
      sfx('card', .5); drawHand(V);
    });
    const acts = [];
    if (v.canPlay) acts.push(`<button class="btn lb-play" id="lb-play" ${sel.size ? '' : 'disabled'}>🂠 Poser ${sel.size || ''} ${sel.size ? `carte${sel.size > 1 ? 's' : ''} : « ${plural(sel.size, v.table)} »` : '— choisis 1 à 3 cartes'}</button>`);
    if (v.canCall) acts.push(`<button class="btn lb-liar" id="lb-call">🗣️ MENTEUR !</button>`);
    if (v.forced) acts.unshift('<p class="lb-forced">😬 Plus personne n\'a de cartes : tu dois dénoncer !</p>');
    $('#lb-actions').innerHTML = acts.join('');
    $('#lb-play')?.addEventListener('click', () => { if (!sel.size) return; const ids = [...sel]; sel.clear(); gAct('play', ids); });
    $('#lb-call')?.addEventListener('click', () => gAct('call'));
  }

  function drawSide(v) {
    const cur = v.seats[v.turn];
    const mine = v.turn === v.me && v.phase === 'turn' && v.stage === 'play';
    const txt = v.stage === 'over' ? '🏁 Partie terminée'
      : v.phase === 'deal' ? `🃏 Manche ${v.round} — distribution…`
      : v.phase === 'reveal' ? '👀 On retourne les cartes…'
      : v.phase === 'shoot' ? '🔫 Roulette…'
      : mine ? `<b>À toi !</b> ${v.last ? `${esc(v.seats[v.last.seat].name)} a posé ${plural(v.last.n, v.table)}. Tu le crois ?` : 'Ouvre la manche : pose tes cartes.'}`
      : `C'est à <b>${esc(cur.name)}</b>…`;
    $('#lb-turn').innerHTML = `<span class="lb-round">Manche ${v.round}</span>${txt}`;
    $('#lb-turn').classList.toggle('mine', mine);
    const d = v.deck;
    $('#lb-deck').innerHTML = d ? `<small>Dans le paquet cette manche</small><div>${['Q', 'K', 'A', 'J'].map(r => `<span class="${r === v.table || r === 'J' ? 'ok' : ''}">${RG[r]} ${d[r]} ${d[r] > 1 ? PL(r) : RN[r]}</span>`).join('')}</div>` : '';
    $('#lb-log').innerHTML = v.log.map(l => `<li>${esc(l)}</li>`).join('');
    clearInterval(timerIv);
    const tEl = $('#lb-timer');
    if (mine) {
      tEl.classList.remove('hidden');
      const end = Date.now() + v.left, total = v.time;
      const tick = () => { const l = Math.max(0, end - Date.now()); tEl.querySelector('i').style.transform = `scaleX(${l / total})`; tEl.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; if (!l) clearInterval(timerIv); };
      tick(); timerIv = setInterval(tick, 250);
      if (v.canCall || v.canPlay) document.title = '🃏 À toi ! — PlayZup';
    } else { tEl.classList.add('hidden'); document.title = 'PlayZup'; }
  }

  // ── cinématiques ──
  const stage = () => $('#lb-stage');
  function fly(fromEl, toEl, html, delay, cls = '') {
    const box = $('#lb-table').getBoundingClientRect();
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'lb-fly ' + cls; d.innerHTML = html;
    d.style.left = (a.left + a.width / 2 - box.left) + 'px'; d.style.top = (a.top + a.height / 2 - box.top) + 'px';
    d.style.setProperty('--dx', (b.left + b.width / 2 - a.left - a.width / 2) + 'px');
    d.style.setProperty('--dy', (b.top + b.height / 2 - a.top - a.height / 2) + 'px');
    d.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
    d.style.animationDelay = delay + 'ms';
    $('#lb-flyer').appendChild(d);
    setTimeout(() => { d.remove(); }, 900 + delay);
  }
  function bubble(k, html, cls = '', ms = 2200) {
    const pos = seatPos(V, k), b = document.createElement('div');
    b.className = 'lb-bubble ' + cls; b.innerHTML = html;
    b.style.left = pos.x + '%'; b.style.top = pos.y + '%';
    $('#lb-flyer').appendChild(b);
    setTimeout(() => b.remove(), ms);
  }

  function play(e, v) {
    if (e.type === 'deal') {
      const st = stage();
      st.innerHTML = `<div class="lb-banner"><small>MANCHE ${e.round}</small><div class="lb-flip">${cardHTML(null, 'big')}${cardHTML({ r: e.table, id: -1 }, 'big')}</div><b>On joue les <em>${PL(e.table)}</em> !</b></div>`;
      st.className = 'lb-stage on';
      sfx('drum', .5);
      const center = $('#lb-pile');
      v.seats.forEach((s, k) => { if (!s.alive) return; for (let i = 0; i < 5; i++) setTimeout(() => { const t = $('#lb-seat-' + k); if (t) fly(center, t, cardHTML(null, 'mini'), 0, 'deal'); if (i === 0) sfx('card', .3); }, 200 + i * 120 + k * 40); });
      setTimeout(() => { sfx('legend', .5); }, 900);
      setTimeout(() => { if (stage().querySelector('.lb-banner')) stage().className = 'lb-stage'; }, 2400);
    }
    if (e.type === 'play') {
      const from = $('#lb-seat-' + e.seat), to = $('#lb-pile');
      for (let i = 0; i < e.n; i++) setTimeout(() => sfx('card', .6), i * 90);
      if (from && to) for (let i = 0; i < e.n; i++) fly(from, to, cardHTML(null, 'mini'), i * 90);
      bubble(e.seat, `${plural(e.n, v.table)} !`, 'claim', 2600);
    }
    if (e.type === 'reveal') {
      bubble(e.caller, 'MENTEUR !', 'shout', 3000);
      sfx('klaxon', .6);
      const st = stage();
      const caller = v.seats[e.caller], target = v.seats[e.target];
      st.innerHTML = `<div class="lb-reveal ${e.lie ? 'lie' : 'truth'}">
        <p class="lb-accuse"><b>${esc(caller.name)}</b> accuse <b>${esc(target.name)}</b> !</p>
        <div class="lb-rcards">${e.cards.map((c, i) => `<div class="lb-flip slow" style="--d:${.5 + i * .45}s">${cardHTML(null, 'big')}${cardHTML(c, 'big ' + (c.r === v.table || c.r === 'J' ? 'ok' : 'ko'))}</div>`).join('')}</div>
        <div class="lb-stamp" style="--d:${.6 + e.cards.length * .45}s">${e.lie ? 'MENTEUR !' : 'VÉRITÉ !'}</div>
        <p class="lb-verdict" style="--d:${1 + e.cards.length * .45}s">${e.lie ? `😈 ${esc(target.name)} bluffait…` : `😇 ${esc(target.name)} disait vrai…`} <b>${esc((e.lie ? target : caller).name)}</b> passe à la roulette !</p>
      </div>`;
      st.className = 'lb-stage on dark';
      e.cards.forEach((c, i) => setTimeout(() => sfx('card', .8), 500 + i * 450));
      setTimeout(() => { sfx('stamp'); if (e.lie) sfx('buzzer', .4); else sfx('legend', .5); }, 600 + e.cards.length * 450);
    }
    if (e.type === 'shoot') {
      const s = v.seats[e.seat], p = P(s.pid);
      const st = stage();
      const left = 6 - (e.shot - 1);
      st.innerHTML = `<div class="lb-roulette">
        <div class="lb-rv-who">${p ? avatarHTML(p, 96) : '<span class="lb-bot big">🤖</span>'}<b>${esc(s.name)}</b><small>Tir n°${e.shot} · 1 chance sur ${left}</small></div>
        <div class="lb-gun">
          <svg viewBox="0 0 320 170" class="lb-gun-svg"><defs>
            <linearGradient id="lbBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#e2b33c"/><stop offset="1" stop-color="#8a5a00"/></linearGradient>
            <linearGradient id="lbWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8692e"/><stop offset="1" stop-color="#5e2a0c"/></linearGradient>
            <linearGradient id="lbSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6ff"/><stop offset=".5" stop-color="#9aa3c0"/><stop offset="1" stop-color="#4b5272"/></linearGradient></defs>
            <rect x="120" y="44" width="180" height="26" rx="9" fill="url(#lbSteel)" stroke="#2a2f44" stroke-width="3"/>
            <rect x="288" y="40" width="22" height="34" rx="6" fill="#ff2e4d" stroke="#2a2f44" stroke-width="3"/>
            <path d="M70 40 h70 q14 0 14 14 v40 q0 10 -10 10 h-74 z" fill="url(#lbBrass)" stroke="#2a2f44" stroke-width="3"/>
            <path d="M80 100 h52 l-8 20 q-6 14 -20 12 l-18 -2 z" fill="none" stroke="#2a2f44" stroke-width="5" stroke-linecap="round"/>
            <path d="M46 92 q-22 6 -26 40 q-2 22 12 30 l40 4 q14 0 16 -14 l10 -58 z" fill="url(#lbWood)" stroke="#2a2f44" stroke-width="3"/>
            <path d="M32 120 l40 4 M30 136 l40 4" stroke="#00000033" stroke-width="3"/>
            <path d="M58 40 l-10 -16 h14 l12 16z" fill="url(#lbSteel)" stroke="#2a2f44" stroke-width="3"/>
            <text x="200" y="64" font-family="Bungee, sans-serif" font-size="14" fill="#2a2f44">BOUCHON</text>
          </svg>
          <div class="lb-cylwrap"><div class="lb-cylinder" id="lb-cylinder">${Array.from({ length: 6 }, (_, i) => `<i style="--a:${i * 60}deg" class="${i < e.shot - 1 ? 'used' : ''}"></i>`).join('')}<b></b></div></div>
          <div class="lb-cork">🍾</div>
        </div>
        <div class="lb-result" id="lb-result"></div>
      </div>`;
      st.className = 'lb-stage on dark tense';
      sfx('spin', .9);
      setTimeout(() => sfx('drum', .7), 700);
      setTimeout(() => {
        const r = $('#lb-result'); if (!r) return;
        const ro = stage().querySelector('.lb-roulette');
        if (e.bang) {
          ro.classList.add('bang'); sfx('bang', 1.2);
          r.innerHTML = '<b class="bang">💥 BANG !</b><small>Éliminé·e !</small>';
          $('#v-liar').classList.remove('shake'); void $('#v-liar').offsetWidth; $('#v-liar').classList.add('shake');
          if (s.pid === pid) setTimeout(() => sfx('wrong'), 600);
        } else {
          ro.classList.add('click'); sfx('click', 1.2);
          r.innerHTML = '<b class="click">*clic*</b><small>😮‍💨 Ouf… le barillet tourne encore</small>';
        }
      }, 2300);
      setTimeout(() => { if (stage().querySelector('.lb-roulette')) stage().className = 'lb-stage'; }, 3500);
    }
    if (e.type === 'over') stage().className = 'lb-stage';
  }

  function showEnd(v) {
    if ($('#lb-end').innerHTML) return;
    const W = v.seats[v.winner], meWon = v.winner === v.me, wp = P(W.pid);
    $('#lb-end').innerHTML = `<div class="lb-endcard">
      <div class="lb-endtop">${wp ? avatarHTML(wp, 90) : '<span class="lb-bot big">🤖</span>'}<h2>${esc(W.name)}</h2><p>Dernier debout au Bar des Menteurs 🥃</p></div>
      <div class="lb-rank">${v.ranking.map((k, i) => { const s = v.seats[k], p = P(s.pid); return `<div class="row ${k === v.me ? 'me' : ''}"><b>${i ? i + 1 : '👑'}</b>${p ? nameHTML(p) : esc(s.name)}<em>🗣️ ${s.goodCalls}/${s.calls} dénonciations · 🔫 ${s.shots} tir${s.shots > 1 ? 's' : ''}${s.alive ? '' : ' 💀'}</em>${k === v.me && v.coins ? `<strong>+${v.coins.coins} 🪙</strong>` : ''}</div>`; }).join('')}</div>
      <div class="end-actions">${isHost() ? '<button class="btn btn-primary" id="lb-replay">🔁 Revanche</button><button class="btn btn-yellow" id="lb-lobby">🏠 Salon</button>' : '<p class="muted">L\'hôte peut lancer une revanche.</p>'}<button class="btn btn-shop" id="lb-shop">🎡 Roue de la chance</button></div></div>`;
    $('#lb-replay')?.addEventListener('click', () => gAct('replay'));
    $('#lb-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $('#lb-shop')?.addEventListener('click', () => window.WHEEL?.open());
    if (meWon) { burst(save.look.winFx, 34); sfx('legend'); setTimeout(() => sfx('legend'), 300); }
    setTimeout(() => $('#lb-end .lb-endcard')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  }

  window.LIAR = { render };
})();
