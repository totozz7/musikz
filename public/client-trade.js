// PLAYZUP — 🔄 Échanges entre joueurs : objets de la boutique, cartes à collectionner et pièces.
(function () {
  const KL = { icons: '😀 Icônes', colors: '🎨 Couleurs', frames: '🖼️ Cadres', nameFx: '✨ Effets de pseudo', titles: '🏷️ Titres', winFx: '🎉 Effets de victoire', pawns: '🐎 Pions', boards: '🎲 Plateaux', pcfx: '💥 Animations', cardbacks: '🃏 Dos de cartes', chessb: '♟️ Plateaux d\'échecs', chesspc: '♞ Pièces d\'échecs' };
  const P = (id) => state?.players.find(p => p.id === id);
  const byN = Object.fromEntries((window.CARDS?.list || []).map(c => [c.n, c]));
  const item = (k, id) => SHOP[k]?.find(x => x.id === id);
  const rar = (it) => it?.price ? SHOP.rarity(it.price) : 'free';
  const RN = { c: 'Commune', r: 'Rare', e: 'Épique', l: 'Légendaire', d: 'DIVINE' };

  // ce que j'ai à échanger : objets payants possédés, cartes, pièces
  function myInv() {
    const items = save.owned.map(s => s.split(':')).filter(([k, id]) => item(k, id)?.price > 0);
    return { items, cards: { ...(save.cards || {}) }, coins: save.coins };
  }
  function hasPack(p) {
    if ((p.coins || 0) > save.coins) return 'Pas assez de pièces';
    for (const [k, id] of p.items || []) if (!save.owned.includes(k + ':' + id)) return 'Objet plus possédé';
    for (const [n, c] of Object.entries(p.cards || {})) if ((save.cards?.[n] || 0) < c) return 'Carte plus possédée';
    return null;
  }
  function applyPack(remove, add) {
    save.coins = Math.max(0, save.coins - (remove.coins || 0) + (add.coins || 0));
    for (const [k, id] of remove.items || []) {
      save.owned = save.owned.filter(s => s !== k + ':' + id);
      const lk = LOOK_KEY[k]; if (save.look[lk] === id) save.look[lk] = SHOP[k].find(x => !x.price)?.id || SHOP[k][0].id;
    }
    for (const [k, id] of add.items || []) if (!save.owned.includes(k + ':' + id)) save.owned.push(k + ':' + id);
    save.cards = save.cards || {};
    for (const [n, c] of Object.entries(remove.cards || {})) { save.cards[n] = Math.max(0, (save.cards[n] || 0) - c); if (!save.cards[n]) delete save.cards[n]; }
    for (const [n, c] of Object.entries(add.cards || {})) save.cards[n] = (save.cards[n] || 0) + c;
    persist(); renderProfile(); pushLook(); applyCardback?.(); window.CHESS?.refresh?.();
  }
  const packHTML = (p, empty = 'Rien') => {
    const parts = [
      ...(p.items || []).map(([k, id]) => { const it = item(k, id); return it ? `<div class="tr-chip r-${rar(it)}">${itemPreview(k, it, me())}<small>${esc(it.name || k)}</small></div>` : ''; }),
      ...Object.entries(p.cards || {}).map(([n, c]) => byN[n] ? `<div class="tr-card">${TCG.cardHTML(byN[n], { force: true })}${c > 1 ? `<b>×${c}</b>` : ''}</div>` : ''),
      ...(p.coins ? [`<div class="tr-coins">🪙 <b>${p.coins}</b></div>`] : []),
    ].join('');
    return parts || `<p class="muted">${empty}</p>`;
  };

  // ───────── fenêtre de proposition ─────────
  let sel = null;
  function modal() {
    let el = $('#trade');
    if (!el) {
      el = document.createElement('div'); el.id = 'trade'; el.className = 'modal hidden';
      document.body.appendChild(el);
      el.onclick = (e) => { if (e.target === el) el.classList.add('hidden'); };
    }
    return el;
  }
  async function open(to) {
    const p = P(to); if (!p) return;
    sel = { to, give: { items: [], cards: {}, coins: 0 }, want: { items: [], cards: {}, coins: 0 }, theirs: null, tab: 'give' };
    const el = modal(); el.classList.remove('hidden');
    draw();
    socket.emit('trade:inv', { to }, (r) => { if (!sel || sel.to !== to) return; sel.theirs = r?.ok ? r.inv : { error: r?.error || 'Pas de réponse' }; draw(); });
  }
  function invHTML(inv, pack, side) {
    if (!inv) return '<p class="muted">⏳ On regarde son inventaire…</p>';
    if (inv.error) return `<p class="muted">😕 ${esc(inv.error)}</p>`;
    const byK = {};
    inv.items.forEach(([k, id]) => (byK[k] = byK[k] || []).push(id));
    const its = Object.entries(byK).map(([k, ids]) => `<h5>${KL[k] || k}</h5><div class="tr-grid">${ids.map(id => { const it = item(k, id); if (!it) return ''; const on = pack.items.some(x => x[0] === k && x[1] === id); return `<button class="tr-pick r-${rar(it)} ${on ? 'on' : ''}" data-side="${side}" data-k="${k}" data-id="${esc(id)}">${itemPreview(k, it, me())}<small>${esc(it.name || '')}</small></button>`; }).join('')}</div>`).join('');
    const cards = Object.entries(inv.cards || {}).filter(([n, c]) => c > 0 && byN[n]).sort((a, b) => 'cretld'.indexOf(byN[b[0]].r) - 'cretld'.indexOf(byN[a[0]].r) || a[0] - b[0]);
    const cardsH = cards.length ? `<h5>🃏 Cartes</h5><div class="tr-grid cards">${cards.map(([n, c]) => { const k = pack.cards[n] || 0; return `<button class="tr-pickc ${k ? 'on' : ''}" data-side="${side}" data-n="${n}">${TCG.cardHTML(byN[n], { force: true })}<span class="tr-cnt">${k ? `${k}/` : ''}${c}</span></button>`; }).join('')}</div>` : '';
    return `<div class="tr-coinsel">🪙 Pièces <input type="number" min="0" max="${inv.coins}" value="${pack.coins || ''}" placeholder="0" data-side="${side}" class="tr-coin"> <small>sur ${inv.coins}</small></div>
      ${its || '<p class="muted">Aucun objet échangeable (les objets gratuits ne s\'échangent pas).</p>'}${cardsH}`;
  }
  function draw() {
    const el = modal(), p = P(sel.to), mine = myInv();
    el.innerHTML = `<div class="modal-box tr-box">
      <div class="modal-head"><h2>🔄 <span class="tr-title">ÉCHANGE</span> avec ${avatarHTML(p, 30)} ${esc(p?.name || '?')}</h2><button class="btn btn-ghost btn-sm" id="tr-x">✕</button></div>
      <div class="tr-sum">
        <div class="tr-side give"><h4>📤 Tu donnes</h4><div class="tr-pack">${packHTML(sel.give)}</div></div>
        <div class="tr-arrows">⇄</div>
        <div class="tr-side want"><h4>📥 Tu reçois</h4><div class="tr-pack">${packHTML(sel.want)}</div></div>
      </div>
      <div class="tr-tabs"><button class="${sel.tab === 'give' ? 'on' : ''}" data-tab="give">🎒 Mon inventaire</button><button class="${sel.tab === 'want' ? 'on' : ''}" data-tab="want">👀 Son inventaire</button></div>
      <div class="tr-inv">${sel.tab === 'give' ? invHTML(mine, sel.give, 'give') : invHTML(sel.theirs, sel.want, 'want')}</div>
      <div class="tr-foot"><small class="muted">Astuce : clique plusieurs fois sur une carte pour en mettre plusieurs exemplaires.</small><button class="btn btn-primary" id="tr-send">📨 Proposer l'échange</button></div>
    </div>`;
    $('#tr-x').onclick = () => el.classList.add('hidden');
    $$('#trade .tr-tabs button').forEach(b => b.onclick = () => { sel.tab = b.dataset.tab; draw(); });
    $$('#trade .tr-pick').forEach(b => b.onclick = () => {
      const pk = sel[b.dataset.side], i = pk.items.findIndex(x => x[0] === b.dataset.k && x[1] === b.dataset.id);
      if (i >= 0) pk.items.splice(i, 1); else pk.items.push([b.dataset.k, b.dataset.id]);
      sfx('click', .5); draw();
    });
    $$('#trade .tr-pickc').forEach(b => {
      const side = b.dataset.side, n = b.dataset.n, inv = side === 'give' ? mine : sel.theirs, max = inv.cards[n] || 0, pk = sel[side];
      b.onclick = () => { const k = (pk.cards[n] || 0) + 1; if (k > max) delete pk.cards[n]; else pk.cards[n] = k; sfx('card', .5); draw(); };
      b.oncontextmenu = (e) => { e.preventDefault(); delete pk.cards[n]; draw(); };
    });
    $$('#trade .tr-coin').forEach(i => i.onchange = () => { const side = i.dataset.side, inv = side === 'give' ? mine : sel.theirs; sel[side].coins = Math.max(0, Math.min(inv.coins, Math.floor(+i.value || 0))); draw(); });
    $('#tr-send').onclick = () => {
      const err = hasPack(sel.give); if (err) return toast(err, 'error');
      if (!sel.give.items.length && !Object.keys(sel.give.cards).length && !sel.give.coins && !sel.want.items.length && !Object.keys(sel.want.cards).length && !sel.want.coins) return toast('Choisis au moins une chose à échanger', 'error');
      socket.emit('trade:offer', { to: sel.to, give: sel.give, want: sel.want }, (r) => {
        if (r?.error) return toast(r.error, 'error');
        pending[r.id] = { to: sel.to };
        el.classList.add('hidden'); toast(`📨 Proposition envoyée à ${P(sel.to)?.name || ''} !`); sfx('pop');
      });
    };
  }
  const pending = {};

  // ───────── réception ─────────
  socket.on('trade:invq', (_, ack) => ack(myInv()));
  socket.on('trade:offer', (o) => {
    const el = document.createElement('div'); el.className = 'modal tr-incoming'; el.id = 'tri-' + o.id;
    const p = P(o.from);
    el.innerHTML = `<div class="modal-box tr-box small">
      <div class="modal-head"><h2>🔄 ${p ? avatarHTML(p, 30) : ''} ${esc(o.fromName)} te propose un échange !</h2></div>
      <div class="tr-sum">
        <div class="tr-side want"><h4>📥 Tu reçois</h4><div class="tr-pack">${packHTML(o.give)}</div></div>
        <div class="tr-arrows">⇄</div>
        <div class="tr-side give"><h4>📤 Tu donnes</h4><div class="tr-pack">${packHTML(o.want)}</div></div>
      </div>
      <div class="tr-foot"><button class="btn btn-ghost" id="tri-no">❌ Refuser</button><button class="btn btn-primary" id="tri-yes">✅ Accepter</button></div></div>`;
    document.body.appendChild(el); sfx('legend', .6);
    el.querySelector('#tri-no').onclick = () => { socket.emit('trade:answer', { id: o.id, ok: false }); el.remove(); };
    el.querySelector('#tri-yes').onclick = () => {
      const err = hasPack(o.want);
      if (err) { socket.emit('trade:answer', { id: o.id, ok: false, why: `${save.look ? '' : ''}${err}` }); toast(err, 'error'); el.remove(); return; }
      socket.emit('trade:answer', { id: o.id, ok: true }); el.querySelector('.tr-foot').innerHTML = '<p>⏳ Confirmation…</p>';
    };
    setTimeout(() => el.remove(), 120000);
  });
  socket.on('trade:confirm', ({ id, give }, ack) => { const err = hasPack(give); ack(err ? { ok: false, why: err } : { ok: true }); });
  socket.on('trade:apply', ({ id, with: w, remove, add }) => {
    applyPack(remove, add);
    $('#tri-' + id)?.remove();
    delete pending[id];
    const el = document.createElement('div'); el.className = 'tr-done';
    el.innerHTML = `<div class="tr-dcard"><b>🤝 Échange réussi avec ${esc(w)} !</b><div class="tr-dgot"><small>Tu as reçu</small>${packHTML(add, 'Rien')}</div></div>`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3800);
    sfx('legend'); burst('money', 20);
    if ($('#locker') && !$('#locker').classList.contains('hidden')) TCG.lockerOpen();
  });
  socket.on('trade:result', ({ id, ok, why }) => {
    $('#tri-' + id)?.remove();
    if (!ok) toast(`🔄 ${why || 'Échange annulé'}`, 'error');
  });

  // bouton « Échanger » dans la liste des joueurs
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-trade]'); if (b) { e.stopPropagation(); open(b.dataset.trade); } });
  window.TRADE = { open };
})();
