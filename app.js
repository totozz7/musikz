// MUSIKZ — client
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

const REACTS = ['🔥', '😂', '😱', '👏', '💀', '🎉', '😭', '🤯', '❤️', '🐐'];
const COLORS = ['#ff2e4d', '#ff7a1a', '#ffc21a', '#c0ff00', '#4cd964', '#30d5c8', '#00e5ff', '#2fa9ff', '#7c5cff', '#e0b0ff', '#ff4fa3', '#ff9ecf', '#ffd59e', '#ffffff'];
// Icône avec son cadre, et pseudo avec son effet (utilisés partout : joueurs, podium, chat…)
const avatarHTML = (p, size = 36) => `<span class="avf fr-${esc(p.frame || 'none')}" style="--s:${size}px;--c:${esc(p.color || '#ffc21a')}"><span class="avi">${esc(p.avatar || '🙂')}</span></span>`;
const nameHTML = (p, extra = '') => `<span class="pname nfx-${esc(p.nameFx || 'none')}" style="--c:${esc(p.color || '#fff')}" data-t="${esc(p.name)}">${esc(p.name)}</span>${extra}`;

// ───────────── Sauvegarde (dans le navigateur) ─────────────
// Le serveur gratuit oublie tout quand il s'endort, donc la progression vit dans le navigateur de chaque joueur.
const SAVE_KEY = 'mz_save';
function defaultSave() {
  return { v: 1, coins: SHOP.startCoins, owned: [], games: 0, wins: 0, good: 0, lastGame: '',
    look: { avatar: store.get('mz_avatar', SHOP.icons[Math.floor(Math.random() * 20)].id), color: store.get('mz_color', COLORS[Math.floor(Math.random() * 8)]),
      frame: 'classic', nameFx: 'none', title: 'debutant', winFx: 'party' } };
}
let save;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY)) || defaultSave(); } catch { save = defaultSave(); }
save = { ...defaultSave(), ...save, look: { ...defaultSave().look, ...(save.look || {}) } };
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };
const owns = (kind, id) => (SHOP[kind].find(x => x.id === id)?.price || 0) === 0 || save.owned.includes(kind + ':' + id);
// un cosmétique équipé mais pas possédé (ancienne version) revient au gratuit
for (const [k, d] of [['icons', null], ['frames', 'classic'], ['nameFx', 'none'], ['titles', 'debutant'], ['winFx', 'party']]) {
  const key = k === 'icons' ? 'avatar' : k === 'frames' ? 'frame' : k === 'titles' ? 'title' : k;
  if (!owns(k, save.look[key])) save.look[key] = d || SHOP.icons[0].id;
}
persist();
const me = () => ({ ...save.look, name: ($('#name')?.value || '').trim() || 'Ton pseudo', titleName: SHOP.titles.find(t => t.id === save.look.title && t.id !== 'none')?.name || '' });

let pid = store.get('mz_pid');
if (!pid) { pid = Math.random().toString(36).slice(2) + Date.now().toString(36); store.set('mz_pid', pid); }

const socket = io();
const audio = new Audio();
audio.preload = 'auto';
let baseVolume = +store.get('mz_vol', 80) / 100;
audio.volume = baseVolume;

let state = null;       // état du salon
let categories = [];
let round = null;       // manche en cours
let tick = null;


// ───────────── Accueil ─────────────
$('#name').value = store.get('mz_name', '');
function renderProfile() {
  const m = me();
  for (const [av, nm, tt] of [['#pv-avatar', '#pv-name', '#pv-title'], ['#sp-avatar', '#sp-name', '#sp-title']]) {
    $(av).innerHTML = avatarHTML(m, 76);
    $(nm).innerHTML = nameHTML(m);
    $(tt).textContent = m.titleName ? '« ' + m.titleName + ' »' : '';
  }
  $('#coins').textContent = save.coins; $('#coins2').textContent = save.coins;
}
renderProfile();
$('#name').addEventListener('input', renderProfile);

// ───────────── Boutique ─────────────
let shopTab = 'icons';
$('#btn-shop').onclick = () => { $('#shop').classList.remove('hidden'); renderShop(); };
$('#shop-close').onclick = () => $('#shop').classList.add('hidden');
$('#shop').onclick = (e) => { if (e.target.id === 'shop') $('#shop').classList.add('hidden'); };
$$('#shop-tabs button').forEach(b => b.onclick = () => { shopTab = b.dataset.tab; renderShop(); });

