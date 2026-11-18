// PLAYZUP — client « Le Bluff ».
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, sk = null, timerIv = null;

  function build() {
    $('#v-bluff').innerHTML = `
      <div class="bf-room">
        <header class="bf-top">
          <div class="bf-mast"><small>Édition spéciale · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</small><b>LE BLUFF</b><small>« Toute la vérité, rien que la vérité… ou presque »</small></div>
          <div class="bf-meta"><span class="bf-chip" id="bf-round"></span><div class="bf-timer" id="bf-timer"><i></i><span></span></div></div>
        </header>
        <div class="bf-stage" id="bf-stage"></div>
        <aside class="bf-scores" id="bf-scores"></aside>
        <div id="bf-end"></div>
      </div>`;
  }
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); sk = null; }
    $('#bf-round').textContent = `Anecdote ${Math.min(v.round, v.rounds)} / ${v.rounds}${v.final ? ' · points ×2 !' : ''}`;
    const k = v.stage + ':' + v.round;
    if (k !== sk) { sk = k; stage(v); } else update(v);
    scores(v); timer(v);
    if (v.stage === 'over') showEnd(v); else $('#bf-end').innerHTML = '';
  }
  function timer(v) {
    clearInterval(timerIv);
    const el = $('#bf-timer'), on = ['write', 'vote'].includes(v.stage);
    el.classList.toggle('hidden', !on); if (!on) return;
    const end = Date.now() + v.left, tot = v.stage === 'write' ? v.time : 30000;
    const t = () => { const l = Math.max(0, end - Date.now()); el.querySelector('i').style.transform = `scaleX(${l / tot})`; el.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; };
    t(); timerIv = setInterval(t, 250);
  }
  const q = (v) => esc(v.q || '').replace('___', '<span class="bf-blank">_______</span>');
  function stage(v) {
    const st = $('#bf-stage');
    if (v.stage === 'write') {
      st.innerHTML = `<article class="bf-paper"><h2 class="bf-q">${q(v)}</h2>
        <p class="bf-instr">✍️ Invente une réponse <b>crédible</b> pour piéger les autres.</p>
        <form class="bf-form" id="bf-form" autocomplete="off"><input class="input" id="bf-in" maxlength="50" placeholder="Ton bluff…" value="${esc(v.myLie || '')}"><button class="btn bf-btn">🎭 Bluffer</button></form>
        <div class="bf-fb" id="bf-fb"></div><div class="bf-wrote" id="bf-wrote"></div></article>`;
      $('#bf-form').onsubmit = async (e) => {
        e.preventDefault();
        const r = await gAct('lie', $('#bf-in').value);
        const fb = $('#bf-fb');
        if (r?.error) { fb.className = 'bf-fb err'; fb.textContent = r.error; sfx('buzzer', .4); if (r.truth) { $('#bf-in').value = ''; } }
        else if (r?.ok) { fb.className = 'bf-fb ok'; fb.textContent = '✅ Bluff enregistré ! (tu peux encore le changer)'; sfx('pop'); }
      };
      sfx('card'); setTimeout(() => $('#bf-in')?.focus(), 200);
      update(v);
    } else if (v.stage === 'vote') {
      st.innerHTML = `<article class="bf-paper"><h2 class="bf-q">${q(v)}</h2><p class="bf-instr">🔍 Laquelle est la <b>vraie</b> réponse ?</p>
        <div class="bf-opts">${v.options.map((o, i) => `<button class="bf-opt ${o.mine ? 'mine' : ''}" data-id="${o.id}" style="--i:${i};--r:${(i % 2 ? 1 : -1) * (1 + (i * 7) % 3)}deg" ${o.mine ? 'disabled' : ''}><span>${esc(o.text)}</span>${o.mine ? '<small>ton bluff</small>' : ''}</button>`).join('')}</div>
        <div class="bf-wrote" id="bf-wrote"></div></article>`;
      $$('.bf-opt:not([disabled])').forEach(b => b.onclick = async () => { const r = await gAct('pick', +b.dataset.id); if (r?.error) toast(r.error, 'error'); else sfx('pop'); });
      update(v);
    } else if (v.stage === 'reveal') reveal(v);
    else st.innerHTML = '';
  }
  function update(v) {
    const w = $('#bf-wrote'); if (!w) return;
    const done = v.stage === 'write' ? v.wrote : v.picked;
    w.innerHTML = Object.keys(v.scores).map(p => { const pl = P(p); return pl ? `<span class="${done.includes(p) ? 'ok' : ''}">${avatarHTML(pl, 26)}</span>` : ''; }).join('') + `<small>${done.length} / ${Object.keys(v.scores).length} ${v.stage === 'write' ? 'ont bluffé' : 'ont voté'}</small>`;
    if (v.stage === 'vote') $$('.bf-opt').forEach(b => b.classList.toggle('picked', +b.dataset.id === v.myPick));
  }
  async function reveal(v) {
    const st = $('#bf-stage');
    const opts = [...v.options].sort((a, b) => (a.truth ? 1 : 0) - (b.truth ? 1 : 0) || b.pickers.length - a.pickers.length);
    st.innerHTML = `<article class="bf-paper"><h2 class="bf-q">${q(v)}</h2><div class="bf-reveal" id="bf-rev"></div></article>`;
    const box = $('#bf-rev');
    for (const o of opts) {
      if (!$('#bf-rev') || V.stage !== 'reveal') return;
      const el = document.createElement('div');
      el.className = 'bf-card ' + (o.truth ? 'truth' : o.house ? 'house' : 'lie');
      el.innerHTML = `<div class="bf-ct">${esc(o.text)}</div>
        <div class="bf-pick">${o.pickers.map(p => P(p) ? `<span>${avatarHTML(P(p), 28)}</span>` : '').join('') || '<em>personne</em>'}</div>
        <div class="bf-stamp">${o.truth ? '✔ VÉRITÉ' : o.house ? '🏛️ PIÈGE DE LA MAISON' : `🎭 BLUFF de ${o.authors.map(a => esc(P(a)?.name || '?')).join(' & ')}`}</div>
        ${!o.truth && !o.house && o.pickers.length ? `<div class="bf-gain">+${o.pickers.length * 50 * (v.final ? 2 : 1)} pour ${o.authors.map(a => esc(P(a)?.name || '?')).join(' & ')}</div>` : ''}
        ${o.truth && o.pickers.length ? `<div class="bf-gain">+${100 * (v.final ? 2 : 1)} chacun</div>` : ''}`;
      box.appendChild(el);
      sfx('card', .8);
      await new Promise(r => setTimeout(r, 650));
      el.classList.add('stamped'); sfx(o.truth ? 'legend' : 'stamp', .7);
      if (o.truth && o.pickers.includes(pid)) burst('party', 14);
      if (!o.truth && o.authors.includes(pid) && o.pickers.length) burst('money', 12);
      await new Promise(r => setTimeout(r, 1050));
    }
  }
  function scores(v) {
    const ids = Object.keys(v.scores).sort((a, b) => v.scores[b] - v.scores[a]);
    $('#bf-scores').innerHTML = ids.map((p, i) => { const pl = P(p); return pl ? `<span class="${p === pid ? 'me' : ''}">${i + 1}. ${avatarHTML(pl, 22)} ${esc(pl.name)} <b>${v.scores[p]}</b>${v.gains?.[p] && v.stage === 'reveal' ? ` <em>+${v.gains[p]}</em>` : ''}</span>` : ''; }).join('');
  }
  function showEnd(v) {
    if ($('#bf-end').innerHTML) return;
    $('#bf-stage').innerHTML = '';
    $('#bf-end').innerHTML = `<div class="pz-end bf-endc"><h2>🎭 Le roi du mensonge est…</h2>${podium(v.ranking || [])}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('bf')}</div>`;
    endWire('bf', v.ranking || []);
  }
  window.BLUFF = { render };
})();
