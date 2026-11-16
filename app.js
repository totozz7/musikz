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
audio.volume = +store.get('mz_vol', 80) / 100;

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
}
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
$('#volume').oninput = (e) => { audio.volume = e.target.value / 100; store.set('mz_vol', e.target.value); };
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
  if (r.phase === 'lobby') { showView('v-lobby'); renderSettings(); stopAudio(); }
  if (r.phase === 'loading') showView('v-loading');
  if (r.phase === 'end' && prevPhase !== 'end') renderEnd();
});

function renderPlayers() {
  const ps = [...state.players].sort((a, b) => b.score - a.score);
  $('#player-count').textContent = ps.filter(p => p.online).length;
  const inGame = ['playing', 'reveal'].includes(state.phase);
  $('#players').innerHTML = ps.map((p, i) => {
    const marks = state.phase === 'playing'
      ? (state.settings.mode === 'qcm' ? (p.answered ? '✅' : '') : `${p.foundArtist ? '🎤' : ''}${p.foundTitle ? '🎵' : ''}`) : '';
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
    if ($('#qcm-answer').classList.contains('locked') || Date.now() < round.startAt) return;
    b.classList.add('picked'); $('#qcm-answer').classList.add('locked');
    socket.emit('choose', b.dataset.id);
  });

  // audio
  stopAudio();
  if (r.preview) { audio.src = r.preview; audio.load(); }
  $('#eq').classList.add('paused');
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