function renderShop() {
  $$('#shop-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === shopTab));
  const body = $('#shop-body'); const m = me();
  const lookKey = { icons: 'avatar', frames: 'frame', nameFx: 'nameFx', titles: 'title', winFx: 'winFx' }[shopTab];
  if (shopTab === 'color') {
    body.innerHTML = `<div class="colors big">${COLORS.map(c => `<button class="sw ${c === save.look.color ? 'sel' : ''}" style="--c:${c}" data-c="${c}"></button>`).join('')}</div>
      <p class="muted small">Couleur de ton pseudo et de ton cadre classique/néon (gratuit).</p>`;
    $$('#shop-body .sw').forEach(b => b.onclick = () => { save.look.color = b.dataset.c; persist(); renderProfile(); renderShop(); });
    return;
  }
  if (shopTab === 'save') {
    body.innerHTML = `
      <div class="stats"><div><b>${save.games}</b><small>parties</small></div><div><b>${save.wins}</b><small>victoires</small></div>
      <div><b>${save.good}</b><small>bonnes réponses</small></div><div><b>${save.owned.length}</b><small>objets</small></div></div>
      <p>Ta progression est enregistrée <b>dans ce navigateur</b>. Pour la garder sur un autre appareil (ou si tu vides ton historique),
      copie ton code de sauvegarde et colle-le de l'autre côté.</p>
      <button id="sv-copy" class="btn btn-yellow">📋 Copier mon code de sauvegarde</button>
      <textarea id="sv-code" class="input" rows="3" placeholder="Colle ici un code de sauvegarde…"></textarea>
      <button id="sv-load" class="btn btn-ghost">♻️ Restaurer ce code</button>`;
    $('#sv-copy').onclick = async () => {
      const code = 'MZ1.' + btoa(unescape(encodeURIComponent(JSON.stringify(save))));
      try { await navigator.clipboard.writeText(code); toast('📋 Code copié ! Garde-le précieusement'); } catch { $('#sv-code').value = code; $('#sv-code').select(); toast('Copie le code dans la case'); }
    };
    $('#sv-load').onclick = () => {
      try {
        const raw = $('#sv-code').value.trim().replace(/^MZ1\./, '');
        const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
        if (typeof data.coins !== 'number' || !Array.isArray(data.owned)) throw 0;
        save = { ...defaultSave(), ...data, look: { ...defaultSave().look, ...data.look } }; persist(); renderProfile(); renderShop();
        toast('♻️ Sauvegarde restaurée !');
      } catch { toast('Code invalide 😕', 'error'); }
    };
    return;
  }
  const items = SHOP[shopTab];
  body.innerHTML = `<div class="shop-grid ${shopTab}">${items.map(it => {
    const own = owns(shopTab, it.id), eq = save.look[lookKey] === it.id;
    let prev = '';
    if (shopTab === 'icons') prev = avatarHTML({ ...m, avatar: it.id }, 52);
    if (shopTab === 'frames') prev = avatarHTML({ ...m, frame: it.id }, 52);
    if (shopTab === 'nameFx') prev = `<div class="nprev">${nameHTML({ ...m, nameFx: it.id })}</div>`;
    if (shopTab === 'titles') prev = `<div class="tprev">${it.id === 'none' ? '—' : '« ' + esc(it.name) + ' »'}</div>`;
    if (shopTab === 'winFx') prev = `<div class="wprev">${it.emojis}</div>`;
    const label = shopTab === 'icons' ? '' : `<small>${esc(it.name)}</small>`;
    const btn = eq ? '<span class="state eq">✔ Équipé</span>' : own ? '<span class="state">Équiper</span>' : `<span class="state price ${save.coins >= it.price ? '' : 'poor'}">🪙 ${it.price}</span>`;
    return `<button class="item ${eq ? 'eq' : ''} ${own ? '' : 'locked'}" data-id="${esc(it.id)}">${prev}${label}${btn}</button>`;
  }).join('')}</div>`;
  $$('#shop-body .item').forEach(b => b.onclick = () => {
    const it = items.find(x => x.id === b.dataset.id);
    if (!owns(shopTab, it.id)) {
      if (save.coins < it.price) return toast(`Il te manque ${it.price - save.coins} 🪙`, 'error');
      save.coins -= it.price; save.owned.push(shopTab + ':' + it.id);
      toast(`🛍️ Acheté ! (-${it.price} 🪙)`); sfx('legend');
    }
    save.look[lookKey] = it.id; persist(); renderProfile(); renderShop();
    if (shopTab === 'winFx') burst(it.id);
    // déjà dans un salon : on met à jour son look pour les autres
    if (joinedCode) socket.emit('join', { code: joinedCode, name: store.get('mz_name'), pid, ...save.look }, () => {});
  });
}

const urlCode = (location.pathname.match(/^\/r\/([A-Za-z0-9]{5})/) || [])[1] || new URLSearchParams(location.search).get('room');
if (urlCode) { $('#code').value = urlCode.toUpperCase(); $('#btn-join').textContent = 'Rejoindre ' + urlCode.toUpperCase(); }

function identity() {
  const name = $('#name').value.trim();
  if (!name) { $('#home-err').textContent = 'Choisis un pseudo d\'abord 😉'; $('#name').focus(); return null; }
  store.set('mz_name', name);
  unlockAudio();
  return { name, pid, ...save.look };
}
function unlockAudio() {
  // les navigateurs exigent un clic avant de jouer du son : on "débloque" l'élément audio ici
  audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  audio.play().catch(() => {});
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {}
}
let actx = null;
$('#btn-create').onclick = () => {
  const id = identity(); if (!id) return;
  socket.emit('create', id, onJoined);
};
$('#btn-join').onclick = () => {
  const id = identity(); if (!id) return;
  const code = $('#code').value.trim().toUpperCase();
  if (code.length !== 5) { $('#home-err').textContent = 'Le code fait 5 caractères.'; return; }
  socket.emit('join', { ...id, code }, onJoined);
};
$('#code').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-join').click(); });
$('#name').addEventListener('keydown', e => { if (e.key === 'Enter') (urlCode ? $('#btn-join') : $('#btn-create')).click(); });

let joinedCode = null;
function onJoined(res) {
  if (res.error) { $('#home-err').textContent = res.error; return; }
  joinedCode = res.code;
  history.replaceState(null, '', '/r/' + res.code);
  $('#home').classList.remove('active'); $('#room').classList.add('active');
  $('#room-code').textContent = res.code;
  $('#chat').innerHTML = ''; (res.chat || []).forEach(addChat);
}
// reconnexion automatique (ex. téléphone en veille)
socket.on('connect', () => {
  if (joinedCode) socket.emit('join', { code: joinedCode, name: store.get('mz_name'), pid, ...save.look }, (r) => {
    if (r.error) { toast(r.error, 'error'); leave(); } else { $('#chat').innerHTML = ''; r.chat.forEach(addChat); }
  });
});

function leave() { location.href = '/'; }
$('#btn-leave').onclick = leave;
socket.on('kicked', () => { alert('Tu as été exclu du salon.'); leave(); });

$('#room-code-box').onclick = async () => {
  const link = location.origin + '/r/' + joinedCode;
  try { await navigator.clipboard.writeText(link); toast('🔗 Lien copié ! Envoie-le à tes potes'); }
  catch { prompt('Copie ce lien :', link); }
};
$('#volume').value = Math.round(audio.volume * 100);
$('#volume').oninput = (e) => { baseVolume = e.target.value / 100; if (!yoyoTimer) audio.volume = baseVolume; store.set('mz_vol', e.target.value); };
$('#btn-chat-toggle').onclick = () => $('#chat-panel').classList.toggle('open');

// ───────────── Catégories ─────────────
fetch('/api/categories').then(r => r.json()).then(c => { categories = c; if (state) renderSettings(); });

const isHost = () => state && state.hostId === pid;
const setSetting = (patch) => socket.emit('settings', patch);

function renderCats() {
  const s = state.settings;
  const groups = {};
  categories.forEach(c => (groups[c.group] ||= []).push(c));
  $('#cats').innerHTML = Object.entries(groups).map(([g, list]) => `
    <div class="cat-group"><div class="g">${esc(g)}</div><div class="cat-list">
      ${list.map(c => `<button class="cat ${s.categories.includes(c.id) ? 'on' : ''} ${c.star ? 'star' : ''}" data-id="${c.id}">${c.emoji} ${esc(c.name)}</button>`).join('')}
    </div></div>`).join('');
  $$('#cats .cat').forEach(b => b.onclick = () => {
    const set = new Set(state.settings.categories);
    set.has(b.dataset.id) ? set.delete(b.dataset.id) : set.add(b.dataset.id);
    setSetting({ categories: [...set] });
  });
  const n = s.categories.length;
  $('#cat-count').textContent = n ? `(${n} sélectionnée${n > 1 ? 's' : ''})` : '';
}
$$('[data-catsel]').forEach(b => b.onclick = () => {
  const v = b.dataset.catsel;
  if (v === 'all') setSetting({ categories: categories.map(c => c.id) });
  if (v === 'none') setSetting({ categories: [] });
  if (v === 'random') setSetting({ categories: [...categories].sort(() => Math.random() - .5).slice(0, 4).map(c => c.id) });
});

function renderSettings() {
  if (!state) return;
  const s = state.settings;
  renderCats();
  $$('.seg').forEach(seg => {
    const k = seg.dataset.key;
    seg.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', String(s[k]) === b.dataset.v);
      b.onclick = () => setSetting({ [k]: isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v });
    });
  });
  $('#answer-block').style.display = s.mode === 'qcm' ? 'none' : '';
  $$('.tog input').forEach(i => { i.checked = !!s[i.dataset.key]; i.onchange = () => setSetting({ [i.dataset.key]: i.checked }); });
  if (document.activeElement !== $('#custom-link')) $('#custom-link').value = s.customLink || '';
  $('#pl-status').textContent = s.customLink ? `✅ ${s.customSource ? s.customSource + ' · ' : ''}${s.customTitle || 'Playlist perso ajoutée à la partie'}` : '';
  $('#custom-only-row').classList.toggle('hidden', !s.customLink);
  $('#settings').classList.toggle('readonly', !isHost());
  $('#btn-start').style.display = isHost() ? '' : 'none';
  $('#wait-host').style.display = isHost() ? 'none' : '';
  $('#lobby-sub').textContent = isHost() ? 'Invite tes potes avec le lien en haut, choisis les catégories et lance la partie.' : 'L\'hôte prépare la partie. Tu vois les réglages en direct.';
}
$('#btn-check-pl').onclick = () => {
  const link = $('#custom-link').value.trim();
  if (!link) { setSetting({ customLink: '' }); return; }
  $('#pl-status').textContent = '⏳ Vérification…';
  socket.emit('checkPlaylist', link, (r) => {
    if (r.error) { $('#pl-status').textContent = '❌ ' + r.error; return; }
    setSetting({ customLink: link, customTitle: r.title, customSource: r.source });
    setTimeout(() => $('#pl-status').textContent = `✅ ${r.source} · « ${r.title} » — ${r.count} morceaux ajoutés`, 100);
  });
};
$('#btn-start').onclick = () => socket.emit('start');
$('#btn-replay').onclick = () => socket.emit('start');
$('#btn-lobby').onclick = () => socket.emit('backToLobby');
$('#btn-skip').onclick = () => socket.emit('skip');
$('#btn-skip-pw').onclick = () => socket.emit('skip');
$('#btn-ban').onclick = () => { socket.emit('ban'); $('#btn-ban').disabled = true; $('#btn-ban').textContent = '🚫 Signalé'; };
$('#btn-next').onclick = () => { $('#btn-next').classList.add('hidden'); socket.emit('next'); };
$('#btn-stop').onclick = () => socket.emit('stop');

