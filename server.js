// MUSIKZ — serveur de blind test multijoueur (Express + Socket.io + API Deezer)
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const CATEGORIES = require('./categories');
const { checkGuess } = require('./matching');

const PORT = process.env.PORT || 3000;
const MOCK = process.env.MOCK === '1'; // morceaux fictifs pour tester sans Deezer
const DZ = 'https://api.deezer.com';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Les fichiers du site peuvent être dans /public ou directement à la racine (upload GitHub "à plat")
const PUB = fs.existsSync(path.join(__dirname, 'public', 'index.html')) ? path.join(__dirname, 'public') : __dirname;
const INDEX = path.join(PUB, 'index.html');
for (const f of ['app.js', 'style.css']) app.get('/' + f, (req, res) => res.sendFile(path.join(PUB, f)));
app.get('/', (req, res) => res.sendFile(INDEX));
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES.map(({ id, name, emoji, group, star }) => ({ id, name, emoji, group, star: !!star })));
});
// Lien d'invitation : /r/CODE renvoie la même page, le client lit le code dans l'URL
app.get('/r/:code', (req, res) => res.sendFile(INDEX));
app.get('/health', (req, res) => res.send('ok'));

// ───────────────────────── Deezer ─────────────────────────
async function dz(url) {
  const r = await fetch(url.startsWith('http') ? url : DZ + url, { headers: { 'Accept-Language': 'fr' } });
  if (!r.ok) throw new Error('Deezer HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error('Deezer: ' + (j.error.message || 'erreur'));
  return j;
}
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function slimTrack(t, catId) {
  return {
    id: t.id,
    title: t.title_short || t.title,
    fullTitle: t.title,
    artist: t.artist?.name || '?',
    cover: t.album?.cover_big || t.album?.cover_medium || '',
    album: t.album?.title || '',
    preview: t.preview || '',
    cat: catId,
  };
}

const poolCache = new Map(); // catId -> { at, tracks }
const CACHE_MS = 6 * 3600 * 1000;

async function playlistTracks(pid) {
  const j = await dz(`/playlist/${pid}/tracks?limit=300`);
  return j.data || [];
}

async function categoryPool(cat) {
  const c = poolCache.get(cat.id);
  if (c && Date.now() - c.at < CACHE_MS) return c.tracks;
  let raw = [];
  if (cat.chart) {
    try { raw.push(...((await dz('/chart/0/tracks?limit=100')).data || [])); } catch (e) { console.warn(e.message); }
  }
  for (const q of cat.queries) {
    try {
      const pls = (await dz(`/search/playlist?q=${encodeURIComponent(q)}&limit=8`)).data || [];
      // on prend les 2 playlists les plus pertinentes + 1 au hasard pour varier
      const picks = [...pls.slice(0, 2), ...shuffle(pls.slice(2)).slice(0, 1)];
      for (const p of picks) {
        try { raw.push(...(await playlistTracks(p.id))); } catch (e) { console.warn(e.message); }
      }
    } catch (e) { console.warn('search', q, e.message); }
  }
  if (raw.length < 20) { // repli : recherche directe de morceaux
    for (const q of cat.queries) {
      try { raw.push(...((await dz(`/search?q=${encodeURIComponent(q)}&limit=50`)).data || [])); } catch (e) {}
    }
  }
  const seen = new Set();
  const tracks = [];
  for (const t of raw) {
    if (!t || !t.preview || t.readable === false || seen.has(t.id)) continue;
    const key = (t.artist?.name + '|' + (t.title_short || t.title)).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(t.id); seen.add(key);
    tracks.push(slimTrack(t, cat.id));
  }
  poolCache.set(cat.id, { at: Date.now(), tracks });
  return tracks;
}

async function resolvePlaylistLink(link) {
  link = String(link || '').trim();
  let m = link.match(/^\d+$/);
  if (m) return link;
  if (/link\.deezer\.com|deezer\.page\.link/.test(link)) {
    const r = await fetch(link, { redirect: 'follow' });
    link = r.url;
  }
  m = link.match(/playlist\/(\d+)/);
  if (m) return m[1];
  throw new Error('Lien de playlist Deezer invalide');
}

async function customPool(link) {
  const pid = await resolvePlaylistLink(link);
  const info = await dz(`/playlist/${pid}`);
  const tracks = (await playlistTracks(pid)).filter(t => t.preview).map(t => slimTrack(t, 'perso'));
  return { title: info.title, tracks };
}

// Les liens d'extraits Deezer expirent : on rafraîchit juste avant de jouer.
async function freshPreview(track) {
  if (MOCK) return track.preview;
  try { const t = await dz(`/track/${track.id}`); return t.preview || track.preview; } catch { return track.preview; }
}

function mockPool(cat) {
  const artists = ['Dorothée', 'Jean-Jacques Goldman', 'Daft Punk', 'Céline Dion', 'Stromae', 'Indochine', 'IAM', 'Queen', 'ABBA', 'Michael Jackson', 'Angèle', 'Noir Désir'];
  return Array.from({ length: 30 }, (_, i) => ({
    id: cat.id + i, title: `${cat.name} chanson ${i + 1}`, fullTitle: `${cat.name} chanson ${i + 1}`,
    artist: artists[i % artists.length], cover: '', album: 'Album test', preview: '', cat: cat.id,
  }));
}

// ───────────────────────── Salons ─────────────────────────
const rooms = new Map();
const AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🦉', '🐺', '🐲', '🐝', '🦖', '🐨', '🐷'];
const COLORS = ['#ff2e4d', '#ffc21a', '#ff7a1a', '#ff4fa3', '#30d5c8', '#7c5cff', '#4cd964', '#2fa9ff'];
const MAX_PLAYERS = 12;

function makeCode() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c;
  do { c = Array.from({ length: 5 }, () => L[Math.floor(Math.random() * L.length)]).join(''); } while (rooms.has(c));
  return c;
}

