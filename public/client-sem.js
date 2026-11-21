// PLAYZUP — client « Ça chauffe ! » (trouver le mot secret par la proximité de sens).
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, round = null, lastStage = null, last = null, busy = false;
  const emo = (r) => r.per >= 999 ? '😱' : r.per >= 990 ? '🔥' : r.per >= 900 ? '🥵' : r.per > 0 ? '😎' : r.t >= 25 ? '🌡️' : r.t >= 0 ? '🥶' : '🧊';
  const heatCol = (t) => `hsl(${Math.max(0, Math.min(220, 220 - (t + 10) * 3.3))},95%,58%)`;

  function build() {
    $('#v-sem').innerHTML = `
      <div class="sx-room" id="sx-room">
        <div class="sx-sky"><i></i><i></i><i></i></div>
        <header class="sx-top">
          <div class="sx-logo">ÇA CHAUFFE<b>!</b><span class="sx-flame">🔥</span></div>
          <div class="sx-meta"><span class="sx-chip" id="sx-count"></span><span class="sx-chip" id="sx-time"></span></div>
        </header>
        <div class="sx-hint" id="sx-hint"></div>
        <div class="sx-main">
          <div class="sx-left">
            <form class="sx-form" id="sx-form" autocomplete="off"><input class="input" id="sx-in" maxlength="40" placeholder="Propose un mot…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn btn-primary">🔥 Tester</button></form>
            <div class="sx-msg" id="sx-msg"></div>
            <div class="sx-last" id="sx-last"></div>
            <div class="sx-head"><span>#</span><span>Mot</span><span>°C</span><span></span><span>Progression</span></div>
            <ol class="sx-list" id="sx-list"></ol>
          </div>
          <aside class="sx-side">
            <h4>🏁 La course</h4>
            <div class="sx-race" id="sx-race"></div>
            <div class="sx-helps" id="sx-helps"><button class="sx-help" id="sx-boost">🎯 Coup de pouce <b id="sx-boost-n"></b><small>un mot plus proche que ton meilleur</small></button><button class="sx-help spy" id="sx-spy">🕵️ Espion <b id="sx-spy-n"></b><small>vois le meilleur mot du plus chaud</small></button></div>
            <div class="sx-spyres" id="sx-spyres"></div>
            <div class="sx-btns"><button class="btn btn-ghost btn-sm" id="sx-give">🏳️ Abandonner ce mot</button><button class="btn btn-ghost btn-sm hidden" id="sx-end">⏹ Terminer la partie</button></div>
            <div class="sx-scale"><span>🧊 &lt; 0 °C</span><span>🥶 froid</span><span>🌡️ tiède</span><span>😎 top 1000</span><span>🥵 top 100</span><span>🔥 top 10</span><span>😱 brûlant</span></div>
          </aside>
        </div>
        <div class="sx-reveal" id="sx-reveal"></div>
        <div id="sx-end-card"></div>
      </div>`;
    $('#sx-form').onsubmit = async (e) => {
      e.preventDefault();
      const t = $('#sx-in').value.trim(); if (!t || busy) return;
      busy = true;
      const r = await gAct('guess', t);
      busy = false;
      $('#sx-in').value = ''; $('#sx-in').focus();
      if (!r) return;
      if (r.error) return msg(r.error, 'err');
      last = r.w;
      if (r.dup) msg(`Déjà essayé : « ${r.w} » (${r.t} °C)`, 'dup');
      else if (r.win) msg('🎉 TROUVÉ !', 'win');
      else { msg('', ''); sfx(r.per >= 990 ? 'legend' : r.per >= 900 ? 'pop' : r.per > 0 ? 'pop' : 'tick', r.per > 0 ? .6 : .4); if (r.per >= 990) burst('fireworks', 10); }
      if (V) drawList(V);
    };
    $('#sx-boost').onclick = async () => {
      const r = await gAct('boost'); if (!r) return;
      if (r.error) return msg(r.error, 'err');
      last = r.w; msg(`🎯 Coup de pouce : « ${r.w} » (${r.t} °C)`, 'dup'); sfx('legend', .5); burst('fireworks', 8);
      if (V) drawList(V);
    };
    $('#sx-spy').onclick = async () => {
      const r = await gAct('spy'); if (!r) return;
      if (r.error) return msg(r.error, 'err');
      $('#sx-spyres').innerHTML = `🕵️ <b>${esc(r.name)}</b> a trouvé « <b>${esc(r.w)}</b> » <em style="--h:${heatCol(r.t)}">${r.t.toFixed(2)} °C${r.per ? ' · ' + r.per + '‰' : ''}</em>`;
      $('#sx-spyres').classList.add('on'); sfx('card', .6);
    };
    $('#sx-give').onclick = () => gAct('giveup');
    $('#sx-end').onclick = () => gAct('end');
  }
  function msg(t, cls) { const m = $('#sx-msg'); m.className = 'sx-msg ' + cls; m.textContent = t; clearTimeout(msg.t); if (t) msg.t = setTimeout(() => { m.textContent = ''; }, 3500); }
  function row(r, cls = '') {
    const w = Math.max(2, r.per / 10);
    return `<li class="sx-row ${cls} ${r.per ? 'hot' : ''} ${r.boost ? 'boost' : ''}" style="--h:${heatCol(r.t)}"><span class="n">${r.boost ? '🎯' : r.n}</span><span class="w">${esc(r.w)}</span><span class="t">${r.t.toFixed(2)}</span><span class="e">${emo(r)}</span>
      <span class="bar">${r.per ? `<i style="width:${w}%"></i><b>${r.per}‰</b>` : ''}</span></li>`;
  }
  function drawList(v) {
    const mine = v.mine || [];
    const L = mine.find(x => x.w === last) || mine[mine.length - 1];
    $('#sx-last').innerHTML = L ? '' : '<p class="sx-empty">Propose un premier mot pour prendre la température 🌡️</p>';
    $('#sx-list').innerHTML = [...mine].sort((a, b) => b.t - a.t).map(r => row(r, r.w === L?.w ? 'cur' : '')).join('');
    const best = mine.reduce((m, r) => Math.max(m, r.t), -100);
    $('#sx-room').style.setProperty('--heat', String(Math.max(0, Math.min(1, (best + 5) / 75))));
  }
  function drawRace(v) {
    const rows = [...v.race].sort((a, b) => (b.best?.t ?? -100) - (a.best?.t ?? -100));
    $('#sx-race').innerHTML = rows.map(r => {
      const p = P(r.pid); if (!p) return '';
      const t = r.best?.t ?? 0, fill = Math.max(4, Math.min(100, (t + 10) / 1.1));
      return `<div class="sx-runner ${r.pid === pid ? 'me' : ''} ${v.giveup.includes(r.pid) ? 'gave' : ''}">
        ${avatarHTML(p, 34)}<div class="sx-rn"><b>${esc(p.name)}</b><small>${r.n} essai${r.n > 1 ? 's' : ''}${r.best?.per ? ` · ${r.best.per}‰` : ''}</small></div>
        <div class="sx-thermo" style="--f:${fill}%;--h:${heatCol(t)}"><i></i></div><em>${r.best ? r.best.t.toFixed(1) + '°' : '—'}</em><span class="sx-pts">${v.scores[r.pid] || 0}</span></div>`;
    }).join('');
    $('#sx-give').textContent = `🏳️ Abandonner ce mot (${v.giveup.length})`;
    $('#sx-give').classList.toggle('on', v.giveup.includes(pid));
    $('#sx-end').classList.toggle('hidden', !isHost() || v.stage === 'over');
  }
  function clock() {
    const v = V; if (!v || v.stage !== 'play') return;
    const s = Math.floor((Date.now() + (v.now - v._rt) - v.startAt) / 1000);
    $('#sx-time').textContent = `⏱️ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  setInterval(clock, 1000);

  function render(v) {
    const fresh = v.gameKey !== key;
    v._rt = Date.now(); V = v;
    if (fresh) { key = v.gameKey; build(); round = null; lastStage = null; }
    $('#sx-count').textContent = `Mot ${v.n}${v.total ? ' / ' + v.total : ' · ♾️'}`;
    const hs = v.hints || [];
    const hk = hs.length + ':' + v.round;
    if (hk !== render.hk) {
      if (render.hk && render.hk.split(':').slice(1).join(':') === v.round && hs.length) { sfx('legend', .5); toast(`💡 Nouvel indice : ${hs[hs.length - 1].txt}`); }
      render.hk = hk;
      $('#sx-hint').innerHTML = hs.map((h, i) => `<span class="sx-hc k-${h.k}" style="--i:${i}">${h.e} ${esc(h.txt)}</span>`).join('');
    }
    $('#sx-hint').classList.toggle('on', hs.length > 0);
    const H = v.helps || {}, U = v.used || {};
    $('#sx-boost').classList.toggle('hidden', !H.h_boost); $('#sx-spy').classList.toggle('hidden', !H.h_spy || state.players.filter(p => p.online).length < 2);
    $('#sx-boost-n').textContent = `${v.maxBoost - (U.boost || 0)}/${v.maxBoost}`; $('#sx-spy-n').textContent = `${v.maxSpy - (U.spy || 0)}/${v.maxSpy}`;
    $('#sx-boost').disabled = v.stage !== 'play' || (U.boost || 0) >= v.maxBoost; $('#sx-spy').disabled = v.stage !== 'play' || (U.spy || 0) >= v.maxSpy;
    if (v.round !== round) { round = v.round; last = null; $('#sx-spyres').classList.remove('on'); $('#sx-spyres').innerHTML = ''; if (v.stage === 'play') { msg('', ''); intro(v); } }
    drawList(v); drawRace(v); clock();
    $('#sx-form').classList.toggle('off', v.stage !== 'play');
    if (v.stage === 'reveal' && lastStage !== 'reveal') reveal(v);
    if (v.stage !== 'reveal') $('#sx-reveal').className = 'sx-reveal';
    $('#sx-room').classList.toggle('over', v.stage === 'over');
    if (v.stage === 'over') showEnd(v); else $('#sx-end-card').innerHTML = '';
    lastStage = v.stage;
  }
  function intro(v) {
    const r = $('#sx-reveal');
    r.innerHTML = `<div class="sx-new"><span>🌡️</span><b>Mot n°${v.n}</b><small>Un nouveau mot secret t'attend…</small></div>`;
    r.className = 'sx-reveal on intro';
    sfx('pop');
    setTimeout(() => { if (V?.stage === 'play') r.className = 'sx-reveal'; $('#sx-in')?.focus(); }, 1600);
  }
  function reveal(v) {
    const L = v.last, w = L.winner ? P(L.winner) : null, me = L.winner === pid;
    const r = $('#sx-reveal');
    r.innerHTML = `<div class="sx-win ${L.winner ? '' : 'lost'}">
      <small>${L.winner ? (me ? '🎉 TU AS TROUVÉ !' : `${esc(w?.name || '?')} a trouvé !`) : '🏳️ Mot abandonné…'}</small>
      <b class="sx-word">${esc(L.word.toUpperCase())}</b>
      ${w ? `<div class="sx-winner">${avatarHTML(w, 54)}<span>en ${L.counts[L.winner]} essai${L.counts[L.winner] > 1 ? 's' : ''} · +${L.gains[L.winner]} pts</span></div>` : ''}
      <div class="sx-near"><h5>🔥 Les mots les plus proches</h5>${L.near.map((n, i) => `<span style="--i:${i};--h:${heatCol(n.t)}">${esc(n.w)} <em>${n.t.toFixed(1)}°</em></span>`).join('')}</div>
      <div class="sx-gains">${Object.entries(L.gains).filter(([p]) => p !== L.winner).map(([p, g]) => `<span>${esc(P(p)?.name || '?')} +${g}</span>`).join('')}</div>
      <p class="sx-next">Prochain mot dans quelques secondes…</p></div>`;
    r.className = 'sx-reveal on';
    if (me) { burst(save.look.winFx, 40); sfx('legend'); setTimeout(() => sfx('legend'), 300); } else { sfx(L.winner ? 'pop' : 'buzzer', .6); if (L.winner) burst('fireworks', 14); }
  }
  function showEnd(v) {
    if ($('#sx-end-card').innerHTML) return;
    $('#sx-reveal').className = 'sx-reveal';
    const rk = v.ranking || [];
    $('#sx-end-card').innerHTML = `<div class="pz-end sx-endc"><h2>🔥 Fin de partie !</h2>${podium(rk)}
      <div class="sx-hist">${(v.history || []).map(h => `<span>${esc(h.word)} ${h.winner ? '→ ' + esc(P(h.winner)?.name || '?') : '🏳️'}</span>`).join('')}</div>
      ${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('sx')}</div>`;
    endWire('sx', rk);
  }
  window.SEM = { render };
})();