// ───────────── État du salon ─────────────
function showView(id) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === id));
}
socket.on('room', (r) => {
  const prevPhase = state?.phase;
  state = r;
  renderPlayers();
  $$('.host-only').forEach(e => e.style.display = isHost() ? '' : 'none');
  $$('.guest-only').forEach(e => e.style.display = isHost() ? 'none' : '');
  if (r.phase === 'lobby') { showView('v-lobby'); renderSettings(); stopAudio(); resetEffects(); }
  if (r.phase === 'powers') renderPowerStatus();
  if (r.phase === 'loading') showView('v-loading');
  if (r.phase === 'end' && prevPhase !== 'end') renderEnd();
});

function renderPlayers() {
  const ps = [...state.players].sort((a, b) => b.score - a.score);
  $('#player-count').textContent = ps.filter(p => p.online).length;
  const inGame = ['playing', 'reveal'].includes(state.phase);
  $('#players').innerHTML = ps.map((p, i) => {
    const marks = state.phase === 'playing'
      ? (state.settings.mode === 'qcm' ? (p.answered ? '✅' : '') : `${p.foundArtist ? '🎤' : ''}${p.foundTitle ? '🎵' : ''}`)
      : state.phase === 'powers' ? (p.powered ? '🃏' : '⏳') : '';
    const done = state.phase === 'playing' && (state.settings.mode === 'qcm' ? p.answered : (p.foundArtist || p.foundTitle));
    return `<li style="--c:${p.color}" class="${p.online ? '' : 'off'} ${done ? 'done' : ''}">
      ${inGame || state.phase === 'end' ? `<span class="rank">${i + 1}</span>` : ''}
      ${avatarHTML(p, 38)}
      <span class="nm">${nameHTML(p)}${p.host ? ' 👑' : ''}${p.title ? `<small class="ptitle">« ${esc(p.title)} »</small>` : p.id === pid ? ' <small>(toi)</small>' : ''}${p.streak >= 3 ? ` <small>🔥 série de ${p.streak}</small>` : ''}</span>
      <span class="marks">${marks}</span>
      <span class="sc">${p.score}</span>
      ${isHost() && p.id !== pid && state.phase === 'lobby' ? `<button class="kick" data-kick="${p.id}" title="Exclure">✕</button>` : ''}
    </li>`;
  }).join('');
  $$('[data-kick]').forEach(b => b.onclick = () => socket.emit('kick', b.dataset.kick));
}

// ───────────── Manche ─────────────
function stopAudio() { clearInterval(tick); try { audio.pause(); } catch {} }