function defaultSettings() {
  return {
    categories: ['da-fr'],
    mode: 'text',          // 'text' (saisie libre) | 'qcm'
    rounds: 15,
    duration: 25,          // secondes d'écoute par extrait
    speedBonus: true,      // plus de points si rapide
    comboBonus: true,      // bonus artiste + titre
    firstBonus: true,      // bonus au premier qui trouve
    answer: 'both',        // 'both' | 'title' | 'artist' : quoi deviner
    customLink: '',
    customTitle: '',
  };
}

function publicPlayers(room) {
  return [...room.players.values()].map(p => ({
    id: p.id, name: p.name, avatar: p.avatar, color: p.color, score: p.score,
    online: p.online, host: p.id === room.hostId,
    foundArtist: !!room.round?.found.get(p.id)?.artist,
    foundTitle: !!room.round?.found.get(p.id)?.title,
    answered: !!room.round?.found.get(p.id)?.answered,
    streak: p.streak || 0,
  }));
}

function roomState(room) {
  return {
    code: room.code, phase: room.phase, settings: room.settings,
    players: publicPlayers(room), hostId: room.hostId,
    roundIndex: room.roundIndex, totalRounds: room.queue?.length || room.settings.rounds,
  };
}
const broadcast = (room) => io.to(room.code).emit('room', roomState(room));

function sysMsg(room, text) {
  const m = { id: Date.now() + Math.random(), sys: true, text, at: Date.now() };
  room.chat.push(m); room.chat = room.chat.slice(-100);
  io.to(room.code).emit('chat', m);
}

async function startGame(room) {
  const s = room.settings;
  room.phase = 'loading'; broadcast(room);
  try {
    let pool = [];
    if (s.customLink) {
      if (MOCK) pool.push(...mockPool({ id: 'perso', name: 'Perso' }));
      else { const c = await customPool(s.customLink); s.customTitle = c.title; pool.push(...c.tracks); }
    }
    const cats = CATEGORIES.filter(c => s.categories.includes(c.id));
    const pools = await Promise.all(cats.map(c => MOCK ? mockPool(c) : categoryPool(c)));
    // répartition équilibrée entre catégories
    const lists = [...pools.map(p => shuffle([...p])), ...(pool.length ? [shuffle(pool)] : [])].filter(l => l.length);
    if (!lists.length) throw new Error('Aucun extrait trouvé pour ces catégories');
    const queue = []; const seen = new Set(); let k = 0;
    while (queue.length < s.rounds && lists.some(l => l.length)) {
      const l = lists[k++ % lists.length]; const t = l.pop();
      if (t && !seen.has(t.id)) { seen.add(t.id); queue.push(t); }
    }
    room.queue = queue;
    room.allTracks = lists.flat().concat(queue); // pour les propositions du QCM
    room.distractorPool = pools.flat().concat(pool);
    for (const p of room.players.values()) { p.score = 0; p.streak = 0; }
    room.history = [];
    room.roundIndex = -1;
    sysMsg(room, `🎶 C'est parti ! ${queue.length} extraits à deviner.`);
    nextRound(room);
  } catch (e) {
    console.error(e);
    room.phase = 'lobby'; broadcast(room);
    io.to(room.code).emit('toast', { type: 'error', text: 'Impossible de charger la musique : ' + e.message });
  }
}

