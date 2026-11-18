// PLAYZUP — client « Petit Bac ».
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  let V = null, key = null, rk = null, lastStage = null, timerIv = null, sendT = {};

  function build() {
    $('#v-bac').innerHTML = `
      <div class="bc-room">
        <header class="bc-top">
          <div class="bc-logo">Petit<b>Bac</b></div>
          <div class="bc-letter" id="bc-letter"></div>
          <div class="bc-meta"><span class="bc-chip" id="bc-round"></span><div class="bc-timer" id="bc-timer"><i></i><span></span></div></div>
        </header>
        <div class="bc-stage" id="bc-stage"></div>
        <aside class="bc-scores" id="bc-scores"></aside>
        <div class="bc-fx" id="bc-fx"></div>
        <div id="bc-end"></div>
      </div>`;
  }
  const strip = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/^(le |la |les |l'|l’|un |une |des |du |de la |de l'|d')/, '');
  function render(v) {
    const fresh = v.gameKey !== key;
    V = v;
    if (fresh) { key = v.gameKey; build(); rk = null; lastStage = null; }
    $('#bc-round').textContent = `Lettre ${Math.min(v.round, v.rounds)} / ${v.rounds}`;
    $('#bc-letter').innerHTML = v.letter && v.stage !== 'roll' ? `<span>${v.letter}</span>` : '';
    const k = v.stage + ':' + v.round;
    if (k !== rk) { rk = k; stage(v); }
    else if (v.stage === 'write' || v.stage === 'stopping') progress(v);
    else if (v.stage === 'vote') voteTable(v, false);
    scores(v); timer(v);
    if (v.stage === 'over') showEnd(v); else $('#bc-end').innerHTML = '';
    lastStage = v.stage;
  }
  function timer(v) {
    clearInterval(timerIv);
    const el = $('#bc-timer'), on = ['write', 'vote'].includes(v.stage);
    el.classList.toggle('hidden', !on); if (!on) return;
    const end = Date.now() + v.left, tot = v.stage === 'write' ? v.time : Math.max(v.left, 1);
    const t = () => { const l = Math.max(0, end - Date.now()); el.querySelector('i').style.transform = `scaleX(${l / tot})`; el.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; el.classList.toggle('hot', v.stage === 'write' && l < 10000); };
    t(); timerIv = setInterval(t, 250);
  }
  function stage(v) {
    const st = $('#bc-stage');
    if (v.stage === 'roll') {
      const L = 'ABCDEFGHIJLMNOPRSTV';
      st.innerHTML = `<div class="bc-roll"><small>Lettre ${v.round}</small><div class="bc-reel" id="bc-reel">${Array.from({ length: 26 }, (_, i) => `<b>${L[(i * 7) % L.length]}</b>`).join('')}<b class="fin">${v.letter}</b></div><p>Prépare ton stylo…</p></div>`;
      sfx('spin', .8); setTimeout(() => { sfx('stamp'); burst('party', 10); }, 2400);
    } else if (v.stage === 'write' || v.stage === 'stopping') {
      st.innerHTML = `<div class="bc-sheet">
        <div class="bc-cats">${v.cats.map((c, i) => `<label class="bc-cat" style="--i:${i}"><span class="bc-cn">${esc(c)}</span><span class="bc-in"><em>${v.letter}</em><input data-i="${i}" maxlength="40" autocomplete="off" spellcheck="false" value="${esc(v.mine[i] || '')}" placeholder="${v.letter}…"></span><i class="bc-ok"></i></label>`).join('')}</div>
        <div class="bc-actions"><button class="btn bc-stop" id="bc-stop">✋ STOP !</button><div class="bc-others" id="bc-others"></div></div></div>
        <div class="bc-stopping ${v.stage === 'stopping' ? 'on' : ''}" id="bc-stopping"></div>`;
      $$('.bc-in input').forEach(inp => {
        const check = () => { const ok = strip(inp.value).charAt(0).toUpperCase() === v.letter; inp.closest('.bc-cat').classList.toggle('good', !!inp.value.trim() && ok); inp.closest('.bc-cat').classList.toggle('bad', !!inp.value.trim() && !ok); };
        check();
        inp.oninput = () => { check(); clearTimeout(sendT[inp.dataset.i]); sendT[inp.dataset.i] = setTimeout(() => gAct('answer', { i: +inp.dataset.i, text: inp.value }), 250); stopBtn(); };
        inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); const nx = $(`.bc-in input[data-i="${+inp.dataset.i + 1}"]`); nx ? nx.focus() : $('#bc-stop').focus(); } };
      });
      $('#bc-stop').onclick = async () => {
        await Promise.all($$('.bc-in input').map(inp => gAct('answer', { i: +inp.dataset.i, text: inp.value })));
        const r = await gAct('stop'); if (r?.error) toast(r.error, 'error');
      };
      stopBtn(); progress(v);
      setTimeout(() => $('.bc-in input')?.focus(), 100);
    } else if (v.stage === 'vote') {
      voteTable(v, true);
      sfx('stamp');
    } else if (v.stage === 'results') {
      voteTable(v, true);
      const pts = v.roundPts || {};
      if (pts[pid]) setTimeout(() => sfx('legend', .5), 400);
    } else st.innerHTML = '';
  }
  function stopBtn() { const all = $$('.bc-in input').every(i => i.value.trim()); $('#bc-stop')?.classList.toggle('ready', all); }
  function progress(v) {
    const o = $('#bc-others'); if (!o) return;
    o.innerHTML = Object.keys(v.scores).filter(p => p !== pid).map(p => { const pl = P(p); const f = v.filled[p] || 0; return pl ? `<span class="bc-oth">${avatarHTML(pl, 26)}<i style="--f:${f / v.cats.length * 100}%"></i><small>${f}/${v.cats.length}</small></span>` : ''; }).join('');
    const sp = $('#bc-stopping');
    if (v.stage === 'stopping' && sp && !sp.innerHTML) {
      const who = P(v.stopper);
      sp.innerHTML = `<div class="bc-stopstamp">STOP !</div><p>${esc(who?.name || '?')} a tout rempli ! Dernières secondes…</p>`;
      sp.classList.add('on'); sfx('klaxon', .7);
      $('#v-bac').classList.remove('shake'); void $('#v-bac').offsetWidth; $('#v-bac').classList.add('shake');
    }
  }
  function voteTable(v, fresh) {
    const st = $('#bc-stage'), voting = v.stage === 'vote';
    const html = `<div class="bc-vote ${voting ? '' : 'res'}">
      <p class="bc-vh">${voting ? '🕵️ Vérifie les réponses des autres : clique sur une réponse pour voter ❌ contre elle.' : '🧮 Résultats de la lettre ' + v.letter}</p>
      <div class="bc-vcats">${v.cats.map((c, i) => `<div class="bc-vcat" style="--i:${i}"><h5>${esc(c)}</h5><div class="bc-ans">${v.table[i].map(a => {
        const pl = P(a.pid); if (!pl) return '';
        const empty = !a.a.trim(), mine = a.pid === pid;
        const cls = empty ? 'empty' : a.bad ? 'bad' : a.votes ? 'contest' : '';
        const pts = a.pts !== null && a.pts !== undefined ? `<b class="bc-pts p${a.pts}">${a.pts ? '+' + a.pts : '0'}</b>` : '';
        return `<button class="bc-a ${cls} ${mine ? 'mine' : ''} ${a.mine ? 'voted' : ''}" data-i="${i}" data-p="${a.pid}" ${!voting || mine || empty || a.bad ? 'disabled' : ''}>
          ${avatarHTML(pl, 22)}<span>${empty ? '—' : esc(a.a)}</span>${a.bad ? '<em>✗ lettre</em>' : a.votes ? `<em>❌ ${a.votes}</em>` : ''}${pts}</button>`;
      }).join('')}</div></div>`).join('')}</div>
      ${voting ? `<div class="bc-vfoot"><button class="btn btn-primary" id="bc-ready">${v.ready.includes(pid) ? '✅ Prêt — on attend les autres' : '👍 J\'ai fini de vérifier'}</button>${isHost() ? '<button class="btn btn-ghost" id="bc-next">⏭ Compter les points</button>' : ''}<small>${v.ready.length} / ${Object.keys(v.scores).length} prêts</small></div>`
        : `<div class="bc-roundpts">${Object.entries(v.roundPts || {}).sort((a, b) => b[1] - a[1]).map(([p, n], i) => `<span style="--i:${i}">${esc(P(p)?.name || '?')} <b>+${n}</b>${v.stopper === p ? ' ✋' : ''}</span>`).join('') || '<em>Personne ne marque…</em>'}</div>`}
    </div>`;
    st.innerHTML = html;
    if (!fresh) st.querySelector('.bc-vote').classList.add('still');
    $$('.bc-a:not([disabled])').forEach(b => b.onclick = () => { gAct('vote', { i: +b.dataset.i, pid: b.dataset.p }); sfx('pop', .4); });
    $('#bc-ready')?.addEventListener('click', () => gAct('ready'));
    $('#bc-next')?.addEventListener('click', () => gAct('next'));
  }
  function scores(v) {
    const ids = Object.keys(v.scores).sort((a, b) => v.scores[b] - v.scores[a]);
    $('#bc-scores').innerHTML = ids.map((p, i) => { const pl = P(p); return pl ? `<span class="${p === pid ? 'me' : ''}">${i + 1}. ${avatarHTML(pl, 22)} ${esc(pl.name)} <b>${v.scores[p]}</b></span>` : ''; }).join('');
  }
  function showEnd(v) {
    if ($('#bc-end').innerHTML) return;
    $('#bc-stage').innerHTML = '';
    $('#bc-end').innerHTML = `<div class="pz-end bc-endc"><h2>📋 Fin du Petit Bac !</h2>${podium(v.ranking || [])}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('bc')}</div>`;
    endWire('bc', v.ranking || []);
  }
  window.BAC = { render };
})();