socket.on('round', (r) => {
  round = { ...r, startAt: Date.now() + r.startIn, myArtist: false, myTitle: false };
  showView('v-play');
  const cat = categories.find(c => c.id === r.cat);
  $('#round-num').textContent = `${r.index + 1} / ${r.total}`;
  $('#round-cat').textContent = cat ? `${cat.emoji} ${cat.name}` : (r.cat === 'perso' ? '🎵 Playlist perso' : '');
  $('#guess').value = ''; $('#guess-feedback').textContent = ''; $('#guess-feedback').className = 'feedback';
  $('#btn-unmute').classList.add('hidden');
  const text = r.mode === 'text';
  $('#text-answer').style.display = text ? '' : 'none';
  $('#qcm-answer').style.display = text ? 'none' : '';
  $('#b-artist').style.display = r.work || r.answer === 'title' ? 'none' : '';
  $('#b-title').style.display = !r.work && r.answer === 'artist' ? 'none' : '';
  $('#b-title').textContent = r.work ? '📺 ' + (r.label || 'Nom de l\'œuvre') : '🎵 Titre';
  $('#b-artist').classList.remove('ok'); $('#b-title').classList.remove('ok');
  round.answer = r.work ? 'title' : r.answer;
  $('#guess').placeholder = r.work ? `${r.label || 'Nom de l\'œuvre'}… (Entrée pour valider)` : r.answer === 'both' ? 'Artiste ou titre… (Entrée pour valider)' : r.answer === 'title' ? 'Le titre… (Entrée pour valider)' : 'L\'artiste… (Entrée pour valider)';
  $('#guess').disabled = false;
  $('#qcm-answer').className = 'qcm';
  $('#qcm-answer').innerHTML = (r.choices || []).map(c => `<button data-id="${esc(c.id)}" class="${c.artist ? '' : 'work'}"><b>${esc(c.title)}</b>${c.artist ? `<span>${esc(c.artist)}</span>` : ''}</button>`).join('');
  $$('#qcm-answer button').forEach(b => b.onclick = () => {
    if ($('#qcm-answer').classList.contains('locked') || Date.now() < round.startAt || Date.now() < frozenUntil) return;
    b.classList.add('picked'); $('#qcm-answer').classList.add('locked');
    socket.emit('choose', b.dataset.id);
  });

  // audio
  stopAudio();
  if (r.preview) { audio.src = r.preview; audio.load(); }
  $('#eq').classList.add('paused');
  resetEffects();
  applyEffects(r.effects);
  let started = false;
  tick = setInterval(() => {
    const now = Date.now();
    const toStart = round.startAt - now;
    if (toStart > 0) {
      $('#countdown').textContent = Math.ceil(toStart / 1000);
      $('#timer-bar').style.transform = 'scaleX(1)';
      $('#time-left').textContent = '';
      return;
    }
    $('#countdown').textContent = '';
    if (!started) {
      started = true;
      if (text) setTimeout(() => $('#guess').focus(), 50);
      if (r.preview) {
        if (!round.early) try { audio.currentTime = Math.min(25, Math.max(0, -toStart / 1000)); } catch {}
        audio.play().then(() => $('#eq').classList.remove('paused')).catch(() => $('#btn-unmute').classList.remove('hidden'));
      }
    }
    const elapsed = (now - round.startAt) / 1000;
    const left = Math.max(0, r.duration - elapsed);
    $('#timer-bar').style.transform = `scaleX(${left / r.duration})`;
    $('#time-left').textContent = Math.ceil(left) + ' s';
    if (left <= 0) { audio.pause(); $('#eq').classList.add('paused'); }
  }, 100);
});
$('#btn-unmute').onclick = () => {
  const elapsed = (Date.now() - round.startAt) / 1000;
  try { audio.currentTime = Math.max(0, elapsed); } catch {}
  audio.play().then(() => { $('#btn-unmute').classList.add('hidden'); $('#eq').classList.remove('paused'); }).catch(() => toast('Impossible de lire le son 😕', 'error'));
};

$('#guess-form').onsubmit = (e) => {
  e.preventDefault();
  const v = $('#guess').value.trim();
  if (!v || !round || Date.now() < round.startAt) return;
  socket.emit('guess', v, (res) => {
    const fb = $('#guess-feedback');
    if (res.artist) $('#b-artist').classList.add('ok');
    if (res.title) $('#b-title').classList.add('ok');
    if (res.gained.length) {
      const pts = res.gained.reduce((s, g) => s + (g.pts || 0), 0);
      const parts = [];
      if (res.gained.some(g => g.type === 'artist')) parts.push('Artiste trouvé');
      if (res.gained.some(g => g.type === 'title')) parts.push(round.work ? 'Trouvé' : 'Titre trouvé');
      if (res.gained.some(g => g.type === 'first')) parts.push('🥇 premier');
      if (res.gained.some(g => g.type === 'combo')) parts.push('🎯 combo');
      fb.textContent = `✅ ${parts.join(' · ')} ! +${pts}`; fb.className = 'feedback good';
      $('#guess').value = '';
      if (res.done) { $('#guess').disabled = true; $('#guess').placeholder = '🎉 Bravo, tout trouvé ! Attends les autres…'; }
    } else if (res.close) {
      fb.textContent = '🔥 Tu chauffes ! Presque…'; fb.className = 'feedback close';
      $('#guess').classList.add('shake'); setTimeout(() => $('#guess').classList.remove('shake'), 300);
    } else {
      fb.textContent = '❌ Raté, essaie encore'; fb.className = 'feedback bad';
      $('#guess').classList.add('shake'); setTimeout(() => $('#guess').classList.remove('shake'), 300);
      $('#guess').value = '';
    }
  });
};

socket.on('found', (f) => {
  addChat({ found: true, text: `${f.avatar} ${f.name} a trouvé ${f.what} !` });
  burst(f.winFx, f.id === pid ? 22 : 9);
});

