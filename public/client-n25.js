// PLAYZUP — client « 25 PILE » : 25 questions, 25 boules numérotées, chacune sert une fois.
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, selQ = null, selN = null, timerIv = null, revealed = false;
  const hue = (n) => (n * 47) % 360;

  function build() {
    $('#v-n25').innerHTML = `
      <div class="nz-room" id="nz-room">
        <header class="nz-top">
          <div class="nz-logo"><span class="nz-b">25</span><b>PILE</b></div>
          <div class="nz-meta"><span class="nz-chip" id="nz-mode"></span><span class="nz-clock" id="nz-clock">⏱️ <b id="nz-time"></b></span></div>
        </header>
        <div class="nz-race" id="nz-race"></div>
        <p class="nz-help" id="nz-help">👉 Clique une question, puis une boule (ou l'inverse). Clique une boule déjà posée pour la retirer.</p>
        <div class="nz-main">
          <div class="nz-qs" id="nz-qs"></div>
          <div class="nz-side">
            <div class="nz-tray" id="nz-tray"></div>
            <div class="nz-actions"><button class="btn btn-ghost" id="nz-check"></button><button class="btn btn-primary" id="nz-done">✅ Valider ma grille</button></div>
            <div class="nz-checkres" id="nz-checkres"></div>
          </div>
        </div>
        <div id="nz-end"></div>
      </div>`;
    $('#nz-check').onclick = async () => {
      const r = await gAct('check'); if (!r) return;
      if (r.error) return toast(r.error, 'error');
      sfx(r.ok >= 20 ? 'legend' : 'card');
      $('#nz-checkres').innerHTML = `🔍 <b>${r.ok}</b> bonne${r.ok > 1 ? 's' : ''} réponse${r.ok > 1 ? 's' : ''} sur ${r.placed} placée${r.placed > 1 ? 's' : ''}`;
      $('#nz-checkres').classList.remove('pop'); void $('#nz-checkres').offsetWidth; $('#nz-checkres').classList.add('pop');
    };
    $('#nz-done').onclick = async () => {
      const left = 25 - Object.keys(V.mine).length;
      if (left && !confirm(`Il te reste ${left} question${left > 1 ? 's' : ''} sans réponse. Valider quand même ?`)) return;
      const r = await gAct('done'); if (r?.error) toast(r.error, 'error'); else { sfx('stamp'); burst('party', 10); }
    };
  }
  async function place(i, n) {
    selQ = selN = null;
    const r = await gAct('set', { i, n }); if (r?.error) toast(r.error, 'error'); else sfx(n ? 'pop' : 'click', .6);
    const card = $(`#nz-qs [data-q="${i}"]`); card?.classList.remove('drop'); void card?.offsetWidth; if (n) card?.classList.add('drop');
  }
  function grid(v) {
    const over = v.stage === 'over', lock = v.done || over;
    $('#nz-qs').innerHTML = v.questions.map((q, k) => {
      const n = v.mine[q.i], ok = over && n === q.n;
      return `<button class="nz-q ${n ? 'set' : ''} ${selQ === q.i ? 'sel' : ''} ${over ? (ok ? 'ok' : 'ko') : ''}" data-q="${q.i}" style="--k:${k}" ${lock ? 'disabled' : ''}>
        <span class="nz-slot" ${n ? `style="--h:${hue(n)}"` : ''}>${n || '?'}</span><span class="nz-txt">${esc(q.text)}</span>
        ${over ? `<span class="nz-sol" style="--h:${hue(q.n)};--k:${k}">${ok ? '✔' : q.n}</span>` : ''}</button>`;
    }).join('');
    $$('#nz-qs .nz-q').forEach(b => b.onclick = () => {
      const i = +b.dataset.q;
      if (selN) return place(i, selN);
      selQ = selQ === i ? null : i; grid(V); tray(V);
    });
  }
  function tray(v) {
    const used = new Set(Object.values(v.mine)), lock = v.done || v.stage === 'over';
    $('#nz-tray').innerHTML = Array.from({ length: 25 }, (_, k) => k + 1).map(n => `<button class="nz-ball ${used.has(n) ? 'used' : ''} ${selN === n ? 'sel' : ''}" data-n="${n}" style="--h:${hue(n)};--k:${n}" ${lock ? 'disabled' : ''}><b>${n}</b></button>`).join('');
    $$('#nz-tray .nz-ball').forEach(b => b.onclick = () => {
      const n = +b.dataset.n;
      if (selQ !== null) return place(selQ, n);
      if (used.has(n)) { const i = Object.keys(V.mine).find(k => V.mine[k] === n); if (i !== undefined) return place(+i, null); }
      selN = selN === n ? null : n; tray(V); grid(V);
    });
  }
  function race(v) {
    $('#nz-race').innerHTML = v.race.map(r => { const p = P(r.pid); if (!p) return ''; return `<div class="nz-rc ${r.pid === pid ? 'me' : ''} ${r.done ? 'done' : ''}">${avatarHTML(p, 26)}<b>${esc(p.name)}</b><i style="--f:${r.placed * 4}%"></i><em>${r.done ? '✅' : r.placed + '/25'}</em></div>`; }).join('');
  }
  function clock(v) {
    clearInterval(timerIv);
    if (v.stage !== 'play') { $('#nz-clock').classList.add('hidden'); return; }
    $('#nz-clock').classList.remove('hidden');
    const end = Date.now() + v.left;
    const tick = () => { const l = Math.max(0, end - Date.now()), s = Math.ceil(l / 1000); $('#nz-time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; $('#nz-clock').classList.toggle('hot', l < 30000); };
    tick(); timerIv = setInterval(tick, 500);
  }
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); selQ = selN = null; revealed = false; }
    $('#nz-mode').textContent = { easy: '😊 Facile', medium: '🧐 Moyen', mix: '🎲 Mélange' }[v.mode] || '';
    const over = v.stage === 'over';
    $('#nz-check').textContent = `🔍 Vérifier (${v.checksLeft})`;
    $('#nz-check').disabled = v.done || over || v.checksLeft <= 0;
    $('#nz-check').classList.toggle('hidden', !v.maxChecks);
    $('#nz-done').classList.toggle('hidden', v.done || over);
    $('#nz-help').textContent = over ? '🎬 Les bonnes réponses :' : v.done ? '✅ Grille validée ! On attend les autres…' : '👉 Clique une question, puis une boule (ou l\'inverse). Clique une boule déjà posée pour la retirer.';
    const tb = document.querySelector('#screen-room .topbar, .screen.active .topbar'); if (tb) $('#nz-room').style.setProperty('--hdr', tb.offsetHeight + 'px');
    clock(v); race(v); grid(v); tray(v);
    $('#nz-room').classList.toggle('over', over);
    if (over && !revealed) { revealed = true; const ok = v.questions.filter(q => v.mine[q.i] === q.n).length; sfx(ok >= 20 ? 'legend' : 'drum'); if (ok === 25) burst(save.look.winFx, 30); setTimeout(() => showEnd(v, ok), 25 * 90 + 600); }
  }
  function showEnd(v, ok) {
    if ($('#nz-end').innerHTML) return;
    $('#nz-end').innerHTML = `<div class="pz-end nz-endc"><h2>🎯 ${ok === 25 ? '25 / 25 — PARFAIT !' : `Tu as ${ok} / 25`}</h2>${podium((v.ranking || []).map(r => ({ pid: r.pid, pts: r.pts })))}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('nz')}</div>`;
    endWire('nz', v.ranking || []);
    $('#nz-end').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  window.N25 = { render };
})();
