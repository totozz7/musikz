// PLAYZUP — client « QUIZ » (arcade néon synthwave : 4 choix, vitesse, séries, manches « la moins répondue »).
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const SH = ['▲', '◆', '●', '■'];
  let V = null, key = null, qKey = null, rvKey = null, timerIv = null;

  function build() {
    $('#v-quiz').innerHTML = `
      <div class="qz-room" id="qz-room">
        <div class="qz-bg"><div class="qz-sun"></div><div class="qz-grid"></div><div class="qz-stars"></div></div>
        <header class="qz-top">
          <div class="qz-logo">QUIZ<b>!</b></div>
          <div class="qz-meta"><span class="qz-chip" id="qz-count"></span><span class="qz-chip qz-streak hidden" id="qz-streak"></span></div>
        </header>
        <div class="qz-stage" id="qz-stage"></div>
        <div class="qz-board" id="qz-board"></div>
        <div class="qz-fx" id="qz-fx"></div>
        <div class="qz-intro" id="qz-intro"><div class="qz-big">QUIZ<b>!</b></div><small>Prêts ? Buzzers en main…</small></div>
        <div id="qz-end"></div>
      </div>`;
  }
  function timer(v) {
    clearInterval(timerIv);
    const end = Date.now() + v.left, tot = v.qTime;
    const tick = () => {
      const l = Math.max(0, end - Date.now()), bar = $('#qz-bar'), num = $('#qz-sec');
      if (!bar) return clearInterval(timerIv);
      bar.style.transform = `scaleX(${l / tot})`; num.textContent = Math.ceil(l / 1000);
      $('#qz-timer').classList.toggle('hot', l < 4000);
    };
    tick(); timerIv = setInterval(tick, 100);
  }
  function locked(v) {
    return `<div class="qz-locked">${v.answered.map(id => P(id) ? `<span class="qz-lk">${avatarHTML(P(id), 30)}</span>` : '').join('')}<small>${v.answered.length} / ${Object.keys(v.scores).length} ont répondu</small></div>`;
  }
  function question(v) {
    const q = v.q, rare = q.type === 'rare';
    $('#qz-room').classList.toggle('rare', rare);
    $('#qz-stage').innerHTML = `
      <div class="qz-qhead"><span class="qz-theme">${q.theme.emoji} ${esc(q.theme.name)}</span><span class="qz-num">Question ${v.n} / ${v.total}</span></div>
      <div class="qz-card ${rare ? 'rare' : ''}"><h2>${esc(q.text)}</h2>${rare ? '<p class="qz-hint">🦄 Donne une bonne réponse… que les autres n\'auront PAS donnée !</p>' : ''}</div>
      <div class="qz-timer" id="qz-timer"><i id="qz-bar"></i><span id="qz-sec"></span></div>
      ${rare ? `<form class="qz-say" id="qz-say" autocomplete="off"><input class="input" id="qz-in" maxlength="40" placeholder="Ta réponse rare…" autocomplete="off" spellcheck="false"><button class="btn btn-primary">🦄 Envoyer</button></form>`
        : `<div class="qz-opts">${q.options.map((o, i) => `<button class="qz-opt o${i}" data-i="${i}" style="--i:${i}"><span class="qz-sh">${SH[i]}</span><b>${esc(o)}</b><em class="qz-who"></em></button>`).join('')}</div>`}
      <div id="qz-locked"></div>`;
    timer(v);
    if (rare) {
      const inp = $('#qz-in'); setTimeout(() => inp?.focus(), 80);
      $('#qz-say').onsubmit = async (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; inp.disabled = true; const r = await gAct('say', t); if (r?.error) { toast(r.error, 'error'); inp.disabled = false; } else sfx('stamp'); };
    } else $$('#qz-stage .qz-opt').forEach(b => b.onclick = async () => {
      if (V.mine || V.stage !== 'q') return;
      $$('#qz-stage .qz-opt').forEach(x => x.classList.toggle('chosen', x === b));
      $('#qz-stage .qz-opts').classList.add('lock'); sfx('click');
      const r = await gAct('pick', +b.dataset.i); if (r?.error) toast(r.error, 'error');
    });
  }
  function update(v) { // pendant la question : qui a répondu
    $('#qz-locked').innerHTML = locked(v);
    if (v.mine && v.q.type === 'mcq') { $$('#qz-stage .qz-opt').forEach((x, i) => x.classList.toggle('chosen', i === v.mine.i)); $('#qz-stage .qz-opts')?.classList.add('lock'); }
    if (v.mine && v.q.type === 'rare') { const f = $('#qz-say'); if (f) f.outerHTML = `<div class="qz-sent">🦄 Ta réponse : <b>${esc(v.mine.text)}</b> — on attend les autres…</div>`; }
  }
  function reveal(v) {
    clearInterval(timerIv);
    const q = v.q, my = v.gains?.[pid] || 0;
    $('#qz-timer')?.classList.add('done');
    if (q.type === 'mcq') {
      $$('#qz-stage .qz-opt').forEach((b, i) => {
        b.classList.add(i === v.good ? 'good' : 'bad'); b.disabled = true;
        const who = Object.entries(v.picks || {}).filter(([, k]) => k === i).map(([id]) => P(id)).filter(Boolean);
        b.querySelector('.qz-who').innerHTML = who.map((p, k) => `<span style="--k:${k}">${avatarHTML(p, 26)}</span>`).join('');
      });
    } else {
      const g = v.groups || [];
      const sent = $('#qz-stage .qz-sent'); if (sent) sent.innerHTML = v.mine ? `🦄 Ta réponse : <b>${esc(v.mine.text)}</b>` : '⏰ Pas de réponse';
      $('#qz-stage').querySelector('#qz-locked').innerHTML = '';
      const box = document.createElement('div'); box.className = 'qz-rare';
      box.innerHTML = `${g.length ? g.map((x, k) => `<div class="qz-bub ${x.rare ? 'top' : ''}" style="--k:${k};--s:${Math.min(1.5, .85 + x.pids.length * .15)}"><b>${esc(x.name)}</b>${x.rare ? '<em>🦄 la plus rare !</em>' : `<em>×${x.pids.length}</em>`}<span>${x.pids.map(id => P(id) ? avatarHTML(P(id), 22) : '').join('')}</span></div>`).join('') : '<p class="qz-none">Personne n\'a trouvé de bonne réponse 😅</p>'}
        ${(v.wrong || []).length ? `<div class="qz-wrong">❌ ${v.wrong.map(w => `<s>${esc(w.text)}</s>`).join(' · ')}</div>` : ''}
        ${(v.ideas || []).length ? `<div class="qz-ideas">💡 Personne n'a pensé à : ${v.ideas.map(esc).join(', ')}</div>` : ''}`;
      $('#qz-stage').appendChild(box);
    }
    const fx = $('#qz-fx');
    const st = v.streak?.[pid] || 0;
    fx.innerHTML = my ? `<div class="qz-gain"><b>+${my}</b>${st >= 3 ? `<span>🔥 Série de ${st} !</span>` : ''}</div>` : (v.mine ? '<div class="qz-gain miss"><b>RATÉ</b><span>😵</span></div>' : '<div class="qz-gain miss"><b>TROP TARD</b><span>⏰</span></div>');
    setTimeout(() => fx.firstChild?.classList.add('out'), 1700);
    if (my) { sfx(my >= 900 ? 'legend' : 'pop'); if (my >= 900) burst(save.look.winFx, 10); } else sfx('buzzer');
  }
  function board(v) {
    const order = Object.entries(v.scores).sort((a, b) => b[1] - a[1]);
    const prev = v.prevRank || [];
    $('#qz-board').innerHTML = order.map(([id, pts], k) => {
      const p = P(id); if (!p) return '';
      const was = prev.indexOf(id), mv = v.stage === 'reveal' && was >= 0 ? was - k : 0, gain = v.stage === 'reveal' ? v.gains?.[id] || 0 : 0;
      return `<div class="qz-row ${id === pid ? 'me' : ''} ${mv > 0 ? 'up' : mv < 0 ? 'down' : ''}" style="--k:${k};--mv:${mv}"><span class="qz-pos">${k + 1}</span>${avatarHTML(p, 30)}<b>${esc(p.name)}</b>
        ${(v.streak?.[id] || 0) >= 3 ? `<span class="qz-fire">🔥${v.streak[id]}</span>` : ''}${gain ? `<em class="qz-plus">+${gain}</em>` : ''}<span class="qz-pts">${pts.toLocaleString('fr-FR')}</span>${mv > 0 ? '<i class="qz-arr">▲</i>' : mv < 0 ? '<i class="qz-arr d">▼</i>' : ''}</div>`;
    }).join('');
  }
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); qKey = rvKey = null; }
    $('#qz-count').textContent = v.total ? `${Math.max(1, v.n)} / ${v.total}` : '';
    const st = v.streak?.[pid] || 0;
    $('#qz-streak').classList.toggle('hidden', st < 2); $('#qz-streak').textContent = `🔥 Série ×${st}`;
    $('#qz-intro').classList.toggle('on', v.stage === 'intro');
    if (v.stage === 'intro' && fresh) sfx('drum');
    if ((v.stage === 'q' || v.stage === 'reveal') && v.key !== qKey) { qKey = v.key; $('#qz-fx').innerHTML = ''; question(v); sfx('card'); }
    if (v.stage === 'q') update(v);
    if (v.stage === 'reveal' && rvKey !== v.key) { rvKey = v.key; reveal(v); }
    board(v);
    $('#qz-room').classList.toggle('over', v.stage === 'over');
    if (v.stage === 'over') { clearInterval(timerIv); showEnd(v); } else $('#qz-end').innerHTML = '';
  }
  function showEnd(v) {
    if ($('#qz-end').innerHTML) return;
    $('#qz-end').innerHTML = `<div class="pz-end qz-endc"><h2>❓ Champion du Quiz !</h2>${podium(v.ranking || [])}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('qz')}</div>`;
    endWire('qz', v.ranking || []);
  }
  window.QUIZ = { render };
})();