// ── petits outils partagés par les 4 nouveaux jeux ──
function podium(rk) {
  const P = (id) => state?.players.find(p => p.id === id);
  return `<div class="gp-podium">${rk.slice(0, 3).map((x, i) => { const p = P(x.pid); return `<div class="pod p${i + 1}">${p ? avatarHTML(p, i ? 56 : 76) : ''}<b>${esc(p?.name || '?')}</b><span>${x.pts} ${x.unit || 'pts'}</span><i>${i + 1}</i></div>`; }).join('')}</div>
    ${rk.length > 3 ? `<div class="dt-rest">${rk.slice(3).map((x, i) => `<span>#${i + 4} ${esc(P(x.pid)?.name || '?')} — ${x.pts} ${x.unit || 'pts'}</span>`).join('')}</div>` : ''}`;
}
function endBtns(p) { return `<div class="end-actions">${isHost() ? `<button class="btn btn-primary" id="${p}-replay">🔁 Rejouer</button><button class="btn btn-yellow" id="${p}-lobby">🏠 Salon</button>` : '<p class="muted">L\'hôte peut relancer une partie.</p>'}<button class="btn btn-shop" id="${p}-wheel">🎡 Roue de la chance</button></div>`; }
function endWire(p, rk) {
  $(`#${p}-replay`)?.addEventListener('click', () => gAct('replay'));
  $(`#${p}-lobby`)?.addEventListener('click', () => socket.emit('stop'));
  $(`#${p}-wheel`)?.addEventListener('click', () => window.WHEEL?.open());
  if (rk[0]?.pid === pid && rk.length > 1) { burst(save.look.winFx, 34); sfx('legend'); }
  setTimeout(() => document.querySelector('.pz-end')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
}
