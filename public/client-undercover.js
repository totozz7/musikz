// PLAYZUP — client Undercover (utilise les fonctions de app.js : $, esc, avatarHTML, nameHTML, state, pid, gAct…)
(function () {
  const P = (id) => state?.players.find(p => p.id === id) || { name: '?', avatar: '❔', color: '#999' };
  const ROLE = {
    civil: { label: 'CIVIL', emoji: '😇', cls: 'r-civil' },
    undercover: { label: 'UNDERCOVER', emoji: '🕵️', cls: 'r-uc' },
    white: { label: 'MR. WHITE', emoji: '👻', cls: 'r-white' },
  };
  let flipped = false, lastStage = '', lastRound = 0, timerIv = null, wordHidden = false, lastClues = 0;

  function timer(left, total) {
    clearInterval(timerIv);
    const end = Date.now() + left;
    const tick = () => {
      const el = $('#uc-timer'); if (!el) return clearInterval(timerIv);
      const l = Math.max(0, end - Date.now());
      el.querySelector('i').style.transform = `scaleX(${Math.min(1, l / total)})`;
      el.querySelector('span').textContent = Math.ceil(l / 1000) + ' s';
      el.classList.toggle('hurry', l < 8000);
      if (!l) clearInterval(timerIv);
    };
    tick(); timerIv = setInterval(tick, 200);
  }

  const chip = (o, v) => {
    const p = P(o.pid), cur = v.current === o.pid;
    return `<div class="uc-chip ${o.alive ? '' : 'dead'} ${cur ? 'cur' : ''}">${avatarHTML(p, 40)}<span>${nameHTML(p)}</span>
      ${!o.alive && o.role ? `<em class="stamp ${ROLE[o.role].cls}">${ROLE[o.role].emoji}</em>` : ''}${cur ? '<b class="talk">💬</b>' : ''}</div>`;
  };

  function board(v) {
    if (!v.clues.length) return '<p class="muted center-txt">Les indices apparaîtront ici…</p>';
    const groups = {};
    for (const c of v.clues) (groups[c.round] ||= []).push(c);
    return Object.entries(groups).map(([r, list]) => `
      <div class="uc-round"><div class="uc-round-t">Manche ${r}</div>
      ${list.map(c => { const p = P(c.pid); return `<div class="uc-clue ${c.skipped ? 'skip' : ''}">${avatarHTML(p, 30)}<span class="who">${nameHTML(p)}</span><span class="txt">${esc(c.text)}</span></div>`; }).join('')}
      </div>`).join('');
  }

  function myWordPill(v) {
    if (!v.inGame) return '<div class="uc-myword spect">👀 Tu regardes la partie</div>';
    const txt = v.isWhite ? '👻 Mr. White (pas de mot)' : esc(v.myWord);
    return `<button class="uc-myword ${wordHidden ? 'hidden-word' : ''}" id="uc-wordpill" title="Cacher / afficher">🔑 Ton mot : <b>${wordHidden ? '••••••' : txt}</b></button>`;
  }

  function render(v) {
    const root = $('#v-uc');
    if (v.stage !== lastStage || v.round !== lastRound) { if (v.stage === 'cards') flipped = false; }
    const host = isHost();
    const alive = v.order.filter(o => o.alive);
    const meAlive = alive.some(o => o.pid === pid);
    const head = `
      <div class="uc-head">
        <span class="pill big">🕵️ Undercover</span><span class="pill">${esc(v.themeName)}</span>
        ${v.stage !== 'cards' && v.stage !== 'over' ? `<span class="pill">Manche ${v.round}</span>` : ''}
        <span class="uc-roles">${v.counts.civil} 😇 · ${v.counts.undercover} 🕵️${v.counts.white ? ' · 1 👻' : ''}</span>
        ${host && v.stage !== 'over' ? '<button class="btn btn-ghost btn-sm" id="uc-skip">⏭ Passer</button>' : ''}
        ${host ? '<button class="btn btn-ghost btn-sm" id="uc-stop">🏠 Salon</button>' : ''}
      </div>`;
    const tm = ['cards', 'clues', 'vote', 'white', 'result'].includes(v.stage) ? '<div class="uc-timer" id="uc-timer"><i></i><span></span></div>' : '';
    let body = '';

    if (v.stage === 'cards') {
      const readyN = v.ready.length, total = v.order.length;
      body = v.inGame ? `
        <p class="uc-hint">🤫 Ne montre ton écran à personne !</p>
        <div class="flip ${flipped ? 'on' : ''}" id="uc-card">
          <div class="flip-in">
            <div class="flip-front"><span class="big-em">🕵️</span><b>Touche pour voir ton mot</b><small>Mémorise-le bien</small></div>
            <div class="flip-back ${v.isWhite ? 'white' : ''}">
              ${v.isWhite ? '<span class="big-em">👻</span><b>Tu es MR. WHITE</b><small>Tu n\'as aucun mot. Écoute les indices des autres et bluffe !</small>'
                : `<small>Ton mot secret</small><b class="word">${esc(v.myWord)}</b><small>Es-tu civil… ou undercover ? 😏</small>`}
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-xl uc-ready" id="uc-ready" ${v.ready.includes(pid) ? 'disabled' : ''}>${v.ready.includes(pid) ? '✅ Prêt ! On attend les autres…' : "✅ C'est bon, j'ai mémorisé"}</button>
        <p class="muted center-txt">${readyN} / ${total} prêts</p>`
        : '<div class="uc-wait big">👀 Les cartes sont distribuées…</div>';
    }

    if (v.stage === 'clues') {
      const mine = v.current === pid, cur = P(v.current), oral = v.mode === 'oral';
      body = `${myWordPill(v)}
        <div class="uc-order">${v.order.map(o => chip(o, v)).join('')}</div>
        <div class="uc-turn ${mine ? 'me' : ''}">
          ${mine ? (oral ? `<b>🎙️ C'est à toi ! Donne ton indice à voix haute</b><button class="btn btn-primary" id="uc-done">✅ J'ai parlé</button>`
            : `<b>✍️ C'est à toi ! Un seul mot ou une courte expression</b>
              <form id="uc-form" class="guess-row"><input id="uc-input" class="input big" maxlength="40" autocomplete="off" placeholder="Ton indice…"><button class="btn btn-primary">Envoyer</button></form>`)
            : `${avatarHTML(cur, 44)}<b>${nameHTML(cur)} ${oral ? 'parle…' : 'réfléchit à son indice…'}</b>`}
          ${v.clueRounds > 1 ? `<small class="muted">Tour d'indices ${v.tour} / ${v.clueRounds}</small>` : ''}
        </div>
        <div class="uc-board">${board(v)}</div>`;
    }

    if (v.stage === 'vote') {
      const voted = new Set(v.voted);
      body = `${myWordPill(v)}
        <h2 class="uc-title">🗳️ Qui est l'imposteur ?</h2>
        <p class="muted center-txt">${meAlive ? (v.myVote ? 'Tu peux encore changer ton vote.' : 'Clique sur le joueur que tu suspectes.') : '☠️ Tu es éliminé : tu regardes le vote.'} · ${voted.size} / ${alive.length} votes</p>
        <div class="uc-vote">${alive.map(o => {
          const p = P(o.pid), me = o.pid === pid;
          return `<button class="uc-vcard ${v.myVote === o.pid ? 'sel' : ''} ${me ? 'self' : ''}" data-t="${o.pid}" ${me || !meAlive ? 'disabled' : ''}>
            ${avatarHTML(p, 64)}<span>${nameHTML(p)}</span>${voted.has(o.pid) ? '<small>✔ a voté</small>' : '<small>⏳</small>'}${v.myVote === o.pid ? '<em class="target">🎯</em>' : ''}</button>`;
        }).join('')}</div>
        <details class="uc-recap" open><summary>📝 Rappel des indices</summary><div class="uc-board">${board(v)}</div></details>`;
    }

    if (v.stage === 'result' || v.stage === 'white') {
      const L = v.last || {};
      const tally = v.tally ? Object.entries(v.tally).sort((a, b) => b[1] - a[1]) : [];
      const max = Math.max(1, ...tally.map(t => t[1]));
      const bars = tally.length ? `<div class="uc-tally">${tally.map(([t, n]) => { const p = P(t); return `<div class="row">${avatarHTML(p, 28)}<span>${esc(p.name)}</span><div class="bar"><i style="width:${100 * n / max}%"></i></div><b>${n}</b></div>`; }).join('')}</div>` : '';
      if (L.tie) body = `<div class="uc-reveal tie"><span class="big-em">⚖️</span><h2>Égalité !</h2><p>Personne n'est éliminé cette fois.</p></div>${bars}`;
      else {
        const p = P(L.pid), R = ROLE[L.role] || ROLE.civil;
        body = `<div class="uc-reveal">
          ${avatarHTML(p, 96)}<h2>${nameHTML(p)} est éliminé${L.votes ? ` <small>(${L.votes} vote${L.votes > 1 ? 's' : ''})</small>` : ''}</h2>
          <div class="stamp-big ${R.cls}">${R.emoji} ${R.label}</div></div>${bars}`;
        if (v.stage === 'white') {
          body += L.pid === pid
            ? `<div class="uc-turn me"><b>👻 Dernière chance ! Devine le mot des civils pour gagner</b>
                <form id="uc-wform" class="guess-row"><input id="uc-winput" class="input big" maxlength="40" autocomplete="off" placeholder="Le mot des civils…"><button class="btn btn-primary">Deviner</button></form></div>`
            : `<div class="uc-wait">👻 Mr. White tente de deviner le mot des civils…</div>`;
        } else if (v.whiteGuess && L.role === 'white') {
          body += `<div class="uc-wait">👻 Il a proposé « ${esc(v.whiteGuess.text)} »… ${v.whiteGuess.ok ? '✅ BINGO !' : '❌ raté !'}</div>`;
        }
      }
      if (v.stage === 'result') body += '<p class="muted center-txt">La partie continue…</p>';
    }

    if (v.stage === 'over') {
      const W = { civil: ['😇', 'Les CIVILS gagnent !', 'r-civil'], undercover: ['🕵️', 'Les UNDERCOVERS gagnent !', 'r-uc'], white: ['👻', 'MR. WHITE gagne !', 'r-white'] }[v.winner];
      const myRole = v.order.find(o => o.pid === pid)?.role;
      body = `<div class="uc-win ${W[2]}"><span class="big-em">${W[0]}</span><h2>${W[1]}</h2>
          <p>Mot des civils : <b>${esc(v.words.civil)}</b> · Mot de l'undercover : <b>${esc(v.words.undercover)}</b></p>
          ${myRole ? `<p class="${v.coins?.win ? 'won' : 'lost'}">${v.coins?.win ? '🎉 Tu as gagné !' : '😢 Perdu…'} · +${v.coins?.coins || 0} 🪙</p>` : ''}</div>
        <div class="uc-final">${v.order.map(o => { const p = P(o.pid), R = ROLE[o.role]; return `<div class="uc-fcard ${R.cls} ${o.alive ? '' : 'dead'}">${avatarHTML(p, 52)}<span>${nameHTML(p)}</span><em>${R.emoji} ${R.label}</em></div>`; }).join('')}</div>
        <details class="uc-recap"><summary>📝 Tous les indices</summary><div class="uc-board">${board(v)}</div></details>
        <div class="end-actions">${host ? '<button class="btn btn-primary" id="uc-replay">🔁 Rejouer (nouveaux mots)</button><button class="btn btn-yellow" id="uc-lobby">🏠 Retour au salon</button>' : '<p class="muted">L\'hôte peut relancer une partie.</p>'}
        <button class="btn btn-shop open-shop2">🛍️ Boutique</button></div>`;
      if (lastStage !== 'over') { sfx('legend'); if (v.coins?.win) burst(save.look.winFx, 30); }
    }

    // on garde le texte en cours de saisie si l'écran se redessine
    const draft = $('#uc-input')?.value || '', wdraft = $('#uc-winput')?.value || '';
    root.innerHTML = head + tm + `<div class="uc-body st-${v.stage}">${body}</div>`;
    if ($('#uc-input')) { $('#uc-input').value = draft; $('#uc-input').focus(); }
    if ($('#uc-winput')) { $('#uc-winput').value = wdraft; $('#uc-winput').focus(); }
    const totals = { cards: 30000, clues: (state.gs?.undercover?.clueTime || 40) * 1000, vote: 75000, white: 35000, result: 7000 };
    if (tm) timer(v.left, totals[v.stage] || v.left);

    // sons
    if (v.stage === 'clues' && v.current === pid && (lastStage !== 'clues' || v.clues.length !== lastClues)) sfx('pop');
    if (v.stage === 'result' && lastStage !== 'result' && v.last && !v.last.tie) sfx(v.last.role === 'civil' ? 'wrong' : 'legend');
    lastStage = v.stage; lastRound = v.round; lastClues = v.clues.length;

    // actions
    $('#uc-card')?.addEventListener('click', () => { flipped = !flipped; $('#uc-card').classList.toggle('on', flipped); });
    $('#uc-ready')?.addEventListener('click', () => { flipped = false; gAct('ready'); });
    $('#uc-form')?.addEventListener('submit', (e) => { e.preventDefault(); const t = $('#uc-input').value.trim(); if (t) gAct('clue', t).then(r => { if (!r?.error) $('#uc-input') && ($('#uc-input').value = ''); }); });
    $('#uc-done')?.addEventListener('click', () => gAct('clue', 'oral'));
    $('#uc-wform')?.addEventListener('submit', (e) => { e.preventDefault(); const t = $('#uc-winput').value.trim(); if (t) gAct('guess', t); });
    $$('#v-uc .uc-vcard').forEach(b => b.addEventListener('click', () => gAct('vote', b.dataset.t)));
    $('#uc-wordpill')?.addEventListener('click', () => { wordHidden = !wordHidden; render(v); });
    $('#uc-skip')?.addEventListener('click', () => gAct('skip'));
    $('#uc-replay')?.addEventListener('click', () => gAct('replay'));
    $('#uc-stop')?.addEventListener('click', () => socket.emit('stop'));
    $('#uc-lobby')?.addEventListener('click', () => socket.emit('stop'));
    $$('#v-uc .open-shop2').forEach(b => b.addEventListener('click', openShop));
  }

  window.UC = { render };
})();
