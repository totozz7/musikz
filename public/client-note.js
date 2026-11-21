// PLAYZUP — client Jeu de la Note (utilise les fonctions de app.js : $, esc, avatarHTML, nameHTML, state, pid, gAct…)
(function () {
  const P = (id) => state?.players.find(p => p.id === id) || { name: '?', avatar: '❔', color: '#999' };
  const hue = (n) => Math.round(((n - 1) / 9) * 120); // 1 = rouge → 10 = vert
  let picked = [], lastKey = '', timerIv = null, draftTimer = null;

  function timer(left, total) {
    clearInterval(timerIv);
    const end = Date.now() + left;
    const tick = () => {
      const el = $('#nt-timer'); if (!el) return clearInterval(timerIv);
      const l = Math.max(0, end - Date.now());
      el.querySelector('i').style.transform = `scaleX(${Math.min(1, l / total)})`;
      el.querySelector('span').textContent = Math.ceil(l / 1000) + ' s';
      el.classList.toggle('hurry', l < 10000);
      if (!l) clearInterval(timerIv);
    };
    tick(); timerIv = setInterval(tick, 250);
  }

  const noteBadge = (n, big = false) => `<div class="nt-note ${big ? 'big' : ''}" style="--h:${hue(n)}"><b>${n}</b><small>/10</small></div>`;
  const gauge = (n, guesses = []) => `<div class="nt-gauge">${Array.from({ length: 10 }, (_, i) => {
    const k = i + 1, who = guesses.filter(g => g.guess === k);
    return `<div class="seg ${k === n ? 'hit' : ''}" style="--h:${hue(k)}"><span>${k}</span>${who.map(g => `<em title="${esc(P(g.pid).name)}">${esc(P(g.pid).avatar)}</em>`).join('')}</div>`;
  }).join('')}</div>`;
  const themeCard = (t, extra = '') => `<div class="nt-theme"><b>${esc(t.name)}</b><small><span class="lo">${esc(t.low)}</span><span class="hi">${esc(t.high)}</span></small>${extra}</div>`;

  function render(v) {
    const root = $('#v-note');
    const key = v.stage + v.round;
    if (key !== lastKey && v.stage === 'pick') picked = [];
    const host = isHost();
    const A = P(v.answerer), Q = P(v.asker);
    const head = `<div class="uc-head">
        <span class="pill big">🔢 Jeu de la Note</span>
        ${v.stage !== 'over' ? `<span class="pill">Manche ${v.round} / ${v.total}</span>` : ''}
        ${host && v.stage !== 'over' ? '<button class="btn btn-ghost btn-sm" id="nt-skip">⏭ Passer</button>' : ''}
        ${host ? '<button class="btn btn-ghost btn-sm" id="nt-stop">🏠 Salon</button>' : ''}
      </div>
      ${v.stage !== 'over' ? `<div class="nt-roles"><div class="${v.role === 'answerer' ? 'me' : ''}">${avatarHTML(A, 38)}<span><small>🎯 Répondeur (a la note)</small>${nameHTML(A)}</span></div>
        <div class="${v.role === 'asker' ? 'me' : ''}">${avatarHTML(Q, 38)}<span><small>🎤 Choisit les thèmes</small>${nameHTML(Q)}</span></div></div>` : ''}`;
    const tm = ['pick', 'answer', 'guess', 'reveal'].includes(v.stage) ? '<div class="uc-timer" id="nt-timer"><i></i><span></span></div>' : '';
    let body = '';

    if (v.stage === 'pick') {
      if (v.role === 'asker') {
        body = `<h2 class="uc-title">🎤 Choisis 3 thèmes pour ${esc(A.name)}</h2>
          <p class="muted center-txt">Il devra répondre à chacun avec quelque chose qui vaut sa note secrète.</p>
          <div class="nt-grid">${v.offered.map(t => `<button class="nt-pick ${picked.includes(t.id) ? 'sel' : ''}" data-id="${t.id}">${themeCard(t)}${picked.includes(t.id) ? `<em class="num">${picked.indexOf(t.id) + 1}</em>` : ''}</button>`).join('')}</div>
          <div class="nt-actions">
            <button class="btn btn-ghost" id="nt-reroll" ${v.rerolls > 0 ? '' : 'disabled'}>🎲 Autres thèmes (${v.rerolls})</button>
            <button class="btn btn-primary btn-xl" id="nt-send" ${picked.length === 3 ? '' : 'disabled'}>📨 Envoyer ${picked.length}/3 thèmes</button>
          </div>`;
      } else if (v.role === 'answerer') {
        body = `<div class="nt-secret"><small>🤫 Ta note secrète</small>${noteBadge(v.note, true)}<p>${esc(Q.name)} est en train de choisir tes 3 thèmes…</p></div>`;
      } else body = `<div class="uc-wait big">🎤 ${esc(Q.name)} choisit 3 thèmes pour ${esc(A.name)}…</div>`;
    }

    if (v.stage === 'answer') {
      if (v.role === 'answerer') {
        body = `<div class="nt-secret small"><small>Ta note</small>${noteBadge(v.note)}<p>Réponds avec des choses qui valent <b>${v.note}/10</b> sur chaque échelle.</p></div>
          <form id="nt-form" class="nt-answers">${v.themes.map((t, i) => themeCard(t, `<input class="input nt-in" data-i="${i}" maxlength="80" autocomplete="off" placeholder="Ta réponse pour « ${esc(t.name)} »…">`)).join('')}
          <button class="btn btn-primary btn-xl">✅ Envoyer mes réponses</button></form>`;
      } else body = `<div class="uc-wait">✍️ ${esc(A.name)} réfléchit à ses réponses…</div>
          <div class="nt-themes">${v.themes.map(t => themeCard(t, '<div class="nt-ans pending">…</div>')).join('')}</div>`;
    }

    if (v.stage === 'guess') {
      const answersBlock = `<div class="nt-themes">${v.themes.map((t, i) => themeCard(t, `<div class="nt-ans">💬 ${esc(v.answers[i])}</div>`)).join('')}</div>`;
      if (v.role === 'answerer') body = `<h2 class="uc-title">🧐 Les autres devinent ta note…</h2>${answersBlock}
          <p class="muted center-txt">${v.guessed.length} / ${v.guessers.length} ont répondu · ta note : <b>${v.note}/10</b></p>`;
      else body = `<h2 class="uc-title">Quelle est la note de ${esc(A.name)} ?</h2>${answersBlock}
          <div class="nt-pad">${Array.from({ length: 10 }, (_, i) => `<button class="nt-num ${v.myGuess === i + 1 ? 'sel' : ''}" data-n="${i + 1}" style="--h:${hue(i + 1)}">${i + 1}</button>`).join('')}</div>
          <p class="muted center-txt">${v.myGuess ? `Tu as choisi ${v.myGuess} — tu peux encore changer.` : 'Clique sur une note.'} · ${v.guessed.length} / ${v.guessers.length} ont répondu</p>`;
    }

    if (v.stage === 'reveal') {
      const R = v.result || { rows: [] };
      body = `<div class="nt-revealbox"><small>La note de ${nameHTML(A)} était…</small>${noteBadge(v.note, true)}</div>
        ${gauge(v.note, R.rows)}
        <div class="nt-themes compact">${v.themes.map((t, i) => themeCard(t, `<div class="nt-ans">💬 ${esc(v.answers[i])}</div>`)).join('')}</div>
        <ul class="rv-results">${R.rows.map(r => { const p = P(r.pid); return `<li class="${r.pts ? 'win' : ''}">${avatarHTML(p, 26)} ${nameHTML(p)} a dit ${r.guess} ${r.pts ? `<b>+${r.pts}</b>` : '😬'}</li>`; }).join('')}
          <li class="${R.answererPts ? 'win' : ''}">${avatarHTML(A, 26)} ${nameHTML(A)} (répondeur) <b>+${R.answererPts}</b></li></ul>`;
      if (key !== lastKey) sfx('legend');
    }

    if (v.stage === 'over') {
      const rk = v.ranking || [];
      body = `<h2 class="end-title">🏆 Classement du Jeu de la Note</h2>
        <div class="podium">${[rk[1], rk[0], rk[2]].map((r, i) => r ? `<div class="step p${[2, 1, 3][i]}">${avatarHTML(P(r.pid), 70)}<span class="nm">${nameHTML(P(r.pid))}</span><span class="pts">${r.score} pts</span><div class="block">${[2, 1, 3][i]}</div></div>` : '').join('')}</div>
        <ol class="final-list">${rk.slice(3).map((r, i) => `<li value="${i + 4}">${avatarHTML(P(r.pid), 28)} ${nameHTML(P(r.pid))} — ${r.score} pts</li>`).join('')}</ol>
        ${v.coins ? `<div class="earned"><span class="coin-spin">🪙</span> +${v.coins.coins} pièces · Total : <b>${save.coins} 🪙</b></div>` : ''}
        <div class="end-actions">${host ? '<button class="btn btn-primary" id="nt-replay">🔁 Rejouer</button><button class="btn btn-yellow" id="nt-lobby">🏠 Retour au salon</button>' : '<p class="muted">L\'hôte peut relancer une partie.</p>'}
        <button class="btn btn-shop open-shop2">🛍️ Boutique</button></div>`;
      if (key !== lastKey) { if (rk[0]?.pid) celebrateWinner(rk[0].pid); else sfx('legend'); }
    }

    // garde ce qui est en cours de saisie
    const drafts = $$('#v-note .nt-in').map(i => i.value);
    const focused = document.activeElement?.dataset?.i;
    root.innerHTML = head + tm + `<div class="uc-body nt st-${v.stage}">${body}</div>`;
    $$('#v-note .nt-in').forEach((inp, i) => { if (drafts[i]) inp.value = drafts[i]; });
    if (focused !== undefined) $(`#v-note .nt-in[data-i="${focused}"]`)?.focus();
    else if (v.stage === 'answer' && key !== lastKey) $('#v-note .nt-in')?.focus();
    const totals = { pick: 45000, answer: (state.gs?.note?.answerTime || 120) * 1000, guess: 60000, reveal: 9000 };
    if (tm) timer(v.left, totals[v.stage]);
    if (key !== lastKey && ((v.stage === 'pick' && v.role === 'asker') || (v.stage === 'answer' && v.role === 'answerer'))) sfx('pop');
    lastKey = key;

    // actions
    $$('#v-note .nt-pick').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      picked = picked.includes(id) ? picked.filter(x => x !== id) : picked.length < 3 ? [...picked, id] : picked;
      render(v);
    }));
    $('#nt-reroll')?.addEventListener('click', () => { picked = []; gAct('reroll'); });
    $('#nt-send')?.addEventListener('click', () => gAct('pick', picked));
    $$('#v-note .nt-in').forEach(inp => inp.addEventListener('input', () => {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => gAct('draft', $$('#v-note .nt-in').map(i => i.value)), 600);
    }));
    $('#nt-form')?.addEventListener('submit', (e) => { e.preventDefault(); gAct('answer', $$('#v-note .nt-in').map(i => i.value)); });
    $$('#v-note .nt-num').forEach(b => b.addEventListener('click', () => gAct('guess', +b.dataset.n)));
    $('#nt-skip')?.addEventListener('click', () => gAct('skip'));
    $('#nt-replay')?.addEventListener('click', () => gAct('replay'));
    $('#nt-stop')?.addEventListener('click', () => socket.emit('stop'));
    $('#nt-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $$('#v-note .open-shop2').forEach(b => b.addEventListener('click', openShop));
  }

  window.NOTE = { render };
})();
