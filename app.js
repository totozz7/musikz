// MUSIKZ — client
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

const AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🦉', '🐺', '🐲', '🐝', '🦖', '🐨', '🐷'];
const REACTS = ['🔥', '😂', '😱', '👏', '💀', '🎉', '😭', '🤯', '❤️', '🐐'];

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
let myAvatar = store.get('mz_avatar', AVATARS[Math.floor(Math.random() * AVATARS.length)]);

// ───────────── Accueil ─────────────
$('#name').value = store.get('mz_name', '');
function renderAvatars() {
  $('#avatars').innerHTML = AVATARS.map(a => `<button type="button" class="${a === myAvatar ? 'sel' : ''}">${a}</button>`).join('');
  $$('#avatars button').forEach(b => b.onclick = () => { myAvatar = b.textContent; store.set('mz_avatar', myAvatar); renderAvatars(); });
}
renderAvatars();

const urlCode = (location.pathname.match(/^\/r\/([A-Za-z0-9]{5})/) || [])[1] || new URLSearchParams(location.search).get('room');
if (urlCode) { $('#code').value = urlCode.toUpperCase(); $('#btn-join').textContent = 'Rejoindre ' + urlCode.toUpperCase(); }

function identity() {
  const name = $('#name').value.trim();
  if (!name) { $('#home-err').textContent = 'Choisis un pseudo d\'abord 😉'; $('#name').focus(); return null; }
  store.set('mz_name', name);
  unlockAudio();
  return { name, avatar: myAvatar, pid };
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
  if (joinedCode) socket.emit('join', { code: joinedCode, name: store.get('mz_name'), avatar: myAvatar, pid }, (r) => {
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
      <span class="av">${p.avatar}</span>
      <span class="nm">${esc(p.name)}${p.host ? ' 👑' : ''}${p.id === pid ? ' <small>(toi)</small>' : ''}${p.streak >= 3 ? ` <small>🔥 série de ${p.streak}</small>` : ''}</span>
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
        try { audio.currentTime = Math.min(25, Math.max(0, -toStart / 1000)); } catch {}
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
      $('#guess').select();
    }
  });
};

socket.on('found', (f) => {
  addChat({ found: true, text: `${f.avatar} ${f.name} a trouvé ${f.what} !` });
});

// ───────────── Révélation ─────────────
socket.on('reveal', (rv) => {
  clearInterval(tick);
  resetEffects();
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
    return `<li class="${r.gained ? 'win' : ''}">${p.avatar} ${esc(p.name)} ${what} ${r.gained ? `<b>+${r.gained}</b>` : ''}${r.time && r.gained ? ` <span class="muted small">${r.time.toFixed(1)} s</span>` : ''}</li>`;
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
  $('#history').innerHTML = e.history.map(h => `<li><b>${esc(h.title)}</b> — ${esc(h.artist)}</li>`).join('');
});
function renderEnd() {
  stopAudio();
  showView('v-end');
  const ps = [...state.players].sort((a, b) => b.score - a.score);
  const order = [ps[1], ps[0], ps[2]];
  $('#podium').innerHTML = order.map((p, i) => p ? `<div class="step p${[2, 1, 3][i]}">
    <span class="av">${p.avatar}</span><span class="nm">${esc(p.name)}</span><span class="pts">${p.score} pts</span>
    <div class="block">${[2, 1, 3][i]}</div></div>` : '').join('');
  $('#final-list').innerHTML = ps.slice(3).map((p, i) => `<li value="${i + 4}">${p.avatar} ${esc(p.name)} — ${p.score} pts</li>`).join('');
  if (ps[0]?.id === pid) confetti(60); else confetti(20);
}

// ───────────── Chat & réactions ─────────────
function addChat(m) {
  const li = document.createElement('li');
  if (m.sys) { li.className = 'sys'; li.textContent = m.text; }
  else if (m.found) { li.className = 'found'; li.textContent = m.text; }
  else { li.style.setProperty('--c', m.color); li.innerHTML = `${m.avatar} <b>${esc(m.name)}</b> ${esc(m.text)}`; }
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
    <button class="pw-card ${o.type}" data-id="${o.id}">
      <span class="tag">${o.type === 'bonus' ? '🎁 Bonus' : '😈 Malus'}</span>
      <span class="em">${o.emoji}</span><b>${esc(o.name)}</b><small>${esc(o.desc)}</small>
    </button>`).join('');
  $$('#pw-cards .pw-card').forEach(c => c.onclick = () => pickCard(c));
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
    others.map(p => `<button data-t="${p.id}">${p.avatar} ${esc(p.name)}</button>`).join('');
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
let fxTimers = [], yoyoTimer = null, frozenUntil = 0;

function resetEffects() {
  fxTimers.forEach(clearTimeout); fxTimers = [];
  clearInterval(yoyoTimer); yoyoTimer = null;
  frozenUntil = 0;
  document.body.classList.remove('flipped', 'blind');
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
    area.insertAdjacentHTML('beforeend', `<div class="fx bonus">
      ${b.image ? `<div class="fx-img"><img src="${esc(b.image)}" alt=""></div>` : `<span class="em">${b.emoji}</span>`}
      <div><div>${b.emoji} ${esc(b.name)}</div>${b.hint ? `<div class="hint">${esc(b.hint)}</div>` : ''}${b.id === 'double' ? '<div class="hint">×2 sur cet extrait !</div>' : ''}${b.id === 'shield' ? '<div class="hint">Protégé !</div>' : ''}</div></div>`);
    if (b.remove) at(startIn, () => b.remove.forEach(id => { const el = $(`#qcm-answer [data-id="${CSS.escape(id)}"]`); if (el) el.style.visibility = 'hidden'; }));
  }
  if (fx.sent) toast(fx.sent.blocked ? `🛡️ ${fx.sent.target} avait un bouclier… raté !` : `${fx.sent.emoji} ${fx.sent.name} envoyé à ${fx.sent.target} 😈`);
  for (const m of fx.maluses) {
    if (m.blocked) {
      area.insertAdjacentHTML('beforeend', `<div class="fx blocked"><span class="em">🛡️</span><div>Ton bouclier a bloqué « ${esc(m.name)} » de ${m.fromAvatar} ${esc(m.from)}</div></div>`);
      continue;
    }
    area.insertAdjacentHTML('beforeend', `<div class="fx malus"><span class="em">${m.emoji}</span><div>${m.fromAvatar} ${esc(m.from)} t'a envoyé <b>${esc(m.name)}</b> !</div></div>`);
    toast(`${m.emoji} ${m.from} t'a envoyé « ${m.name} » !`, 'error');
    sfx('buzzer', .5);
    if (m.id === 'buzzer') {
      const n = 6 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) at(startIn + 600 + Math.random() * (dur - 1500), () => { sfx(randomSfx()); document.querySelector('.stage').classList.add('shake-hard'); setTimeout(() => document.querySelector('.stage').classList.remove('shake-hard'), 400); });
    }
    if (m.id === 'flip') { at(startIn, () => document.body.classList.add('flipped')); at(startIn + 12000, () => document.body.classList.remove('flipped')); }
    if (m.id === 'chipmunk') {
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
  if (name === 'pop') { const o = osc('sine', 500, 0, .12, .8); o.frequency.exponentialRampToValueAtTime(1100, t0 + .1); }
}