// ───────────── Révélation ─────────────
socket.on('reveal', (rv) => {
  clearInterval(tick);
  resetEffects();
  if (round?.imposteur) {
    round.imposteur = false;
    toast("🎭 SURPRISE : tu écoutais un IMPOSTEUR ! Ce n'était pas la bonne chanson 😂", 'error');
    if (rv.track && round.preview) { try { audio.src = round.preview; audio.load(); audio.play().catch(() => {}); } catch {} }
  }
  showView('v-reveal');
  // on laisse la musique continuer quelques secondes pendant la révélation
  if (audio.paused && audio.src && round?.preview) audio.play().catch(() => {});
  $('#rv-cover').src = rv.track.cover || '';
  $('#rv-cover').style.display = rv.track.cover ? '' : 'none';
  $('#rv-title').textContent = rv.track.title;
  $('#rv-artist').textContent = rv.track.artist;
  $('#rv-artist').style.display = rv.track.artist ? '' : 'none';
  $('#rv-sub').textContent = rv.track.sub ? '🎵 ' + rv.track.sub : '';
  $('#rv-note').textContent = rv.track.note ? '📺 ' + rv.track.note : '';
  $('#btn-ban').disabled = false; $('#btn-ban').textContent = '🚫 Mauvaise version';
  $('#rv-link').href = rv.track.link || '#';
  $('#rv-link').style.display = rv.track.link ? '' : 'none';
  const byId = Object.fromEntries(state.players.map(p => [p.id, p]));
  const rows = rv.results.filter(r => byId[r.id]).sort((a, b) => b.gained - a.gained);
  $('#rv-results').innerHTML = rows.map(r => {
    const p = byId[r.id];
    const what = state.settings.mode === 'qcm' ? (r.correct ? '✅' : '❌') : `${r.artist ? '🎤' : ''}${r.title ? '🎵' : ''}${!r.artist && !r.title ? '❌' : ''}`;
    return `<li class="${r.gained ? 'win' : ''}">${avatarHTML(p, 26)} ${nameHTML(p)} ${what} ${r.gained ? `<b>+${r.gained}</b>` : ''}${r.time && r.gained ? ` <span class="muted small">${r.time.toFixed(1)} s</span>` : ''}</li>`;
  }).join('');
  const manual = !rv.pause;
  $('#next-wrap').classList.toggle('hidden', manual);
  $('#btn-next').classList.toggle('hidden', !(manual && isHost()));
  $('#wait-next').classList.toggle('hidden', !(manual && !isHost()));
  const bar = $('#next-bar'); bar.style.transition = 'none'; bar.style.width = '0';
  if (!manual) requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `width ${rv.pause}s linear`; bar.style.width = '100%'; }));
  // la musique continue pendant la révélation, puis s'arrête avant le morceau suivant
  clearTimeout(window._stopRv);
  window._stopRv = setTimeout(() => { if (state?.phase !== 'playing') audio.pause(); }, manual ? 15000 : Math.max(1500, rv.pause * 1000 - 400));
  if (rv.results.find(r => r.id === pid)?.gained) confetti(14);
});

// ───────────── Fin ─────────────
socket.on('end', (e) => {
  const mine = e.coins?.[pid];
  if (mine && save.lastGame !== e.gameId) {
    save.lastGame = e.gameId; save.coins += mine.coins; save.games++; save.good += mine.good; if (mine.win) save.wins++;
    persist(); renderProfile();
  }
  if (mine) {
    $('#earned').classList.remove('hidden');
    $('#earned').innerHTML = `<span class="coin-spin">🪙</span> +${mine.coins} pièces <small>(${mine.good} bonne${mine.good > 1 ? 's' : ''} réponse${mine.good > 1 ? 's' : ''}${mine.rank <= 3 && Object.keys(e.coins).length > 1 ? ' · bonus podium' : ''})</small> · Total : <b>${save.coins} 🪙</b>`;
  }
  $('#history').innerHTML = e.history.map(h => `<li><b>${esc(h.title)}</b> — ${esc(h.artist)}</li>`).join('');
});
function renderEnd() {
  stopAudio();
  $('#earned').classList.add('hidden');
  showView('v-end');
  const ps = [...state.players].sort((a, b) => b.score - a.score);
  const order = [ps[1], ps[0], ps[2]];
  $('#podium').innerHTML = order.map((p, i) => p ? `<div class="step p${[2, 1, 3][i]}">
    ${avatarHTML(p, 70)}<span class="nm">${nameHTML(p)}</span>${p.title ? `<small class="ptitle">« ${esc(p.title)} »</small>` : ''}<span class="pts">${p.score} pts</span>
    <div class="block">${[2, 1, 3][i]}</div></div>` : '').join('');
  $('#final-list').innerHTML = ps.slice(3).map((p, i) => `<li value="${i + 4}">${avatarHTML(p, 28)} ${nameHTML(p)} — ${p.score} pts</li>`).join('');
  if (ps[0]?.id === pid) confetti(60); else confetti(20);
}

// ───────────── Chat & réactions ─────────────
function addChat(m) {
  const li = document.createElement('li');
  if (m.sys) { li.className = 'sys'; li.textContent = m.text; }
  else if (m.found) { li.className = 'found'; li.textContent = m.text; }
  else { li.style.setProperty('--c', m.color); li.innerHTML = `${avatarHTML(m, 22)} <b>${nameHTML(m)}</b> ${esc(m.text)}`; }
  const ul = $('#chat'); ul.appendChild(li);
  while (ul.children.length > 150) ul.firstChild.remove();
  ul.scrollTop = ul.scrollHeight;
}
socket.on('chat', addChat);
$('#chat-form').onsubmit = (e) => {
  e.preventDefault();
  const v = $('#chat-input').value.trim(); if (!v) return;
  socket.emit('chat', v); $('#chat-input').value = '';
};
$('#reacts').innerHTML = REACTS.map(r => `<button type="button">${r}</button>`).join('');
$$('#reacts button').forEach(b => b.onclick = () => socket.emit('react', b.textContent));
socket.on('react', ({ emoji, avatar, name }) => {
  const el = document.createElement('div');
  el.className = 'flying';
  el.style.left = (5 + Math.random() * 85) + 'vw';
  el.innerHTML = `${emoji}<small>${avatar} ${esc(name)}</small>`;
  $('#reactions-layer').appendChild(el);
  setTimeout(() => el.remove(), 2700);
});

