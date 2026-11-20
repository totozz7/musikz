// PLAYZUP — 🃏 Cartes à collectionner (boosters, collection, doubles) + 🎒 Casier (tout ce que tu as débloqué, équipable en un clic)
(function () {
  const C = window.CARDS, B = C.booster;
  const RN = { c: 'Commune', r: '◆ Rare', e: '✦ Épique', l: '★ Légendaire', d: '✹ DIVINE' };
  const RK = { c: 0, r: 1, e: 2, l: 3, d: 4 };
  const SET = Object.fromEntries(C.sets.map(s => [s.id, s]));
  const byN = Object.fromEntries(C.list.map(c => [c.n, c]));
  const col = () => (save.cards = save.cards || {});
  const has = (n) => (col()[n] || 0) > 0;
  let filt = { set: 'all', r: 'all', own: false }, opening = false;

  function cardHTML(c, opts = {}) {
    const s = SET[c.s], own = opts.force || has(c.n), cnt = col()[c.n] || 0;
    if (!own) return `<div class="tcg locked r-${c.r}" data-n="${c.n}" style="--c1:${s.c1};--c2:${s.c2}"><div class="tcg-in"><div class="tcg-q">?</div><div class="tcg-lk">${esc(s.e)} #${String(c.n).padStart(3, '0')}</div><small>${RN[c.r]}</small></div></div>`;
    return `<div class="tcg r-${c.r} ${opts.big ? 'big' : ''}" data-n="${c.n}" style="--c1:${s.c1};--c2:${s.c2}">
      <div class="tcg-in">
        <div class="tcg-top"><b>${esc(c.name)}</b><span class="tcg-pw">⚡${c.r === 'd' ? '∞' : c.p}</span></div>
        <div class="tcg-art"><span class="tcg-em">${c.e}</span>${c.r !== 'c' ? '<i class="tcg-holo"></i>' : ''}${c.r === 'l' || c.r === 'd' ? '<i class="tcg-stars"></i>' : ''}</div>
        <div class="tcg-txt">${esc(c.t)}</div>
        <div class="tcg-bot"><span>${esc(s.e)} ${esc(s.name)}</span><span>#${String(c.n).padStart(3, '0')}</span></div>
        <span class="tcg-rar">${RN[c.r]}</span>
        ${cnt > 1 && !opts.big && !opts.force ? `<span class="tcg-x">×${cnt}</span>` : ''}
      </div></div>`;
  }
  function draw() {
    const tot = Object.values(B.odds).reduce((a, b) => a + b, 0);
    let x = Math.random() * tot, r = 'c';
    for (const [k, p] of Object.entries(B.odds)) { x -= p; if (x < 0) { r = k; break; } }
    const pool = C.list.filter(c => c.r === r);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ───────── collection ─────────
  function ensureModal() {
    if ($('#cards')) return;
    const el = document.createElement('div');
    el.id = 'cards'; el.className = 'modal hidden';
    el.innerHTML = `<div class="modal-box tcg-box">
      <div class="modal-head"><h2>🃏 <span class="tcg-title">COLLECTION</span></h2><div class="wallet big"><span>🪙</span><b class="coins-n">0</b></div><button class="btn btn-ghost btn-sm" id="cards-close">✕</button></div>
      <div class="tcg-shop">
        <button class="tcg-pack" id="pk-one"><span class="pk-art"><i>🃏</i><b>BOOSTER</b><small>1 carte</small></span><span class="pk-price">🪙 ${B.cost}</span></button>
        <button class="tcg-pack mega" id="pk-mega"><span class="pk-art"><i>✨</i><b>MÉGA</b><small>5 cartes · 1 rare min.</small></span><span class="pk-price">🪙 ${B.mega}</span></button>
        <div class="tcg-odds">${Object.entries(B.odds).map(([k, p]) => `<span class="r-${k}">${RN[k]} <b>${String(p).replace('.', ',')} %</b></span>`).join('')}</div>
      </div>
      <div class="tcg-prog" id="tcg-prog"></div>
      <div class="tcg-filters" id="tcg-filters"></div>
      <div class="tcg-grid" id="tcg-grid"></div>
    </div>`;
    document.body.appendChild(el);
    $('#cards-close').onclick = close;
    el.onclick = (e) => { if (e.target === el) close(); };
    $('#pk-one').onclick = () => buy(1);
    $('#pk-mega').onclick = () => buy(5);
  }
  function render() {
    const cl = col(), owned = C.list.filter(c => has(c.n)).length, dup = Object.entries(cl).reduce((a, [n, k]) => a + Math.max(0, k - 1) * B.recycle[byN[n]?.r || 'c'], 0);
    $$('#cards .coins-n').forEach(e => e.textContent = save.coins);
    $('#pk-one').classList.toggle('poor', save.coins < B.cost); $('#pk-mega').classList.toggle('poor', save.coins < B.mega);
    $('#tcg-prog').innerHTML = `<div class="tp-bar"><i style="width:${owned / C.list.length * 100}%"></i><b>${owned} / ${C.list.length} cartes</b></div>
      <div class="tp-r">${Object.keys(RN).map(r => { const all = C.list.filter(c => c.r === r), o = all.filter(c => has(c.n)).length; return `<span class="r-${r}">${RN[r]} ${o}/${all.length}</span>`; }).join('')}</div>
      ${dup ? `<button class="btn btn-ghost btn-sm" id="tcg-recycle">♻️ Recycler les doubles · +${dup} 🪙</button>` : ''}`;
    $('#tcg-recycle') && ($('#tcg-recycle').onclick = recycle);
    $('#tcg-filters').innerHTML = `<div class="tf-row">${[['all', '🌐 Toutes'], ...C.sets.map(s => [s.id, `${s.e} ${s.name}`])].map(([id, l]) => { const n = id === 'all' ? owned : C.list.filter(c => c.s === id && has(c.n)).length, t = id === 'all' ? C.list.length : C.list.filter(c => c.s === id).length; return `<button class="cat ${filt.set === id ? 'on' : ''}" data-set="${id}">${esc(l)} <small>${n}/${t}</small></button>`; }).join('')}</div>
      <div class="tf-row">${[['all', 'Toutes raretés'], ...Object.entries(RN)].map(([id, l]) => `<button class="cat r-${id} ${filt.r === id ? 'on' : ''}" data-r="${id}">${l}</button>`).join('')}<label class="tog"><input type="checkbox" id="tf-own" ${filt.own ? 'checked' : ''}><span></span> Seulement les miennes</label></div>`;
    $$('#tcg-filters [data-set]').forEach(b => b.onclick = () => { filt.set = b.dataset.set; render(); });
    $$('#tcg-filters [data-r]').forEach(b => b.onclick = () => { filt.r = b.dataset.r; render(); });
    $('#tf-own').onchange = (e) => { filt.own = e.target.checked; render(); };
    const list = C.list.filter(c => (filt.set === 'all' || c.s === filt.set) && (filt.r === 'all' || c.r === filt.r) && (!filt.own || has(c.n)));
    $('#tcg-grid').innerHTML = list.map(c => cardHTML(c)).join('') || '<p class="muted">Aucune carte ici… ouvre un booster !</p>';
    $$('#tcg-grid .tcg:not(.locked)').forEach(el => el.onclick = () => zoom(byN[el.dataset.n]));
  }
  function open() { ensureModal(); $('#cards').classList.remove('hidden'); render(); sfx('card'); }
  function close() { if (opening) return; $('#cards')?.classList.add('hidden'); }
  function recycle() {
    const cl = col(); let gain = 0, n = 0;
    for (const [k, v] of Object.entries(cl)) if (v > 1) { gain += (v - 1) * B.recycle[byN[k]?.r || 'c']; n += v - 1; cl[k] = 1; }
    if (!gain) return;
    save.coins += gain; persist(); renderProfile(); render();
    toast(`♻️ ${n} double${n > 1 ? 's' : ''} recyclé${n > 1 ? 's' : ''} : +${gain} 🪙`); coinFountain(Math.min(50, 8 + Math.round(gain / 15))); sfx('legend');
  }

  // ───────── zoom + effet 3D ─────────
  function zoom(c) {
    const ov = document.createElement('div'); ov.className = 'tcg-zoom';
    ov.innerHTML = `<div class="tz-wrap">${cardHTML(c, { big: true })}</div><p>${(col()[c.n] || 0) > 1 ? `Tu l'as en ×${col()[c.n]}` : 'Exemplaire unique'} · touche ailleurs pour fermer</p>`;
    document.body.appendChild(ov);
    const card = ov.querySelector('.tcg');
    tilt(card);
    ov.onclick = (e) => { if (!e.target.closest('.tcg')) ov.remove(); };
    sfx('card');
  }
  function tilt(card) {
    const mv = (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', ((x - .5) * 30) + 'deg'); card.style.setProperty('--rx', ((.5 - y) * 30) + 'deg');
      card.style.setProperty('--mx', (x * 100) + '%'); card.style.setProperty('--my', (y * 100) + '%');
    };
    card.addEventListener('pointermove', mv);
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  }

  // ───────── booster ─────────
  function buy(n) {
    if (opening) return;
    const cost = n === 1 ? B.cost : B.mega;
    if (save.coins < cost) { toast(`Il te manque ${cost - save.coins} 🪙`, 'error'); return; }
    let cards = Array.from({ length: n }, draw);
    if (n > 1 && !cards.some(c => RK[c.r] >= 1)) { const pool = C.list.filter(c => c.r === 'r'); cards[n - 1] = pool[Math.floor(Math.random() * pool.length)]; }
    cards.sort((a, b) => RK[a.r] - RK[b.r]); // la meilleure à la fin, pour le suspense
    // on enregistre tout de suite (pas de triche en rechargeant)
    save.coins -= cost;
    const fresh = cards.map(c => !has(c.n));
    cards.forEach(c => { col()[c.n] = (col()[c.n] || 0) + 1; });
    persist(); renderProfile(); render();
    reveal(cards, fresh, n > 1);
  }
  function reveal(cards, fresh, mega) {
    opening = true;
    const best = cards.reduce((a, c) => RK[c.r] > RK[a.r] ? c : a, cards[0]);
    const ov = document.createElement('div'); ov.className = `tcg-open best-${best.r}`; ov.id = 'tcg-open';
    ov.innerHTML = `<div class="to-rays"></div><div class="to-pack ${mega ? 'mega' : ''}" id="to-pack"><div class="tp-top"></div><div class="tp-body"><i>${mega ? '✨' : '🃏'}</i><b>${mega ? 'MÉGA BOOSTER' : 'BOOSTER'}</b><small>PlayZup TCG</small></div></div>
      <p class="to-hint" id="to-hint">Touche le paquet pour l'ouvrir !</p><div class="to-cards" id="to-cards"></div><button class="btn btn-primary hidden" id="to-done">Super !</button>`;
    document.body.appendChild(ov);
    sfx('pop');
    let i = -1, torn = false;
    const next = () => {
      i++;
      if (i >= cards.length) { $('#to-hint').textContent = mega ? 'Ta pioche du jour !' : ''; $('#to-done').classList.remove('hidden'); return; }
      const c = cards[i], wrap = document.createElement('div');
      wrap.className = `to-card r-${c.r}`;
      wrap.innerHTML = `<div class="to-flip"><div class="to-back"><span>PZ</span></div><div class="to-front">${cardHTML(c, { force: true })}</div></div>${fresh[i] ? '<em class="to-new">NOUVELLE !</em>' : '<em class="to-dup">Double</em>'}`;
      $('#to-cards').appendChild(wrap);
      $('#to-hint').textContent = cards.length > 1 ? `Carte ${i + 1} / ${cards.length} — touche pour la retourner` : 'Touche la carte pour la retourner';
      sfx('card');
      wrap.onclick = () => {
        if (wrap.classList.contains('flipped')) return;
        const delay = RK[c.r] >= 2 ? 900 : 0;
        if (delay) { wrap.classList.add('suspense'); sfx('drum'); }
        setTimeout(() => {
          wrap.classList.remove('suspense'); wrap.classList.add('flipped');
          tilt(wrap.querySelector('.tcg'));
          if (c.r === 'd') { divineFlash(); sfx('legend'); setTimeout(() => sfx('legend'), 300); burst('supernova', 40); toast('✹✹ CARTE DIVINE !!! ✹✹'); }
          else if (c.r === 'l') { sfx('legend'); setTimeout(() => sfx('legend'), 250); burst('galaxy', 40); toast('★ CARTE LÉGENDAIRE ! ★'); }
          else if (c.r === 'e') { sfx('legend'); burst('fireworks', 22); }
          else if (c.r === 'r') { sfx('pop'); burst('stars', 12); }
          else sfx('click');
          setTimeout(next, cards.length > 1 ? 650 : 0);
        }, delay);
      };
      if (cards.length > 1 && RK[c.r] < 1) setTimeout(() => wrap.click(), 350);
    };
    $('#to-pack').onclick = () => {
      if (torn) return; torn = true;
      $('#to-pack').classList.add('torn'); sfx('scratch');
      setTimeout(() => { $('#to-pack').remove(); next(); }, 700);
    };
    $('#to-done').onclick = () => { ov.remove(); opening = false; render(); };
  }

  // ───────── 🎒 casier ─────────
  const KL = { icons: '😀 Icônes', colors: '🎨 Couleurs de pseudo', frames: '🖼️ Cadres', nameFx: '✨ Effets de pseudo', titles: '🏷️ Titres', winFx: '🎉 Effets de victoire', pawns: '🐎 Pions', boards: '🎲 Plateaux (chevaux)', pcfx: '💥 Animations chevaux', cardbacks: '🃏 Dos de cartes', chessb: "♟️ Plateaux d'échecs", chesspc: "♞ Pièces d'échecs" };
  function lockerOpen() {
    let el = $('#locker');
    if (!el) {
      el = document.createElement('div'); el.id = 'locker'; el.className = 'modal hidden';
      el.innerHTML = `<div class="modal-box lk-box"><div class="modal-head"><h2>🎒 <span class="lk-title">MON CASIER</span></h2><button class="btn btn-ghost btn-sm" id="lk-cards">🃏 Mes cartes</button><button class="btn btn-ghost btn-sm" id="lk-close">✕</button></div>
        <div class="shop-preview"><span id="lk-avatar"></span><div><div id="lk-name" class="pv-name"></div><div id="lk-sub" class="pv-title"></div></div></div>
        <div id="lk-body"></div></div>`;
      document.body.appendChild(el);
      $('#lk-close').onclick = () => el.classList.add('hidden');
      $('#lk-cards').onclick = () => { el.classList.add('hidden'); open(); };
      el.onclick = (e) => { if (e.target === el) el.classList.add('hidden'); };
    }
    el.classList.remove('hidden'); lockerRender(); sfx('pop');
  }
  function lockerRender() {
    const m = me();
    let tot = 0, own = 0;
    const html = SHOP.wheel.kinds.map(k => {
      const lk = LOOK_KEY[k], items = SHOP[k].filter(it => owns(k, it.id));
      tot += SHOP[k].length; own += items.length;
      const RANKS = { free: 0, common: 1, rare: 2, epic: 3, legendary: 4, divine: 5 };
      items.sort((a, b) => (save.look[lk] === b.id) - (save.look[lk] === a.id) || RANKS[b.price ? SHOP.rarity(b.price) : 'free'] - RANKS[a.price ? SHOP.rarity(a.price) : 'free']);
      return `<section class="lk-sec"><h4>${KL[k] || k} <small>${items.length} / ${SHOP[k].length}</small></h4><div class="lk-row">${items.map(it => {
        const rar = it.price ? SHOP.rarity(it.price) : 'free', eq = save.look[lk] === it.id;
        return `<button class="item lk-it r-${rar} ${eq ? 'eq' : ''}" data-k="${k}" data-id="${esc(it.id)}">${rar !== 'free' && rar !== 'common' ? `<span class="rtag">${RARITY_LABEL[rar]}</span>` : ''}${itemPreview(k, it, m)}${k === 'icons' && !it.name ? '' : `<small>${esc(it.name || '')}</small>`}${eq ? '<span class="state eq">✔ Équipé</span>' : '<span class="state">Équiper</span>'}</button>`;
      }).join('')}</div></section>`;
    }).join('');
    const cards = C.list.filter(c => has(c.n)).length;
    $('#lk-avatar').innerHTML = avatarHTML ? avatarHTML({ ...m, avatar: m.avatar }, 64) : '';
    $('#lk-name').textContent = m.name;
    $('#lk-sub').textContent = `${own} objets débloqués sur ${tot} · ${cards} cartes sur ${C.list.length}`;
    $('#lk-body').innerHTML = html;
    $$('#lk-body .lk-it').forEach(b => b.onclick = () => {
      const k = b.dataset.k, id = b.dataset.id, lk = LOOK_KEY[k];
      if (save.look[lk] === id) return;
      save.look[lk] = id; persist(); renderProfile(); pushLook(); applyCardback(); window.CHESS?.refresh?.();
      if (k === 'winFx') burst(id); if (k === 'pcfx') window.HORSES?.demo(id); if (k === 'boards') window.HORSES?.skinBoard();
      sfx('pop'); lockerRender();
    });
  }
  window.TCG = { open, lockerOpen, cardHTML };
  $('#rw-cards')?.addEventListener('click', open);
  $('#rw-locker')?.addEventListener('click', lockerOpen);
  $('#btn-cards')?.addEventListener('click', open);
  $('#btn-locker')?.addEventListener('click', lockerOpen);
})();
