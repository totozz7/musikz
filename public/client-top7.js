// PLAYZUP — client « TOP 7 » (plateau télé : 7 réponses cachées, plus c'est rare plus ça rapporte).
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, themeKey = null, resKey = null, timerIv = null, revealed = new Set(), typT = null;

  function build() {
    $('#v-top7').innerHTML = `
      <div class="t7-room" id="t7-room">
        <div class="t7-lights"><i></i><i></i><i></i></div>
        <header class="t7-top">
          <div class="t7-logo"><span class="t7-l">TOP</span><span class="t7-7">7</span></div>
          <div class="t7-meta"><span class="t7-chip" id="t7-count"></span></div>
        </header>
        <div class="t7-theme" id="t7-theme"></div>
        <div class="t7-main">
          <div class="t7-board" id="t7-board"></div>
          <div class="t7-side">
            <div class="t7-turn" id="t7-turn"></div>
            <div class="t7-log" id="t7-log"></div>
          </div>
        </div>
        <div class="t7-players" id="t7-players"></div>
        <div class="t7-fx" id="t7-fx"></div>
        <div class="t7-intro" id="t7-intro"></div>
        <div id="t7-end"></div>
      </div>`;
  }
  const ptsCls = (r) => r >= 6 ? 'hot' : r >= 4 ? 'mid' : 'low';
  function board(v, animate) {
    const el = $('#t7-board');
    if (!el.children.length || animate === 'new') {
      revealed = new Set();
      el.innerHTML = v.board.map((b, i) => `<div class="t7-row" data-r="${b.rank}" style="--i:${i}">
        <span class="t7-rank">N°${b.rank}</span>
        <div class="t7-panel"><div class="t7-face front"><span>?</span></div><div class="t7-face back"><b></b><em></em></div></div>
        <span class="t7-pts ${ptsCls(b.rank)}">${b.rank}<small>pt${b.rank > 1 ? 's' : ''}</small></span></div>`).join('');
    }
    v.board.forEach((b, i) => {
      if (!b.text || revealed.has(i)) return;
      const row = el.children[i]; if (!row) return;
      const show = () => {
        revealed.add(i);
        row.querySelector('.back b').textContent = b.text;
        const p = b.by && P(b.by);
        row.querySelector('.back em').innerHTML = p ? `${avatarHTML(p, 26)}<span>${esc(p.name)}</span>` : b.missed ? '<span>personne 😶</span>' : '';
        row.classList.add('open'); row.classList.toggle('missed', !!b.missed); row.classList.toggle('mine', b.by === pid);
      };
      if (b.missed && animate === 'reveal') { const k = [...v.board.slice(0, i)].filter(x => x.missed).length; setTimeout(() => { if (V?.round === v.round) { show(); sfx('card', .5); } }, 500 + k * 700); revealed.add(i); }
      else show();
    });
  }
  function players(v) {
    $('#t7-players').innerHTML = v.order.map(id => {
      const p = P(id); if (!p) return '';
      const used = v.used?.[id] || 0, cur = v.cur === id && (v.stage === 'turn' || v.stage === 'result');
      return `<div class="t7-pl ${cur ? 'cur' : ''} ${id === pid ? 'me' : ''} ${p.online ? '' : 'off'}">${avatarHTML(p, 42)}<b>${esc(p.name)}</b>
        <span class="t7-score">${v.scores[id] || 0}</span><span class="t7-tries">${[...Array(v.tries)].map((_, k) => `<i class="${k < used ? 'used' : ''}"></i>`).join('')}</span></div>`;
    }).join('');
  }
  function log(v) {
    const miss = (v.guesses || []).filter(g => g.why !== 'hit').slice(-6);
    $('#t7-log').innerHTML = miss.length ? `<h5>❌ Raté</h5>${miss.map(g => `<span>${esc(P(g.pid)?.name || '?')} : <s>${g.text ? esc(g.text) : '⏰'}</s></span>`).join('')}` : '';
  }
  function turn(v) {
    const t = $('#t7-turn'), p = P(v.cur);
    const tk = v.round + ':' + v.cur + ':' + (v.used?.[v.cur] || 0) + ':' + v.stage;
    if (tk === turn.k && v.stage === 'turn') { const d = t.querySelector('.t7-dots'); if (d) d.classList.toggle('on', !!v.typing); return; }
    turn.k = tk;
    clearInterval(timerIv);
    if (v.stage === 'turn') $('#t7-fx').innerHTML = '';
    if (v.stage !== 'turn') { if (v.stage !== 'result') t.innerHTML = ''; return; }
    const mine = v.cur === pid;
    t.innerHTML = `<div class="t7-ring" id="t7-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="bg"/><circle cx="50" cy="50" r="44" class="fg" id="t7-arc"/></svg><span id="t7-sec"></span></div>
      ${mine ? `<form class="t7-form" id="t7-form" autocomplete="off"><input class="input" id="t7-in" maxlength="50" placeholder="Ta réponse…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn btn-primary">🎯 Valider</button></form>
        <p class="t7-tip">À toi ${esc(p?.name || '')} ! Vise une réponse <b>rare</b> du top 😏</p>`
      : `<div class="t7-wait">${p ? avatarHTML(p, 54) : ''}<b>${esc(p?.name || '?')}</b><span>réfléchit<i class="t7-dots ${v.typing ? 'on' : ''}"><i></i><i></i><i></i></i></span></div>
        ${isHost() ? '<button class="btn btn-ghost btn-sm" id="t7-skip">⏭️ Passer son tour</button>' : ''}`}`;
    const end = Date.now() + v.left, tot = v.time;
    const tick = () => { const l = Math.max(0, end - Date.now()); const a = $('#t7-arc'); if (!a) return; a.style.strokeDashoffset = String(276.5 * (1 - l / tot)); $('#t7-sec').textContent = Math.ceil(l / 1000); $('#t7-ring').classList.toggle('hot', l < 5000); };
    tick(); timerIv = setInterval(tick, 200);
    if (mine) {
      const inp = $('#t7-in'); setTimeout(() => inp.focus(), 50);
      inp.oninput = () => { clearTimeout(typT); typT = setTimeout(() => gAct('typing', inp.value.length), 250); };
      $('#t7-form').onsubmit = async (e) => { e.preventDefault(); const val = inp.value.trim(); if (!val) return; inp.disabled = true; const r = await gAct('answer', val); if (r?.error) { toast(r.error, 'error'); inp.disabled = false; } };
    }
    $('#t7-skip') && ($('#t7-skip').onclick = () => gAct('skip'));
  }
  function result(v) {
    const r = v.result; if (!r || resKey === r.k) return; resKey = r.k;
    const p = P(r.pid), fx = $('#t7-fx'), t = $('#t7-turn');
    if (r.why === 'hit') {
      const row = $('#t7-board').children[r.i];
      row?.classList.add('flash');
      fx.innerHTML = `<div class="t7-hit r${r.pts}"><b>+${r.pts}</b><span>${r.pts >= 6 ? '🔥 ÉNORME !' : r.pts >= 4 ? '👏 Bien vu !' : r.pts === 1 ? '😅 Trop facile…' : '✅ Dans le top !'}</span></div>`;
      sfx(r.pts >= 5 ? 'legend' : 'pop'); if (r.pts >= 5) burst('fireworks', r.pts * 2);
      t.innerHTML = `<div class="t7-said ok">${p ? avatarHTML(p, 40) : ''}<span>« ${esc(r.text)} »</span><b>N°${r.i + 1}</b></div>`;
    } else {
      fx.innerHTML = `<div class="t7-x"><span>✖</span><small>${r.why === 'late' ? '⏰ Trop tard !' : r.why === 'dup' ? 'Déjà sur le plateau !' : 'Pas dans le top 7…'}</small></div>`;
      sfx('buzzer'); $('#t7-room').classList.remove('shake'); void $('#t7-room').offsetWidth; $('#t7-room').classList.add('shake');
      t.innerHTML = `<div class="t7-said">${p ? avatarHTML(p, 40) : ''}<span>${r.text ? `« ${esc(r.text)} »` : '…'}</span><b>0</b></div>`;
    }
    setTimeout(() => { if (fx.firstChild) fx.firstChild.classList.add('out'); }, 1500);
  }
  function intro(v) {
    const el = $('#t7-intro');
    el.innerHTML = `<div class="t7-card"><small>Thème ${v.n} / ${v.total}</small><span class="t7-emo">${v.theme.emoji}</span><b>${esc(v.theme.title)}</b><em>7 réponses cachées · la plus rare vaut 7 points</em></div>`;
    el.className = 't7-intro on'; sfx('drum');
    setTimeout(() => { el.className = 't7-intro'; }, 3300);
  }
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); themeKey = null; resKey = null; }
    $('#t7-count').textContent = `Thème ${v.n} / ${v.total}`;
    $('#t7-theme').innerHTML = v.theme ? `<span>${v.theme.emoji}</span>${esc(v.theme.title)}` : '';
    const newTheme = v.round !== themeKey;
    if (newTheme) { themeKey = v.round; $('#t7-fx').innerHTML = ''; board(v, 'new'); if (v.stage === 'intro') intro(v); }
    else board(v, v.stage === 'reveal' ? 'reveal' : '');
    players(v); log(v); turn(v);
    if (v.stage === 'result') result(v);
    if (v.stage === 'reveal' && !$('#t7-room').classList.contains('rv')) { setTimeout(() => { $('#t7-fx').innerHTML = ''; }, 900); $('#t7-turn').innerHTML = '<div class="t7-said">🎬 Les réponses manquantes…</div>'; }
    $('#t7-room').classList.toggle('rv', v.stage === 'reveal');
    $('#t7-room').classList.toggle('over', v.stage === 'over');
    if (v.stage === 'over') showEnd(v); else $('#t7-end').innerHTML = '';
  }
  function showEnd(v) {
    if ($('#t7-end').innerHTML) return;
    $('#t7-end').innerHTML = `<div class="pz-end t7-endc"><h2>7️⃣ Le roi du Top 7 est…</h2>${podium(v.ranking || [])}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('t7')}</div>`;
    endWire('t7', v.ranking || []);
  }
  window.TOP7 = { render };
})();