// ───────────── Divers ─────────────
function toast(text, type = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + type; t.textContent = text;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
socket.on('toast', (t) => toast(t.text, t.type));

function confetti(n) {
  const emojis = ['🎉', '⭐', '🎵', '🎶', '🟥', '🟨'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'flying';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    el.style.animationDelay = Math.random() * .6 + 's';
    el.textContent = emojis[i % emojis.length];
    $('#reactions-layer').appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }
}


// ═════════════════════ 🃏 MODE ZIZANIE ═════════════════════
let powersTick = null, myPowers = null;

socket.on('powers', (p) => {
  stopAudio(); resetEffects();
  myPowers = { ...p, endAt: Date.now() + p.endsIn };
  showView('v-powers');
  $('#pw-num').textContent = `${p.index + 1} / ${p.total}`;
  $('#pw-targets').classList.add('hidden');
  $('#pw-cards').className = 'pw-cards';
  $('#pw-cards').innerHTML = p.offers.map(o => `
    <button class="pw-card ${o.type} ${o.rarity}" data-id="${o.id}">
      <span class="tag">${o.type === 'bonus' ? '🎁 Bonus' : '😈 Malus'}</span>
      <span class="rar">${{ common: 'Commune', rare: '◆ Rare', epic: '✦ ÉPIQUE ✦', legendary: '★ LÉGENDAIRE ★' }[o.rarity] || ''}</span>
      <span class="em">${o.emoji}</span><b>${esc(o.name)}</b><small>${esc(o.desc)}</small>
    </button>`).join('');
  $$('#pw-cards .pw-card').forEach(c => c.onclick = () => pickCard(c));
  if (p.offers.some(o => o.rarity === 'legendary')) { sfx('legend'); setTimeout(() => sfx('legend'), 350); toast('🌈 Carte LÉGENDAIRE dans ta main !!!'); }
  else if (p.offers.some(o => o.rarity === 'epic')) { sfx('legend'); toast('💜 Carte ÉPIQUE !'); }
  $('#btn-pw-none').classList.remove('hidden');
  $('#pw-status').textContent = p.offers.some(o => o.type === 'malus') ? 'Un bonus pour toi, ou un malus pour embêter quelqu\'un ?' : 'Choisis un bonus !';
  if (p.chosen) lockCards(p.chosen.id);
  clearInterval(powersTick);
  powersTick = setInterval(() => {
    const left = Math.max(0, myPowers.endAt - Date.now());
    $('#pw-bar').style.transform = `scaleX(${left / 10000})`;
    if (!left) clearInterval(powersTick);
  }, 100);
  renderPowerStatus();
});

function pickCard(card) {
  const id = card.dataset.id;
  const offer = myPowers.offers.find(o => o.id === id);
  $$('#pw-cards .pw-card').forEach(c => c.classList.toggle('sel', c === card));
  if (offer.type === 'bonus') return sendPower(id);
  // malus : choisir la victime
  const others = state.players.filter(p => p.id !== pid && p.online);
  $('#pw-targets').classList.remove('hidden');
  $('#pw-targets').innerHTML = `<div class="lbl2">${offer.emoji} Sur qui ?</div>` +
    others.map(p => `<button data-t="${p.id}">${avatarHTML(p, 30)} ${nameHTML(p)}</button>`).join('');
  $$('#pw-targets [data-t]').forEach(b => b.onclick = () => sendPower(id, b.dataset.t));
}

function sendPower(id, target) {
  socket.emit('power', { id, target }, (r) => {
    if (r?.error) return toast(r.error, 'error');
    lockCards(id, target);
    sfx('pop');
  });
}
function lockCards(id, target) {
  $('#pw-cards').classList.add('locked');
  $('#pw-targets').classList.add('hidden');
  $('#btn-pw-none').classList.add('hidden');
  const o = myPowers?.offers.find(x => x.id === id);
  const tg = target && state.players.find(p => p.id === target);
  $('#pw-status').textContent = id === 'none' ? '😇 Tu passes ton tour. En attente des autres…'
    : `✅ ${o?.emoji || ''} ${o?.name || ''}${tg ? ' → ' + tg.avatar + ' ' + tg.name : ''} · En attente des autres…`;
}
$('#btn-pw-none').onclick = () => sendPower('none');

function renderPowerStatus() {
  if (!state || state.phase !== 'powers') return;
  const waiting = state.players.filter(p => p.online && !p.powered).length;
  if ($('#pw-cards').classList.contains('locked')) {
    $('#pw-status').textContent = $('#pw-status').textContent.split(' · ')[0] + (waiting ? ` · Encore ${waiting} joueur${waiting > 1 ? 's' : ''}…` : ' · C\'est parti !');
  }
}

// ───── effets pendant l'écoute ─────
let mosquitoNode = null;
let fxTimers = [], yoyoTimer = null, frozenUntil = 0, crazyKeys = false, rainTimer = null;

function resetEffects() {
  fxTimers.forEach(clearTimeout); fxTimers = [];
  clearInterval(yoyoTimer); yoyoTimer = null;
  frozenUntil = 0;
  document.body.classList.remove('flipped', 'blind');
  crazyKeys = false; clearInterval(rainTimer); rainTimer = null;
  document.body.classList.remove('blackout'); try { audio.muted = false; } catch {}
  if (mosquitoNode) { try { mosquitoNode.stop(); } catch {} mosquitoNode = null; }
  try { speechSynthesis.cancel(); } catch {}
  $('#freeze-layer').classList.add('hidden');
  $('#fx-area').innerHTML = '';
  try { audio.playbackRate = 1; audio.preservesPitch = true; audio.mozPreservesPitch = true; audio.loop = false; audio.volume = baseVolume; } catch {}
}

function at(ms, fn) { fxTimers.push(setTimeout(fn, Math.max(0, ms))); }

function applyEffects(fx) {
  if (!fx) return;
  const area = $('#fx-area');
  const startIn = round.startAt - Date.now();
  const dur = round.duration * 1000;
  if (fx.bonus) {
    const b = fx.bonus;
    area.insertAdjacentHTML('beforeend', `<div class="fx bonus ${b.rarity || ''}">
      ${b.image ? `<div class="fx-img"><img src="${esc(b.image)}" alt=""></div>` : `<span class="em">${b.emoji}</span>`}
      <div><div>${b.emoji} ${esc(b.name)}</div>${b.hint ? `<div class="hint">${esc(b.hint)}</div>` : ''}${b.id === 'double' ? '<div class="hint">×2 sur cet extrait !</div>' : ''}${b.id === 'triple' ? '<div class="hint">×3 sur cet extrait !!</div>' : ''}${b.id === 'jackpot' ? '<div class="hint">🎰 ×4 !!!</div>' : ''}${b.id === 'eclair' ? '<div class="hint">+50 si trouvé en moins de 10 s</div>' : ''}${b.id === 'plume' ? '<div class="hint">✍️ Pose ton clavier…</div>' : ''}${b.id === 'souffleur' ? '<div class="small">🎧 Monte le son, la voix arrive dans 4 s…</div>' : ''}${b.id === 'shield' ? '<div class="hint">Protégé !</div>' : ''}</div></div>`);
    if (b.id === 'early' && round.preview) {
      round.early = true;
      area.lastElementChild.querySelector('div:last-child').insertAdjacentHTML('beforeend', '<div class="hint">Écoute… 🤫</div>');
      at(startIn - 3000, () => { try { audio.currentTime = 0; } catch {} audio.play().then(() => $('#eq').classList.remove('paused')).catch(() => {}); });
    }
    if (b.whisper) at(startIn + 4000, () => whisper(b.whisper));
    if (b.autotype) at(startIn + 2500, () => autoType(b.autotype));
    if (b.autoChoice) at(startIn + 3000, () => { const el = $(`#qcm-answer [data-id="${CSS.escape(b.autoChoice)}"]`); if (el) { el.classList.add('magic'); el.click(); } });
    if (b.remove) at(startIn, () => b.remove.forEach(id => { const el = $(`#qcm-answer [data-id="${CSS.escape(id)}"]`); if (el) el.style.visibility = 'hidden'; }));
  }
  if (fx.sent) toast(fx.sent.blocked ? `🛡️ ${fx.sent.target} avait un bouclier… raté !` : `${fx.sent.emoji} ${fx.sent.name} envoyé à ${fx.sent.target} 😈`);
  for (let m of fx.maluses) {
    if (m.id === 'imposteur' && !m.blocked) {
      if (m.decoy && m.decoy !== 'mock-decoy') {
        // la victime n'est PAS prévenue : elle entend juste une autre chanson 😈
        round.imposteur = true;
        try { audio.src = m.decoy; audio.load(); } catch {}
        continue;
      }
      m = { ...m, id: 'bazar', name: 'Le Grand Bazar (de secours)' };
    }
    if (m.blocked) {
      area.insertAdjacentHTML('beforeend', `<div class="fx blocked"><span class="em">🛡️</span><div>Ton bouclier a bloqué « ${esc(m.name)} » de ${m.fromAvatar} ${esc(m.from)}</div></div>`);
      continue;
    }
    area.insertAdjacentHTML('beforeend', `<div class="fx malus ${m.rarity || ''}"><span class="em">${m.emoji}</span><div>${m.fromAvatar} ${esc(m.from)} t'a envoyé <b>${esc(m.name)}</b> !</div></div>`);
    toast(`${m.emoji} ${m.from} t'a envoyé « ${m.name} » !`, 'error');
    sfx('buzzer', .5);
    const bazar = m.id === 'bazar';
    if (bazar) { sfx('legend'); toast('🎪 LE GRAND BAZAR !!! 🎪', 'error'); }
    if (m.id === 'buzzer' || bazar) {
      const n = 6 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) at(startIn + 600 + Math.random() * (dur - 1500), () => { sfx(randomSfx()); document.querySelector('.stage').classList.add('shake-hard'); setTimeout(() => document.querySelector('.stage').classList.remove('shake-hard'), 400); });
    }
    if (m.id === 'flip') { at(startIn, () => document.body.classList.add('flipped')); at(startIn + 12000, () => document.body.classList.remove('flipped')); }
    if (bazar) at(startIn, () => document.body.classList.add('flipped'));
    if (m.id === 'rain' || bazar) at(startIn, () => { rainTimer = setInterval(emojiDrop, bazar ? 260 : 180); });
    if (m.id === 'crazykeys') at(startIn, () => { crazyKeys = true; });
    if (m.id === 'slowmo') {
      try { audio.preservesPitch = false; audio.mozPreservesPitch = false; audio.loop = true; } catch {}
      at(startIn, () => { try { audio.playbackRate = 0.72; } catch {} });
      at(startIn + 300, () => { try { audio.playbackRate = 0.72; } catch {} });
    }
    if (m.id === 'chipmunk' || bazar) {
      try { audio.preservesPitch = false; audio.mozPreservesPitch = false; audio.loop = true; } catch {}
      at(startIn, () => { try { audio.playbackRate = 1.35; } catch {} });
      // la lecture démarre au même moment que pour les autres : on réapplique la vitesse
      at(startIn + 300, () => { try { audio.playbackRate = 1.35; } catch {} });
    }
    if (m.id === 'freeze') {
      frozenUntil = round.startAt + 7000;
      at(startIn, () => {
        $('#guess').disabled = true; $('#freeze-layer').classList.remove('hidden');
        const iv = setInterval(() => {
          const l = Math.ceil((frozenUntil - Date.now()) / 1000);
          $('#freeze-count').textContent = l > 0 ? l + ' s' : '';
          if (l <= 0) { clearInterval(iv); $('#freeze-layer').classList.add('hidden'); if (!$('#guess').placeholder.startsWith('🎉')) { $('#guess').disabled = false; $('#guess').focus(); } }
        }, 200);
        fxTimers.push(iv);
      });
    }
    if (m.id === 'moustique') at(startIn, () => mosquito(dur));
    if (m.id === 'coupures') {
      for (let i = 0; i < 4; i++) {
        const t0 = startIn + 1500 + Math.random() * (dur - 4000);
        at(t0, () => { audio.muted = true; document.body.classList.add('blackout'); sfx('wrong', .4); });
        at(t0 + 1800 + Math.random() * 900, () => { audio.muted = false; document.body.classList.remove('blackout'); });
      }
    }
    if (m.id === 'scratch') at(startIn + 800, () => {
      const iv = setInterval(() => {
        if (Math.random() < .55) { try { audio.currentTime = Math.max(0, audio.currentTime - (0.8 + Math.random() * 1.6)); } catch {} sfx('scratch'); }
      }, 1300);
      fxTimers.push(iv);
    });
    if (m.id === 'yoyo') at(startIn, () => {
      let up = false;
      yoyoTimer = setInterval(() => { up = !up; audio.volume = up ? baseVolume : Math.min(baseVolume, 0.04 + Math.random() * 0.1); }, 900 + Math.random() * 600);
    });
    if (m.id === 'blind') at(startIn, () => document.body.classList.add('blind'));
  }
}