function makeChoices(room, track) {
  const opts = [track];
  const usedArtists = new Set([track.artist.toLowerCase()]);
  const pool = shuffle([...(room.distractorPool || [])]);
  // privilégie la même catégorie pour que ce soit crédible
  pool.sort((a, b) => (b.cat === track.cat) - (a.cat === track.cat));
  for (const t of pool) {
    if (opts.length >= 4) break;
    if (usedArtists.has(t.artist.toLowerCase()) || t.id === track.id) continue;
    usedArtists.add(t.artist.toLowerCase()); opts.push(t);
  }
  return shuffle(opts.map(t => ({ id: String(t.id), title: t.title, artist: t.artist })));
}

async function nextRound(room) {
  clearTimeout(room.timer);
  room.roundIndex++;
  if (room.roundIndex >= room.queue.length) return endGame(room);
  const track = room.queue[room.roundIndex];
  const preview = await freshPreview(track);
  const s = room.settings;
  const startAt = Date.now() + 3500; // compte à rebours 3 s, le temps de charger l'audio
  room.round = {
    track, startAt, endAt: startAt + s.duration * 1000,
    found: new Map(), firstArtist: null, firstTitle: null, firstAnswer: null,
    choices: s.mode === 'qcm' ? makeChoices(room, track) : null,
  };
  room.phase = 'playing';
  broadcast(room);
  io.to(room.code).emit('round', {
    index: room.roundIndex, total: room.queue.length, preview,
    startIn: startAt - Date.now(), duration: s.duration, choices: room.round.choices,
    mode: s.mode, answer: s.answer, cat: track.cat,
  });
  room.timer = setTimeout(() => revealRound(room), room.round.endAt - Date.now() + 300);
}

function pointsFor(room, now) {
  const s = room.settings; const r = room.round;
  const remaining = Math.max(0, Math.min(1, (r.endAt - now) / (s.duration * 1000)));
  return s.speedBonus ? Math.round(50 + 50 * remaining) : 100;
}

function needed(room) { return room.settings.answer === 'both' ? ['artist', 'title'] : [room.settings.answer]; }

function allDone(room) {
  const online = [...room.players.values()].filter(p => p.online);
  return online.length > 0 && online.every(p => {
    const f = room.round.found.get(p.id) || {};
    if (room.settings.mode === 'qcm') return f.answered;
    return needed(room).every(k => f[k]);
  });
}

function revealRound(room) {
  if (room.phase !== 'playing') return;
  clearTimeout(room.timer);
  room.phase = 'reveal';
  const r = room.round; const t = r.track;
  const results = [...room.players.values()].map(p => {
    const f = r.found.get(p.id) || {};
    const ok = room.settings.mode === 'qcm' ? f.correct : needed(room).some(k => f[k]);
    if (ok) p.streak = (p.streak || 0) + 1; else p.streak = 0;
    return { id: p.id, gained: f.points || 0, artist: !!f.artist, title: !!f.title, correct: !!f.correct, time: f.time || null };
  });
  room.history.push({ title: t.title, artist: t.artist, cover: t.cover });
  broadcast(room);
  io.to(room.code).emit('reveal', {
    track: { title: t.fullTitle || t.title, artist: t.artist, cover: t.cover, album: t.album, link: `https://www.deezer.com/track/${t.id}` },
    results, index: room.roundIndex, total: room.queue.length,
  });
  room.timer = setTimeout(() => nextRound(room), 7000);
}

function endGame(room) {
  clearTimeout(room.timer);
  room.phase = 'end';
  broadcast(room);
  io.to(room.code).emit('end', { history: room.history });
  const top = [...room.players.values()].sort((a, b) => b.score - a.score)[0];
  if (top) sysMsg(room, `🏆 ${top.name} remporte la partie avec ${top.score} points !`);
}

