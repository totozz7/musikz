// PLAYZUP — client « Photo Espion » : dossier d'agent secret, polaroid, interrogatoire, vote et révélation.
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const nm = (id) => esc(P(id)?.name || '?');
  let V = null, key = null, ik = null, tgt = null, cardK = null, ovK = null, endK = null, timerIv = null, lastQa = 0;

  function build() {
    $('#v-spy').innerHTML = `
      <div class="sp-room">
        <div class="sp-head"><div class="sp-logo"><span class="sp-cam">📸</span><b>PHOTO</b><em>ESPION</em></div><div class="sp-chips"><span id="sp-round"></span><span id="sp-theme"></span></div></div>
        <div class="sp-timer" id="sp-timer"><i></i><span></span></div>
        <div class="sp-main">
          <div class="sp-left"><div class="sp-cardwrap" id="sp-card"></div><div id="sp-spybtn"></div></div>
          <div class="sp-right">
            <div class="sp-sus" id="sp-sus"></div>
            <div class="sp-status" id="sp-status"></div>
            <div class="sp-feed" id="sp-feed"></div>
            <div class="sp-input" id="sp-input"></div>
          </div>
        </div>
        <div class="sp-ov hidden" id="sp-ov"></div>
        <div class="sp-tools" id="sp-tools"></div>
        <div id="sp-end"></div>
      </div>`;
  }
  function render(v) {
    if (v.gameKey !== key) { key = v.gameKey; build(); ik = cardK = ovK = endK = null; tgt = null; lastQa = 0; }
    V = v;
    $('#sp-round').textContent = v.stage === 'over' ? 'Fin de partie' : `Manche ${v.round} / ${v.rounds}`;
    $('#sp-theme').innerHTML = v.theme ? `${v.theme.emoji} ${esc(v.theme.name)}` : (v.spy ? '❓ Thème secret' : '');
    card(v); suspects(v); status(v); feed(v); input(v); overlay(v); timer(v); tools(v);
    if (v.stage === 'over') end(v); else $('#sp-end').innerHTML = '';
  }
  // ── la carte : polaroid ou dossier « TOP SECRET » ──
  function card(v) {
    const k = v.round + ':' + (v.card ? 1 : 0) + ':' + v.spy + ':' + (v.stage === 'loading');
    if (k === cardK) return; cardK = k;
    const el = $('#sp-card');
    if (v.stage === 'loading') { el.innerHTML = `<div class="sp-loading"><div class="sp-reel"></div><p>Développement des photos…</p></div>`; return; }
    if (v.card && !(v.spy && !['reveal', 'over'].includes(v.stage))) {
      el.innerHTML = `<div class="sp-flip"><div class="sp-back"><span>🕵️</span><b>CONFIDENTIEL</b></div><div class="sp-polaroid"><div class="sp-tape"></div><div class="sp-img"><img src="${esc(v.card.img)}" alt="" referrerpolicy="no-referrer"></div><p>${esc(v.card.show)}</p></div></div>
        <p class="sp-role ok">✅ Tu as vu la photo. Ne la décris pas trop… l'espion écoute !</p>`;
    } else {
      el.innerHTML = `<div class="sp-flip"><div class="sp-back"><span>🕵️</span><b>CONFIDENTIEL</b></div><div class="sp-dossier"><div class="sp-stamp">TOP SECRET</div><div class="sp-agent">🕵️</div>
        <h3>Tu es l'ESPION</h3><p>Tu n'as <b>pas</b> la photo !</p><div class="sp-redact"><i></i><i></i><i style="width:60%"></i></div>
        ${v.theme ? `<p class="sp-hint">Indice : thème <b>${v.theme.emoji} ${esc(v.theme.name)}</b></p>` : '<p class="sp-hint">Aucun indice… bonne chance.</p>'}
        ${v.nspies > 1 ? '<p class="sp-hint">⚠️ Vous êtes 2 espions !</p>' : ''}</div></div>
        <p class="sp-role spy">🎭 Écoute les questions, devine la photo… et fonds-toi dans la masse !</p>`;
    }
    requestAnimationFrame(() => setTimeout(() => el.querySelector('.sp-flip')?.classList.add('on'), 60));
    if (v.stage === 'deal') sfx(v.spy ? 'buzzer' : 'stamp', .5);
  }
  // ── la galerie des suspects ──
  function suspects(v) {
    const vote = v.stage === 'vote', ask = v.stage === 'ask' && v.asker === pid;
    const open = ['reveal', 'over'].includes(v.stage);
    $('#sp-sus').innerHTML = v.players.map((p, i) => {
      const pl = P(p); if (!pl) return '';
      const role = p === v.asker && ['ask', 'answer'].includes(v.stage) ? '<em class="mic">🎤</em>' : p === v.target && v.stage === 'answer' ? '<em class="q">❓</em>' : '';
      const nv = open ? (v.tally?.[p] || 0) : 0;
      const sp = open && v.spies?.includes(p);
      const can = (vote && p !== pid) || (ask && p !== pid);
      const sel = (vote && v.voted === p) || (ask && tgt === p);
      return `<button class="sp-s ${sel ? 'sel' : ''} ${can ? 'can' : ''} ${sp ? 'spy' : ''} ${p === pid ? 'me' : ''}" data-p="${p}" ${can ? '' : 'disabled'} style="--i:${i}">
        <span class="sp-av">${avatarHTML(pl, 46)}${role}${sp ? '<b class="sp-spytag">ESPION</b>' : ''}</span><small>${esc(pl.name)}</small><i class="sp-sc">${v.scores[p] || 0} pts</i>${nv ? `<i class="sp-nv">🗳️ ${nv}</i>` : ''}</button>`;
    }).join('');
    $$('#sp-sus .sp-s.can').forEach(b => b.onclick = () => {
      if (V.stage === 'vote') { gAct('vote', { pid: b.dataset.p }); sfx('stamp', .5); }
      else { tgt = b.dataset.p; sfx('pop', .4); suspects(V); input(V, true); }
    });
  }
  function status(v) {
    const s = $('#sp-status');
    const n = v.qa.length, q = v.quota;
    const txt = {
      loading: '🎞️ On prépare les photos…',
      deal: v.spy ? '🕵️ Tu es l\'espion ! Les autres découvrent leur photo…' : '👀 Mémorise bien la photo !',
      ask: v.asker === pid ? `🎤 À toi ! Choisis un suspect et pose-lui une question <small>(${n + 1}/${q})</small>` : `🎤 <b>${nm(v.asker)}</b> écrit une question… <small>(${n + 1}/${q})</small>`,
      answer: v.target === pid ? `❓ <b>${nm(v.asker)}</b> te pose une question : réponds !` : `✍️ <b>${nm(v.target)}</b> répond à <b>${nm(v.asker)}</b>…`,
      vote: v.voted ? `🗳️ Vote enregistré (${v.nvotes}/${v.players.length})… tu peux changer d'avis` : '🗳️ Qui est l\'espion ? Clique sur un suspect pour voter !',
      guess: v.guesser === pid ? '🎯 Retrouve la photo parmi les propositions !' : `🎯 <b>${nm(v.guesser)}</b> ${v.early ? 'tente sa chance' : 'est démasqué… mais tente de retrouver la photo'} !`,
      reveal: '', over: '',
    }[v.stage] || '';
    s.innerHTML = txt; s.className = 'sp-status st-' + v.stage + (['ask', 'answer'].includes(v.stage) && (v.asker === pid && v.stage === 'ask' || v.target === pid && v.stage === 'answer') ? ' mine' : '');
  }
  // ── l'interrogatoire ──
  function feed(v) {
    const f = $('#sp-feed');
    if (!v.qa.length) { f.innerHTML = `<div class="sp-empty">🗂️ Le dossier est vide… Les questions apparaîtront ici.</div>`; lastQa = 0; return; }
    f.innerHTML = v.qa.map((x, i) => `<div class="sp-qa ${i >= lastQa ? 'new' : ''}">
      <div class="sp-q">${P(x.from) ? avatarHTML(P(x.from), 26) : ''}<div><small>${nm(x.from)}${x.to ? ' → ' + nm(x.to) : ''}</small><p>${esc(x.q)}</p></div></div>
      ${x.to ? `<div class="sp-a ${x.a === null ? 'wait' : ''}"><div><small>${nm(x.to)}</small><p>${x.a === null ? '<span class="sp-dots"><i></i><i></i><i></i></span>' : esc(x.a)}</p></div>${P(x.to) ? avatarHTML(P(x.to), 26) : ''}</div>` : ''}</div>`).join('');
    if (v.qa.length !== lastQa || v.qa[v.qa.length - 1]?.a) f.scrollTop = f.scrollHeight;
    if (v.qa.length > lastQa && lastQa) sfx('pop', .35);
    lastQa = v.qa.length;
  }
  function input(v, force) {
    const el = $('#sp-input');
    const mineAsk = v.stage === 'ask' && v.asker === pid, mineAns = v.stage === 'answer' && v.target === pid;
    const k = v.stage + ':' + v.qa.length + ':' + mineAsk + ':' + mineAns + ':' + (mineAsk ? tgt : '');
    if (k === ik && !force) return;
    const keep = el.querySelector('textarea')?.value || '';
    ik = k;
    if (mineAsk) {
      if (tgt && (tgt === pid || !v.players.includes(tgt))) tgt = null;
      el.innerHTML = `<div class="sp-box ask"><div class="sp-to">${tgt ? `Question pour <b>${nm(tgt)}</b>` : '👆 Clique d\'abord sur un suspect'}</div>
        <div class="sp-row"><textarea id="sp-txt" maxlength="160" rows="2" placeholder="Ex. : « Tu y vas souvent ? », « C'est plutôt grand ? »…">${esc(keep)}</textarea><button class="btn btn-primary" id="sp-send">Envoyer ➤</button></div>
        <div class="sp-ideas">${['Ça se mange ?', 'Tu en as déjà vu en vrai ?', 'C\'est plus grand que toi ?', 'On y va en vacances ?', 'Ça fait du bruit ?', 'C\'est cher ?'].map(x => `<button>${x}</button>`).join('')}</div></div>`;
      $$('#sp-input .sp-ideas button').forEach(b => b.onclick = () => { $('#sp-txt').value = b.textContent; $('#sp-txt').focus(); });
      const send = async () => { if (!tgt) return toast('Choisis d\'abord un suspect 👆', 'error'); const q = $('#sp-txt').value.trim(); if (!q) return; const r = await gAct('ask', { to: tgt, q }); if (!r?.error) { tgt = null; sfx('whoosh', .4); } };
      $('#sp-send').onclick = send;
      $('#sp-txt').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
      setTimeout(() => $('#sp-txt')?.focus(), 80);
    } else if (mineAns) {
      const q = v.qa[v.qa.length - 1];
      el.innerHTML = `<div class="sp-box ans"><div class="sp-to">${nm(q.from)} te demande : <b>« ${esc(q.q)} »</b></div>
        <div class="sp-row"><textarea id="sp-txt" maxlength="160" rows="2" placeholder="Ta réponse… (sois malin !)">${esc(keep)}</textarea><button class="btn btn-primary" id="sp-send">Répondre ➤</button></div></div>`;
      const send = async () => { const a = $('#sp-txt').value.trim(); if (!a) return; const r = await gAct('answer', { a }); if (!r?.error) sfx('whoosh', .4); };
      $('#sp-send').onclick = send;
      $('#sp-txt').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
      setTimeout(() => $('#sp-txt')?.focus(), 80);
      sfx('tick', .8);
    } else el.innerHTML = '';
  }
  // ── devinette de l'espion + révélation ──
  function overlay(v) {
    const ov = $('#sp-ov');
    const k = v.stage + ':' + v.round + ':' + (v.guesser || '');
    if (!['guess', 'reveal'].includes(v.stage)) { ov.classList.add('hidden'); ov.innerHTML = ''; ovK = null; return; }
    if (k === ovK) return; ovK = k;
    ov.classList.remove('hidden');
    if (v.stage === 'guess') {
      if (v.guesser === pid && v.choices) {
        ov.innerHTML = `<div class="sp-ovbox"><h3>🎯 Quelle était la photo ?</h3><p class="muted">Un seul essai…</p><div class="sp-choices">${v.choices.map((c, i) => `<button data-k="${esc(c.key)}" style="--i:${i}"><img src="${esc(c.img)}" alt="" referrerpolicy="no-referrer"><span>${esc(c.show)}</span></button>`).join('')}</div></div>`;
        $$('#sp-ov [data-k]').forEach(b => b.onclick = () => { gAct('pick', { key: b.dataset.k }); b.classList.add('picked'); sfx('stamp'); });
      } else ov.innerHTML = `<div class="sp-ovbox small"><div class="sp-search">🔍</div><h3>${nm(v.guesser)} ${v.early ? 'pense avoir trouvé la photo !' : 'est démasqué !'}</h3><p>Il a une dernière chance : retrouver la photo parmi 8 propositions…</p></div>`;
      sfx('swell', .5);
      return;
    }
    const r = v.result || {}, spies = v.spies || [];
    const iAmSpy = spies.includes(pid), won = iAmSpy ? r.spyWin : !r.spyWin;
    const why = { tie: 'Égalité au vote : personne n\'est accusé.', wrong: `Vous avez accusé ${nm(v.accused)}… qui était innocent !`, caught: r.right ? 'Démasqué… mais il a retrouvé la photo !' : 'Démasqué, et il s\'est trompé de photo !', early: r.right ? 'Il a deviné la photo en pleine partie !' : 'Il a tenté sa chance… raté !' }[r.why] || '';
    const g = v.choices?.find(c => c.key === r.guess);
    ov.innerHTML = `<div class="sp-ovbox rev ${r.spyWin ? 'spywin' : 'civwin'}">
      <div class="sp-big">${r.spyWin ? '🕵️ L\'ESPION GAGNE' : '🎉 ESPION DÉMASQUÉ'}</div>
      <p class="sp-why">${why}</p>
      <div class="sp-revrow"><div class="sp-polaroid small"><div class="sp-tape"></div><div class="sp-img"><img src="${esc(v.card?.img || '')}" alt="" referrerpolicy="no-referrer"></div><p>${esc(v.card?.show || '')}</p></div>
        <div class="sp-who">${spies.map(p => `<div class="sp-wanted"><small>WANTED</small>${P(p) ? avatarHTML(P(p), 70) : ''}<b>${nm(p)}</b><em>ESPION</em></div>`).join('')}${g ? `<p class="sp-guessed">Sa réponse : <b>${esc(g.show)}</b> ${r.right ? '✅' : '❌'}</p>` : ''}</div></div>
      <p class="sp-res ${won ? 'w' : 'l'}">${won ? 'Tu gagnes cette manche ! 🏆' : 'Perdu pour cette manche 😬'}</p></div>`;
    if (won) { burst('party', 12); sfx('legend', .6); } else sfx('buzzer', .5);
  }
  function timer(v) {
    clearInterval(timerIv);
    const el = $('#sp-timer'), on = ['deal', 'ask', 'answer', 'vote', 'guess', 'reveal'].includes(v.stage) && v.left > 0;
    el.classList.toggle('hidden', !on); if (!on) return;
    const end = Date.now() + v.left, tot = Math.max(v.left, 1);
    const t = () => { const l = Math.max(0, end - Date.now()); el.querySelector('i').style.transform = `scaleX(${l / tot})`; el.querySelector('span').textContent = Math.ceil(l / 1000) + ' s'; el.classList.toggle('hot', l < 8000 && ['ask', 'answer', 'vote'].includes(v.stage)); };
    t(); timerIv = setInterval(t, 250);
  }
  function tools(v) {
    $('#sp-spybtn').innerHTML = v.spy && ['ask', 'answer'].includes(v.stage) ? `<button class="btn sp-guessbtn" id="sp-guess">🎯 Je sais ! <small>deviner la photo maintenant</small></button>` : '';
    $('#sp-guess')?.addEventListener('click', () => { if (confirm('Tenter de deviner la photo maintenant ? Un seul essai !')) gAct('spyguess'); });
    $('#sp-tools').innerHTML = isHost() && v.stage !== 'over' ? `<button class="btn btn-ghost btn-sm" id="sp-skip">⏭ ${v.stage === 'reveal' ? 'Manche suivante' : ['ask', 'answer'].includes(v.stage) ? 'Passer au vote' : 'Passer'}</button><button class="btn btn-ghost btn-sm" id="sp-stop">⏹ Terminer</button>` : '';
    $('#sp-skip')?.addEventListener('click', () => gAct('skip'));
    $('#sp-stop')?.addEventListener('click', () => { if (confirm('Terminer la partie ?')) gAct('end'); });
  }
  function end(v) {
    if (endK === v.gameKey) return; endK = v.gameKey;
    $('#sp-end').innerHTML = `<div class="pz-end"><h2>📸 ${v.ranking?.[0]?.pid === pid ? 'Meilleur agent secret !' : 'Fin de l\'enquête'}</h2>${podium((v.ranking || []).map(r => ({ pid: r.pid, pts: r.pts })))}
      ${v.history?.length ? `<div class="sp-hist">${v.history.map(h => `<span>${h.spyWin ? '🕵️' : '🎉'} <b>${esc(h.item)}</b> · ${h.spies.map(nm).join(' & ')}</span>`).join('')}</div>` : ''}
      ${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('sp')}</div>`;
    endWire('sp', v.ranking || []);
  }
  window.SPY = { render };
})();