// ───── Soundboard (sons générés par le navigateur, aucun fichier) ─────
const SFX = ['buzzer', 'horn', 'klaxon', 'quack', 'boing', 'siren', 'wrong'];
const randomSfx = () => SFX[Math.floor(Math.random() * SFX.length)];
function sfx(name, vol = 1) {
  if (!actx) return;
  try { actx.resume(); } catch {}
  const t0 = actx.currentTime, out = actx.createGain();
  out.gain.value = Math.max(0.15, baseVolume) * 0.45 * vol;
  out.connect(actx.destination);
  const osc = (type, f, start, end, gain = 1) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0 + start);
    g.gain.setValueAtTime(0, t0 + start); g.gain.linearRampToValueAtTime(gain, t0 + start + 0.02);
    g.gain.setValueAtTime(gain, t0 + end - 0.05); g.gain.linearRampToValueAtTime(0, t0 + end);
    o.connect(g); g.connect(out); o.start(t0 + start); o.stop(t0 + end + 0.05);
    return o;
  };
  if (name === 'buzzer') { osc('square', 110, 0, .7); osc('sawtooth', 116, 0, .7, .6); }
  if (name === 'wrong') { osc('square', 300, 0, .18); osc('square', 200, .2, .55); }
  if (name === 'horn') { [440, 554, 659].forEach(f => { const o = osc('sawtooth', f, 0, 1.1, .45); o.frequency.linearRampToValueAtTime(f * 1.03, t0 + 1.1); }); }
  if (name === 'klaxon') { [0, .35].forEach(d => { osc('square', 392, d, d + .28, .7); osc('square', 494, d, d + .28, .5); }); }
  if (name === 'quack') {
    [0, .22].forEach(d => {
      const o = osc('sawtooth', 950, d, d + .16, .9); o.frequency.exponentialRampToValueAtTime(420, t0 + d + .16);
    });
  }
  if (name === 'boing') { const o = osc('sine', 140, 0, .6, 1); o.frequency.exponentialRampToValueAtTime(700, t0 + .25); o.frequency.exponentialRampToValueAtTime(160, t0 + .6); }
  if (name === 'siren') { const o = osc('triangle', 650, 0, 1.6, .9); for (let i = 0; i < 4; i++) o.frequency.linearRampToValueAtTime(i % 2 ? 650 : 1250, t0 + .4 * (i + 1)); }
  if (name === 'scratch') {
    const len = actx.sampleRate * .25, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = actx.createBufferSource(), f = actx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.setValueAtTime(3000, t0); f.frequency.exponentialRampToValueAtTime(600, t0 + .25);
    src.buffer = buf; src.connect(f); f.connect(out); src.start(t0);
  }
  if (name === 'legend') { [523, 659, 784, 1047].forEach((f, i) => osc('triangle', f, i * .09, i * .09 + .5, .7)); }
  if (name === 'pop') { const o = osc('sine', 500, 0, .12, .8); o.frequency.exponentialRampToValueAtTime(1100, t0 + .1); }
}


