// PLAYZUP — client « Punchline » (duels de vannes).
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, sk = null, timerIv = null;

  function build() {
    $('#v-punch').innerHTML = `
      <div class="pu-room">
        <div class="pu-curtain l"></div><div class="pu-curtain r"></div><div class="pu-spot"></div>
        <header class="pu-top"><div class="pu-logo">PUNCH<b>LINE</b><span>🎤</span></div><div class="pu-meta"><span class="pu-chip" id="pu-round"></span><div class="pu-timer" id="pu-timer"><i></i><span></span></div></div></header>
        <div class="pu-stage" id="pu-stage"></div>
        <aside class="pu-scores" id="pu-scores"></aside>
        <div id="pu-end"></div>
      </div>`;
  }
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); sk = null; }
    $('#pu-round').textContent = v.final ? `🏁 Le mot de la fin · ×3` : `Manche ${v.round} / ${v.rounds - 1} · ×${v.mult}`;
    const k = v.stage + ':' + v.round + ':' + (v.duel?.n || v.last?.prompt || '');
    if (k !== sk) { sk = k; stage(v); } else update(v);
    scores(v); timer(v);
    if (v.stage === 'over') showEnd(v); else $('#pu-end').innerHTML = '';
  }
  function timer(v) {
    clearInterval(timerIv);
    const el = $('#pu-timer'), on = ['write', 'vote'].includes(v.stage);
    el.classList.toggle('hidden', !on); if (!on) return;
    const end = Date.now() + v.left, tot = v.stage === 'write' ? v.time : (v.final ? 25000 : 18000);
    const t = () => { const l = Math.max(0, end - Date.now()); el.querySelector('i').style.transform = `scaleX(${l / tot})`; el.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; };
    t(); timerIv = setInterval(t, 250);
  }
  function stage(v) {
    const st = $('#pu-stage');
    if (v.stage === 'write') {
      st.innerHTML = `<div class="pu-write"><p class="pu-instr">${v.final ? '🏁 Tout le monde répond au même sujet. Fais-les rire une dernière fois !' : '✍️ Écris la réponse la plus drôle — ton adversaire a le même sujet !'}</p>
        ${v.mine.map((m, i) => `<form class="pu-card ${m.done ? 'done' : ''}" data-i="${m.i}" style="--i:${i}"><div class="pu-prompt">${esc(m.prompt)}</div>
          <div class="pu-row"><input class="input" maxlength="90" placeholder="Ta punchline…" value="${esc(m.text)}" autocomplete="off"><button class="btn pu-send">${m.done ? '✅' : '🎤'}</button></div></form>`).join('')}
        <div class="pu-done" id="pu-done"></div></div>`;
      $$('.pu-card').forEach(f => f.onsubmit = async (e) => {
        e.preventDefault();
        const r = await gAct('quip', { i: +f.dataset.i, text: f.querySelector('input').value });
        if (r?.error) return toast(r.error, 'error');
        f.classList.add('done'); f.querySelector('.pu-send').textContent = '✅'; sfx('pop');
        const nx = [...$$('.pu-card')].find(x => !x.classList.contains('done')); nx?.querySelector('input').focus();
      });
      setTimeout(() => $('.pu-card:not(.done) input')?.focus(), 200);
      sfx('card'); update(v);
    } else if (v.stage === 'vote') {
      const d = v.duel;
      st.innerHTML = `<div class="pu-duel ${v.final ? 'final' : ''}"><small>${v.final ? 'Le mot de la fin' : `Duel ${d.n} / ${d.total}`}</small>
        <div class="pu-prompt big">${esc(d.prompt)}</div>
        <div class="pu-vs">${d.entries.map((e, i) => `<button class="pu-bubble b${i % 2}" data-id="${e.id}" style="--i:${i}" ${!d.canVote || e.id === pid ? 'disabled' : ''}><span>${esc(e.text)}</span></button>${!v.final && i === 0 ? '<b class="pu-vsl">VS</b>' : ''}`).join('')}</div>
        <p class="pu-vnote" id="pu-vnote"></p></div>`;
      $$('.pu-bubble:not([disabled])').forEach(b => b.onclick = async () => { const r = await gAct('vote', b.dataset.id); if (r?.error) toast(r.error, 'error'); else sfx('pop'); });
      sfx('drum', .5); update(v);
    } else if (v.stage === 'duel') result(v);
    else if (v.stage === 'scores') {
      const ids = Object.keys(v.scores).sort((a, b) => v.scores[b] - v.scores[a]);
      st.innerHTML = `<div class="pu-board"><h3>🏆 Classement</h3>${ids.map((p, i) => `<div class="pu-line" style="--i:${i}"><span>${i + 1}</span>${P(p) ? avatarHTML(P(p), 34) : ''}<b>${esc(P(p)?.name || '?')}</b><em>${v.scores[p]}</em></div>`).join('')}</div>`;
      sfx('legend', .4);
    } else st.innerHTML = '';
  }
  function update(v) {
    if (v.stage === 'write') {
      const d = $('#pu-done'); if (d) d.innerHTML = Object.keys(v.scores).map(p => P(p) ? `<span class="${v.done.includes(p) ? 'ok' : ''}">${avatarHTML(P(p), 26)}</span>` : '').join('');
    }
    if (v.stage === 'vote') {
      const d = v.duel, n = $('#pu-vnote');
      $$('.pu-bubble').forEach(b => b.classList.toggle('picked', b.dataset.id === d.myVote));
      if (n) n.textContent = d.mine ? '😬 C\'est ton duel ! Croise les doigts…' : !d.canVote ? '' : d.myVote ? `✅ Vote enregistré (${d.voted}/${d.voters})` : `👆 Vote pour ta préférée (${d.voted}/${d.voters})`;
    }
  }
  function result(v) {
    const L = v.last, st = $('#pu-stage');
    const tot = L.entries.reduce((a, e) => a + e.votes, 0) || 1;
    st.innerHTML = `<div class="pu-duel res ${v.final ? 'final' : ''}"><div class="pu-prompt big">${esc(L.prompt)}</div>
      <div class="pu-vs">${[...L.entries].sort((a, b) => v.final ? b.votes - a.votes : 0).map((e, i) => `<div class="pu-bubble b${i % 2} ${L.punch === e.pid ? 'punch' : ''}" style="--i:${i}"><span>${esc(e.text || '(pas de réponse 😶)')}</span>
        <div class="pu-author">${P(e.pid) ? avatarHTML(P(e.pid), 30) : ''}<b>${esc(P(e.pid)?.name || '?')}</b></div>
        <div class="pu-meter"><i style="--p:${e.votes / tot * 100}%"></i><em>${e.votes} vote${e.votes > 1 ? 's' : ''}</em></div>${L.gains[e.pid] ? `<div class="pu-gain">+${L.gains[e.pid]}</div>` : ''}</div>`).join('')}</div>
      ${L.punch ? `<div class="pu-punch">💥 PUNCHLINE ! 💥</div>` : ''}</div>`;
    sfx(L.punch ? 'legend' : 'stamp', .7);
    if (L.punch) { burst('comics', 26); $('#v-punch').classList.remove('shake'); void $('#v-punch').offsetWidth; $('#v-punch').classList.add('shake'); }
    if (L.gains[pid]) setTimeout(() => sfx('legend', .5), 500);
  }
  function scores(v) {
    const ids = Object.keys(v.scores).sort((a, b) => v.scores[b] - v.scores[a]);
    $('#pu-scores').innerHTML = ids.map((p, i) => { const pl = P(p); return pl ? `<span class="${p === pid ? 'me' : ''}">${i + 1}. ${avatarHTML(pl, 22)} ${esc(pl.name)} <b>${v.scores[p]}</b></span>` : ''; }).join('');
  }
  function showEnd(v) {
    if ($('#pu-end').innerHTML) return;
    $('#pu-stage').innerHTML = '';
    $('#pu-end').innerHTML = `<div class="pz-end pu-endc"><h2>🎤 Le roi de la vanne est…</h2>${podium(v.ranking || [])}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('pu')}</div>`;
    endWire('pu', v.ranking || []);
  }
  window.PUNCH = { render };
})();