// ───────────────────────── Sockets ─────────────────────────
io.on('connection', (socket) => {
  let room = null; let me = null;

  socket.on('create', ({ name, avatar, pid }, cb) => {
    const code = makeCode();
    room = { code, players: new Map(), hostId: pid, phase: 'lobby', settings: defaultSettings(), chat: [], history: [] };
    rooms.set(code, room);
    join(room, { name, avatar, pid }, cb);
  });

  socket.on('join', ({ code, name, avatar, pid }, cb) => {
    const r = rooms.get(String(code || '').toUpperCase().trim());
    if (!r) return cb?.({ error: 'Salon introuvable. Vérifie le code !' });
    if (!r.players.has(pid) && r.players.size >= MAX_PLAYERS) return cb?.({ error: 'Salon complet (12 joueurs max).' });
    room = r; join(r, { name, avatar, pid }, cb);
  });

  function join(r, { name, avatar, pid }, cb) {
    name = String(name || 'Joueur').trim().slice(0, 18) || 'Joueur';
    let p = r.players.get(pid);
    if (p) { p.online = true; p.name = name; p.avatar = avatar || p.avatar; p.socketId = socket.id; }
    else {
      const usedColors = [...r.players.values()].map(x => x.color);
      p = { id: pid, name, avatar: avatar || AVATARS[r.players.size % AVATARS.length], color: COLORS.find(c => !usedColors.includes(c)) || COLORS[r.players.size % COLORS.length], score: 0, streak: 0, online: true, socketId: socket.id };
      r.players.set(pid, p);
      sysMsg(r, `👋 ${name} a rejoint le salon`);
    }
    if (!r.players.get(r.hostId)?.online) r.hostId = pid;
    me = p;
    socket.join(r.code);
    cb?.({ ok: true, code: r.code, chat: r.chat });
    broadcast(r);
    // rattrapage si on rejoint en pleine manche
    if (r.phase === 'playing' && r.round) {
      socket.emit('round', { index: r.roundIndex, total: r.queue.length, preview: r.round.track.preview, startIn: r.round.startAt - Date.now(), duration: r.settings.duration, choices: r.round.choices, mode: r.settings.mode, answer: r.settings.answer, cat: r.round.track.cat, late: true });
    }
  }

  const isHost = () => room && me && room.hostId === me.id;

  socket.on('settings', (patch) => {
    if (!isHost() || room.phase !== 'lobby') return;
    const s = room.settings;
    if (Array.isArray(patch.categories)) s.categories = patch.categories.filter(id => CATEGORIES.some(c => c.id === id)).slice(0, 40);
    if (['text', 'qcm'].includes(patch.mode)) s.mode = patch.mode;
    if (['both', 'title', 'artist'].includes(patch.answer)) s.answer = patch.answer;
    if ([5, 10, 15, 20, 30, 50].includes(+patch.rounds)) s.rounds = +patch.rounds;
    if ([10, 15, 20, 25, 30].includes(+patch.duration)) s.duration = +patch.duration;
    for (const k of ['speedBonus', 'comboBonus', 'firstBonus']) if (typeof patch[k] === 'boolean') s[k] = patch[k];
    if (typeof patch.customLink === 'string') { s.customLink = patch.customLink.slice(0, 300); s.customTitle = ''; }
    broadcast(room);
  });

  socket.on('checkPlaylist', async (link, cb) => {
    if (MOCK) return cb?.({ ok: true, title: 'Playlist test', count: 30 });
    try { const c = await customPool(link); cb?.({ ok: true, title: c.title, count: c.tracks.length }); }
    catch (e) { cb?.({ error: e.message }); }
  });

  socket.on('start', () => {
    if (!isHost() || !['lobby', 'end'].includes(room.phase)) return;
    if (!room.settings.categories.length && !room.settings.customLink) return socket.emit('toast', { type: 'error', text: 'Choisis au moins une catégorie !' });
    startGame(room);
  });

  socket.on('skip', () => { if (isHost() && room.phase === 'playing') revealRound(room); });
  socket.on('stop', () => { if (isHost() && room.phase !== 'lobby') { clearTimeout(room.timer); room.phase = 'lobby'; broadcast(room); sysMsg(room, '⏹️ Partie arrêtée par l\'hôte'); } });
  socket.on('backToLobby', () => { if (isHost() && room.phase === 'end') { room.phase = 'lobby'; broadcast(room); } });
  socket.on('kick', (pid) => {
    if (!isHost() || pid === me.id) return;
    const p = room.players.get(pid); if (!p) return;
    room.players.delete(pid);
    io.to(p.socketId).emit('kicked');
    sysMsg(room, `🚪 ${p.name} a été exclu`); broadcast(room);
  });

  socket.on('guess', (text, cb) => {
    if (!room || room.phase !== 'playing' || !me) return;
    const r = room.round; const now = Date.now();
    if (now < r.startAt - 200 || now > r.endAt + 500 || room.settings.mode !== 'text') return;
    const f = r.found.get(me.id) || { points: 0 };
    const res = checkGuess(text, r.track);
    const s = room.settings; const gained = [];
    for (const k of needed(room)) {
      if (res[k] && !f[k]) {
        f[k] = true; f.time = (now - r.startAt) / 1000;
        let pts = pointsFor(room, now);
        const fk = k === 'artist' ? 'firstArtist' : 'firstTitle';
        if (s.firstBonus && !r[fk]) { r[fk] = me.id; pts += 20; gained.push({ type: 'first', k }); }
        f.points += pts; me.score += pts; gained.push({ type: k, pts });
        if (s.comboBonus && s.answer === 'both' && f.artist && f.title) { f.points += 50; me.score += 50; gained.push({ type: 'combo', pts: 50 }); }
      }
    }
    r.found.set(me.id, f);
    cb?.({ artist: !!f.artist, title: !!f.title, gained, close: !gained.length && res.close });
    if (gained.length) {
      const what = gained.filter(g => g.type === 'artist' || g.type === 'title').map(g => g.type === 'artist' ? 'l\'artiste' : 'le titre').join(' et ');
      io.to(room.code).emit('found', { id: me.id, name: me.name, avatar: me.avatar, what });
      broadcast(room);
      if (allDone(room)) setTimeout(() => revealRound(room), 600);
    }
  });

  socket.on('choose', (choiceId, cb) => {
    if (!room || room.phase !== 'playing' || !me || room.settings.mode !== 'qcm') return;
    const r = room.round; const now = Date.now();
    if (now < r.startAt - 200 || now > r.endAt + 500) return;
    const f = r.found.get(me.id) || { points: 0 };
    if (f.answered) return;
    f.answered = true; f.time = (now - r.startAt) / 1000;
    f.correct = String(choiceId) === String(r.track.id);
    if (f.correct) {
      let pts = pointsFor(room, now);
      if (room.settings.firstBonus && !r.firstAnswer) { r.firstAnswer = me.id; pts += 20; }
      f.points = pts; me.score += pts; f.artist = f.title = true;
    }
    r.found.set(me.id, f);
    cb?.({ ok: true });
    broadcast(room);
    if (allDone(room)) setTimeout(() => revealRound(room), 600);
  });

  socket.on('chat', (text) => {
    if (!room || !me) return;
    text = String(text || '').trim().slice(0, 200); if (!text) return;
    // pendant une manche en saisie libre, on évite qu'une bonne réponse fuite dans le chat
    if (room.phase === 'playing' && room.settings.mode === 'text') {
      const res = checkGuess(text, room.round.track);
      if (res.artist || res.title) return socket.emit('toast', { type: 'warn', text: '🤫 Pas de réponse dans le chat ! Tape-la dans le champ de réponse.' });
    }
    const m = { id: Date.now() + Math.random(), from: me.id, name: me.name, avatar: me.avatar, color: me.color, text, at: Date.now() };
    room.chat.push(m); room.chat = room.chat.slice(-100);
    io.to(room.code).emit('chat', m);
  });

  socket.on('react', (emoji) => {
    if (!room || !me) return;
    const allowed = ['🔥', '😂', '😱', '👏', '💀', '🎉', '😭', '🤯', '❤️', '🐐'];
    if (!allowed.includes(emoji)) return;
    const n = Date.now(); if (me.lastReact && n - me.lastReact < 250) return; me.lastReact = n;
    io.to(room.code).emit('react', { emoji, avatar: me.avatar, name: me.name });
  });

  socket.on('disconnect', () => {
    if (!room || !me) return;
    me.online = false;
    if (room.hostId === me.id) {
      const next = [...room.players.values()].find(p => p.online);
      if (next) { room.hostId = next.id; sysMsg(room, `👑 ${next.name} devient l'hôte`); }
    }
    broadcast(room);
    if (room.phase === 'playing' && allDone(room)) revealRound(room);
    // nettoyage des salons vides après 30 min
    const r = room;
    setTimeout(() => {
      if ([...r.players.values()].every(p => !p.online)) { clearTimeout(r.timer); rooms.delete(r.code); }
    }, 30 * 60 * 1000);
  });
});

server.listen(PORT, () => console.log(`🎵 Musikz en ligne sur http://localhost:${PORT}${MOCK ? ' (mode test)' : ''}`));