// 💩 Pluie d'emojis
function emojiDrop() {
  const E = ['💩', '🤡', '🦆', '🍌', '🥖', '🐸', '🧀', '🦄', '🍆', '🐔', '🎺', '🌭'];
  const el = document.createElement('div');
  el.className = 'rain-drop';
  el.textContent = E[Math.floor(Math.random() * E.length)];
  el.style.left = (Math.random() * 92) + 'vw';
  el.style.fontSize = (3.5 + Math.random() * 4) + 'rem';
  el.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
  $('#reactions-layer').appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ⌨️ Clavier fou : une lettre sur trois se transforme
$('#guess').addEventListener('input', (e) => {
  if (!crazyKeys || e.inputType !== 'insertText' || Math.random() > 0.35) return;
  const v = $('#guess').value; if (!v) return;
  const L = 'azertyuiopqsdfghjklmwxcvbn';
  $('#guess').value = v.slice(0, -1) + L[Math.floor(Math.random() * L.length)];
});

// 🗣️ Le Souffleur : voix de robot qui chuchote la réponse
function whisper(text) {
  try {
    const u = new SpeechSynthesisUtterance('Psst… la réponse, c\'est… ' + text);
    u.lang = 'fr-FR'; u.rate = 0.85; u.pitch = 1.7; u.volume = 1;
    const v = speechSynthesis.getVoices().find(v => /^fr/i.test(v.lang));
    if (v) u.voice = v;
    audio.volume = Math.min(baseVolume, 0.25); // on baisse la musique pour bien entendre
    u.onend = () => { audio.volume = baseVolume; };
    speechSynthesis.speak(u);
  } catch {
    toast('🗣️ Psst… c\'est « ' + text + ' »');
  }
}


// 🎉 Effet de victoire (pluie d'emojis choisie dans la boutique)
function burst(fxId, n = 16) {
  const fx = SHOP.winFx.find(x => x.id === fxId) || SHOP.winFx[0];
  const em = [...fx.emojis];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'flying';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
    el.style.animationDelay = Math.random() * .5 + 's';
    el.textContent = em[i % em.length];
    $('#reactions-layer').appendChild(el);
    setTimeout(() => el.remove(), 3300);
  }
}


// 🦟 Moustique : bzzzz aigu continu
function mosquito(ms) {
  if (!actx) return;
  try {
    const o = actx.createOscillator(), g = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 1900;
    lfo.frequency.value = 9; lg.gain.value = 140; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.value = Math.max(0.15, baseVolume) * 0.07;
    o.connect(g); g.connect(actx.destination);
    o.start(); lfo.start();
    o.stop(actx.currentTime + ms / 1000); lfo.stop(actx.currentTime + ms / 1000);
    mosquitoNode = { stop: () => { try { o.stop(); lfo.stop(); } catch {} } };
  } catch {}
}

// ✍️ La Plume Magique : la réponse s'écrit toute seule
async function autoType(answers) {
  const input = $('#guess');
  for (const ans of answers) {
    if (!state || state.phase !== 'playing') return;
    input.disabled = false; input.value = ''; input.classList.add('magic');
    for (const ch of ans) {
      if (!state || state.phase !== 'playing') return;
      input.value += ch;
      await new Promise(r => setTimeout(r, 70 + Math.random() * 60));
    }
    await new Promise(r => setTimeout(r, 300));
    $('#guess-form').requestSubmit();
    await new Promise(r => setTimeout(r, 700));
  }
  input.classList.remove('magic');
}
