// MUSIKZ — serveur de blind test multijoueur (Express + Socket.io + Deezer, import Spotify)
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const CATEGORIES = require('./categories');
const { checkGuess, norm, match } = require('./matching');

const PORT = process.env.PORT || 3000;
const MOCK = process.env.MOCK === '1'; // faux morceaux pour tester sans réseau
const DZ = 'https://api.deezer.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Les fichiers du site peuvent être dans /public ou directement à la racine (upload GitHub "à plat")
const PUB = fs.existsSync(path.join(__dirname, 'public', 'index.html')) ? path.join(__dirname, 'public') : __dirname;
const INDEX = path.join(PUB, 'index.html');
for (const f of ['app.js', 'style.css']) app.get('/' + f, (req, res) => res.sendFile(path.join(PUB, f)));
app.get('/', (req, res) => res.sendFile(INDEX));
app.get('/r/:code', (req, res) => res.sendFile(INDEX));
app.get('/health', (req, res) => res.send('ok'));
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES.map(({ id, name, emoji, group, star, kind, label, list }) =>
    ({ id, name, emoji, group, star: !!star, work: kind === 'work', label: label || '', count: list.length || null })));
});

// ───────────────────────── utilitaires ─────────────────────────
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// File d'attente pour ne pas dépasser la limite de Deezer (50 requêtes / 5 s)
let dzActive = 0; const dzWaiting = []; const dzStamps = [];
async function dzSlot() {
  while (true) {
    const now = Date.now();
    while (dzStamps.length && now - dzStamps[0] > 5000) dzStamps.shift();
    if (dzActive < 8 && dzStamps.length < 45) { dzActive++; dzStamps.push(now); return; }
    await new Promise(r => { dzWaiting.push(r); setTimeout(r, 120); });
  }
}
function dzRelease() { dzActive--; const n = dzWaiting.shift(); if (n) n(); }

async function dz(url) {
  await dzSlot();
  try {
    const r = await fetch(url.startsWith('http') ? url : DZ + url, { headers: { 'Accept-Language': 'fr-FR,fr' } });
    if (!r.ok) throw new Error('Deezer HTTP ' + r.status);
    const j = await r.json();
    if (j.error) {
      if (j.error.code === 4) { await sleep(1500); return dz(url); } // quota dépassé : on réessaie
      throw new Error('Deezer : ' + (j.error.message || 'erreur'));
    }
    return j;
  } finally { dzRelease(); }
}

function fromDeezer(t, extra = {}) {
  return {
    id: t.id,
    title: t.title_short || t.title, fullTitle: t.title,
    artist: t.artist?.name || '?',
    dzTitle: t.title, dzArtist: t.artist?.name || '',
    cover: t.album?.cover_big || t.album?.cover_medium || '',
    preview: t.preview || '',
    ...extra,
  };
}

// ───────────────────────── résolution des morceaux ─────────────────────────
// Un "item" (ligne d'une catégorie ou morceau Spotify) est transformé en extrait Deezer jouable.
const resolved = new Map(); // key -> { at, track|null }

function artistOk(dzArtist, wanted) {
  const a = norm(dzArtist), w = norm(wanted);
  if (!a || !w) return false;
  if (a.includes(w) || w.includes(a)) return true;
  const first = norm(String(wanted).split(/,|&| feat| x /i)[0]);
  if (first && (a.includes(first) || first.includes(a))) return true;
  return match(dzArtist, wanted) === 'ok';
}
function titleOk(dzTitle, wanted) {
  const a = norm(dzTitle), w = norm(wanted);
  return !!a && !!w && (a.includes(w) || w.includes(a) || match(dzTitle, wanted) === 'ok');
}
// ── Filtre anti-reprises : on ne veut QUE les versions originales ──
// Mots qui trahissent une reprise / version alternative (dans le titre ou le nom de l'artiste).
// Un mot est ignoré s'il fait partie de la réponse attendue (ex. « Live Is Life », « Piano Man »).
const COVER_WORDS = [
  'karaoke', 'karaoké', 'in the style of', 'made famous', 'as made famous', 'originally performed', 'tribute', 'hommage',
  'cover', 'covers', 'reprise', 'piano', 'guitar', 'guitare', 'acoustic', 'acoustique', 'unplugged', 'instrumental',
  '8 bit', '8bit', 'chiptune', 'lullaby', 'lullabies', 'berceuse', 'music box', 'boite a musique', 'orchestral version',
  'epic version', 'epic', 'lofi', 'lo fi', 'chill version', 'sped up', 'slowed', 'nightcore', 'remix', 'rmx', 'medley',
  'mashup', 'live', 'en direct', 'en concert', 'unplugged', 're recorded', 'rerecorded', 'ringtone', 'sonnerie',
  'for kids', 'pour enfants', 'kids', 'enfants', 'cello', 'violin', 'violon', 'string quartet', 'strings', 'ukulele',
  'harp', 'harpe', 'flute', 'jazz version', 'bossa', 'reggae version', 'parody', 'parodie', 'performed by', 'versión',
  'sound alike', 'soundalike', 'workout', 'fitness', 'cardio', 'party mix', 'dj mix', 'extended mix', 'club mix',
  'radio version', 'demo', 'rehearsal', 'theme songs', 'tv themes', 'tv theme', 'players', 'orchestre de', 'cinematic',
  // « usines à reprises » bien connues sur les plateformes
  'city of prague', 'hollywood studio', 'sounds unlimited', 'wonder band', 'hit crew', 'studio all stars', 'all stars',
  'kidz bop', 'vitamin string', 'piano guys', 'brooklyn duo', 'anime kei', 'the soundtrack orchestra', 'starlite',
  'party hits', 'hits all stars', 'chorus', 'versions', 'interpretation',
];
const COVER_RE = new RegExp('(?:^| )(' + COVER_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?= |$)', 'g');
const flat = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

function isCoverish(t, wanted, strict = true) {
  if (!strict) return /karaok/i.test(t.title + ' ' + (t.artist?.name || ''));
  const want = ' ' + flat(wanted) + ' ';
  const hay = flat(`${t.title} ${t.artist?.name || ''}`);
  for (const m of hay.matchAll(COVER_RE)) if (!want.includes(' ' + m[1] + ' ')) return true;
  // l'album aussi, mais seulement pour les mots les plus parlants
  const alb = flat(t.album?.title || '');
  return /(^| )(karaoke|tribute|cover|covers|piano|lullab|berceuse|music box|8 bit|instrumental)( |$)/.test(alb) && !/(^| )(piano|instrumental)( |$)/.test(want);
}
const banned = new Set(); // ids Deezer signalés « mauvaise version » par un hôte
const playable = (t) => t && t.preview && t.readable !== false && !banned.has(t.id);
const byRank = (a, b) => (b.rank || 0) - (a.rank || 0);

async function resolveItem(item) {
  const c = resolved.get(item.key);
  if (c && (c.track || Date.now() - c.at < 3600e3)) return c.track;
  let track = null;
  try {
    track = MOCK ? mockResolve(item) : item.work ? await resolveWork(item) : await resolveSong(item);
  } catch (e) { console.warn('résolution', item.key, e.message); }
  resolved.set(item.key, { at: Date.now(), track });
  return track;
}

async function resolveSong(item) {
  const strict = !item.allowCovers;
  const wanted = `${item.artist} ${item.title}`;
  const firstArtist = String(item.artist).split(/,| feat\.? | & /i)[0].trim();
  const searches = [];
  if (item.q) searches.push(item.q);
  searches.push(`artist:"${firstArtist}" track:"${item.title.replace(/"/g, '')}"`);
  searches.push(`${firstArtist} ${item.title}`);
  for (const q of searches) {
    const data = (await dz(`/search?q=${encodeURIComponent(q)}&limit=25`)).data || [];
    const ok = data.filter(t => playable(t) && !isCoverish(t, wanted, strict));
    // 1) bon artiste + titre identique, 2) bon artiste + titre proche — à chaque fois la version la plus écoutée
    const exact = ok.filter(t => artistOk(t.artist?.name, item.artist) && flat(t.title_short || t.title) === flat(item.title)).sort(byRank);
    const close = ok.filter(t => artistOk(t.artist?.name, item.artist) && (titleOk(t.title, item.title) || titleOk(t.title_short || t.title, item.title.split('(')[0]))).sort(byRank);
    const best = exact[0] || close[0] || (item.q && q === item.q ? bestByWords(ok, item.q) : null);
    if (best) return fromDeezer(best, { title: item.title, artist: item.artist, cat: item.cat, note: item.note, key: item.key });
  }
  return null;
}

// Résultat le plus proche d'une recherche libre (nombre de mots en commun, puis popularité)
function bestByWords(list, q) {
  const words = flat(q).split(' ').filter(w => w.length >= 3 && !['generique', 'theme', 'main', 'title', 'the', 'and', 'les', 'des'].includes(w));
  if (!words.length) return list.sort(byRank)[0] || null;
  const score = (t) => {
    const hay = ' ' + flat(`${t.title} ${t.artist?.name} ${t.album?.title}`) + ' ';
    return words.reduce((s, w) => s + (hay.includes(' ' + w) ? 1 : 0), 0);
  };
  let best = null, bs = -1;
  for (const t of list) {
    const sc = score(t);
    if (sc > bs || (sc === bs && (t.rank || 0) > (best.rank || 0))) { best = t; bs = sc; }
  }
  return bs >= Math.min(2, words.length) ? best : null; // trop éloigné : on préfère sauter
}

async function resolveWork(item) {
  const data = (await dz(`/search?q=${encodeURIComponent(item.q)}&limit=25`)).data || [];
  const wanted = item.q + ' ' + item.work + ' ' + (item.alts || []).join(' ');
  const ok = data.filter(t => playable(t) && !isCoverish(t, wanted, !item.allowCovers));
  const best = bestByWords(ok, item.q);
  if (!best) return null;
  return fromDeezer(best, { title: item.work, alts: item.alts, artist: '', work: true, cat: item.cat, note: item.note, key: item.key });
}

function mockResolve(item) {
  if (/introuvable/.test(item.key)) return null;
  return {
    id: 'mock-' + Buffer.from(item.key).toString('base64').slice(0, 16), preview: '', cover: '', cat: item.cat,
    title: item.work || item.title, alts: item.alts, artist: item.work ? '' : item.artist, work: !!item.work,
    dzTitle: item.work ? 'Générique' : item.title, dzArtist: item.work ? 'Interprète' : item.artist, note: item.note, key: item.key,
  };
}

// Les liens d'extraits Deezer expirent : on rafraîchit juste avant de jouer.
async function freshPreview(track) {
  if (MOCK || !track.id) return track.preview;
  try { const t = await dz(`/track/${track.id}`); return t.preview || track.preview; } catch { return track.preview; }
}

// ───────────────────────── catégories Deezer "live" (hits) ─────────────────────────
const liveCache = new Map();
async function liveTracks(cat) {
  const c = liveCache.get(cat.id);
  if (c && Date.now() - c.at < 6 * 3600e3) return c.tracks;
  let raw = [];
  if (MOCK) raw = [];
  else {
    if (cat.deezerPlaylist) {
      try {
        const info = await dz(`/playlist/${cat.deezerPlaylist}`);
        if (/top|hits/i.test(info.title || '')) raw = (await dz(`/playlist/${cat.deezerPlaylist}/tracks?limit=100`)).data || [];
      } catch (e) { console.warn(e.message); }
    }
    if (raw.length < 20 && cat.chartFallback) { try { raw = (await dz('/chart/0/tracks?limit=100')).data || []; } catch (e) { console.warn(e.message); } }
  }
  const tracks = raw.filter(t => t.preview).map(t => fromDeezer(t, { cat: cat.id }));
  if (MOCK) for (let i = 0; i < 20; i++) tracks.push({ id: 'hit' + i, title: 'Hit ' + (i + 1), artist: 'Star ' + (i + 1), preview: '', cover: '', cat: cat.id });
  liveCache.set(cat.id, { at: Date.now(), tracks });
  return tracks;
}

// ───────────────────────── playlists perso (Deezer / Spotify) ─────────────────────────
async function followRedirect(link) {
  const r = await fetch(link, { redirect: 'follow', headers: { 'User-Agent': UA } });
  return r.url;
}

async function deezerCustom(link) {
  if (/link\.deezer\.com|deezer\.page\.link/.test(link)) link = await followRedirect(link);
  const m = link.match(/(playlist|album)\/(\d+)/);
  if (!m) throw new Error('Lien Deezer non reconnu (il faut une playlist ou un album)');
  const info = await dz(`/${m[1]}/${m[2]}`);
  let raw = [];
  if (m[1] === 'playlist') raw = (await dz(`/playlist/${m[2]}/tracks?limit=300`)).data || [];
  else raw = (info.tracks?.data || []).map(t => ({ ...t, album: { cover_big: info.cover_big } }));
  return { source: 'Deezer', title: info.title, tracks: raw.filter(t => t.preview).map(t => fromDeezer(t, { cat: 'perso' })), items: [] };
}

let spotifyToken = null;
async function spotifyApiToken() {
  const id = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (spotifyToken && spotifyToken.exp > Date.now()) return spotifyToken.value;
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64') },
    body: 'grant_type=client_credentials',
  });
  const j = await r.json();
  if (!j.access_token) return null;
  spotifyToken = { value: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 };
  return spotifyToken.value;
}

function findKey(obj, key, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 12) return undefined;
  if (key in obj) return obj[key];
  for (const v of Object.values(obj)) { const f = findKey(v, key, depth + 1); if (f !== undefined) return f; }
  return undefined;
}

async function spotifyCustom(link) {
  if (/spotify\.link|spoti\.fi|spotify\.app\.link/.test(link)) link = await followRedirect(link);
  const m = link.match(/(playlist|album)[/:]([A-Za-z0-9]{22})/);
  if (!m) throw new Error('Lien Spotify non reconnu (il faut une playlist ou un album)');
  const [, type, id] = m;
  let title = 'Playlist Spotify', songs = [];

  // 1) API officielle si des identifiants sont configurés sur Render (facultatif)
  const token = await spotifyApiToken().catch(() => null);
  if (token) {
    try {
      const h = { Authorization: 'Bearer ' + token };
      const info = await (await fetch(`https://api.spotify.com/v1/${type}s/${id}?fields=name`, { headers: h })).json();
      if (info.name) title = info.name;
      let url = type === 'playlist' ? `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100` : `https://api.spotify.com/v1/albums/${id}/tracks?limit=50`;
      while (url && songs.length < 300) {
        const j = await (await fetch(url, { headers: h })).json();
        for (const it of j.items || []) {
          const t = it.track || it;
          if (t?.name) songs.push({ title: t.name, artist: (t.artists || []).map(a => a.name).join(', ') });
        }
        url = j.next;
      }
    } catch (e) { console.warn('API Spotify', e.message); }
  }

  // 2) Sinon : lecture de la page "embed" publique de Spotify (pas besoin de compte)
  if (!songs.length) {
    const r = await fetch(`https://open.spotify.com/embed/${type}/${id}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr' } });
    const html = await r.text();
    const mm = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!mm) throw new Error('Spotify ne répond pas (playlist privée ?)');
    const data = JSON.parse(mm[1]);
    const entity = findKey(data, 'entity') || {};
    title = entity.name || entity.title || title;
    const list = findKey(data, 'trackList') || [];
    for (const t of list) if (t.title) songs.push({ title: t.title, artist: t.subtitle || '' });
  }
  if (!songs.length) throw new Error('Aucun morceau trouvé dans cette playlist Spotify');
  const items = songs.map(s => ({
    key: 'm:' + s.artist + '|' + s.title,
    artist: s.artist.split(',').map(a => a.trim()).filter(Boolean).slice(0, 2).join(', '),
    title: s.title.replace(/\s*[-–]\s*(remaster|remastered|live|radio edit|version).*$/i, '').trim(),
    cat: 'perso',
  }));
  return { source: 'Spotify', title, tracks: [], items };
}

async function customSource(link) {
  link = String(link || '').trim();
  if (MOCK) {
    const items = Array.from({ length: 25 }, (_, i) => ({ key: 'm:Perso ' + i + '|Morceau perso ' + i, artist: 'Artiste perso ' + i, title: 'Morceau perso ' + i, cat: 'perso' }));
    return { source: /spotify/.test(link) ? 'Spotify' : 'Deezer', title: 'Playlist test', tracks: [], items };
  }
  if (/spotify/i.test(link)) return spotifyCustom(link);
  if (/deezer/i.test(link) || /^\d+$/.test(link)) return deezerCustom(/^\d+$/.test(link) ? 'deezer.com/playlist/' + link : link);
  throw new Error('Colle un lien de playlist Deezer ou Spotify');
}

// ───────────────────────── salons ─────────────────────────
const rooms = new Map();
const AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🦉', '🐺', '🐲', '🐝', '🦖', '🐨', '🐷'];
const COLORS = ['#ff2e4d', '#ffc21a', '#ff7a1a', '#ff4fa3', '#30d5c8', '#7c5cff', '#4cd964', '#2fa9ff', '#ff9ecf', '#b5e655', '#e0b0ff', '#ffd59e'];
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
    answer: 'both',        // 'both' | 'title' | 'artist' (catégories musique)
    rounds: 15,
    duration: 25,          // secondes d'écoute par extrait
    pause: 5,              // secondes entre deux extraits (0 = l'hôte passe à la main)
    speedBonus: true, comboBonus: true, firstBonus: true,
    customLink: '', customTitle: '', customSource: '', customOnly: false,
  };
}

function publicPlayers(room) {
  return [...room.players.values()].map(p => {
    const f = room.round?.found.get(p.id) || {};
    return {
      id: p.id, name: p.name, avatar: p.avatar, color: p.color, score: p.score,
      online: p.online, host: p.id === room.hostId,
      foundArtist: !!f.artist, foundTitle: !!f.title, answered: !!f.answered, streak: p.streak || 0,
    };
  });
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

// Construit la file des extraits : on pioche à tour de rôle dans chaque catégorie
// et on résout les morceaux en parallèle jusqu'à en avoir assez.
async function buildQueue(room) {
  const s = room.settings;
  const sources = []; // [{ tracks: [...] } | { items: [...] }]
  const cats = s.customOnly && s.customLink ? [] : CATEGORIES.filter(c => s.categories.includes(c.id));
  for (const c of cats) {
    if (c.list.length) sources.push({ items: shuffle([...c.list]) });
    else sources.push({ tracks: shuffle([...(await liveTracks(c))]) });
  }
  room.custom = null;
  if (s.customLink) {
    const cs = await customSource(s.customLink);
    room.custom = cs; s.customTitle = cs.title; s.customSource = cs.source;
    if (cs.tracks.length) sources.push({ tracks: shuffle([...cs.tracks]) });
    if (cs.items.length) sources.push({ items: shuffle([...cs.items]) });
  }
  const live = sources.filter(x => (x.items || x.tracks).length);
  if (!live.length) throw new Error('aucun morceau dans ces catégories');

  const queue = []; const seen = new Set();
  let k = 0, guard = 0;
  while (queue.length < s.rounds && live.some(x => (x.items || x.tracks).length) && guard++ < 50) {
    // on prépare un lot de candidats (un par source, à tour de rôle)
    const need = s.rounds - queue.length;
    const batch = [];
    while (batch.length < Math.min(need + 3, 12) && live.some(x => (x.items || x.tracks).length)) {
      const src = live[k++ % live.length];
      const arr = src.items || src.tracks;
      if (arr.length) batch.push(src.items ? { item: arr.pop() } : { track: arr.pop() });
    }
    const res = await Promise.all(batch.map(b => b.track ? b.track : resolveItem(b.item)));
    for (const t of res) {
      if (!t || queue.length >= s.rounds) continue;
      const key = norm((t.work ? t.title : t.artist + ' ' + t.title));
      if (seen.has(t.id) || seen.has(key)) continue;
      seen.add(t.id); seen.add(key); queue.push(t);
    }
  }
  if (!queue.length) throw new Error('aucun extrait jouable trouvé');
  return shuffle(queue);
}

async function startGame(room) {
  room.phase = 'loading'; broadcast(room);
  try {
    const queue = await buildQueue(room);
    if (room.phase !== 'loading') return; // arrêtée pendant le chargement
    room.queue = queue;
    for (const p of room.players.values()) { p.score = 0; p.streak = 0; }
    room.history = [];
    room.roundIndex = -1;
    const short = room.queue.length < room.settings.rounds ? ` (seulement ${room.queue.length} trouvés)` : '';
    sysMsg(room, `🎶 C'est parti ! ${room.queue.length} extraits à deviner${short}.`);
    nextRound(room);
  } catch (e) {
    console.error(e);
    room.phase = 'lobby'; broadcast(room);
    io.to(room.code).emit('toast', { type: 'error', text: 'Impossible de charger la musique : ' + e.message });
  }
}

// Propositions du QCM : 3 leurres de la même catégorie
function makeChoices(room, track) {
  const correct = { id: String(track.id), title: track.title, artist: track.work ? '' : track.artist };
  const used = new Set([norm(track.work ? track.title : track.artist)]);
  let pool = [];
  const cat = CATEGORIES.find(c => c.id === track.cat);
  if (cat?.list.length) pool = cat.list.map(i => ({ title: i.work || i.title, artist: i.work ? '' : i.artist }));
  if (track.cat === 'perso' && room.custom) pool = [...room.custom.items, ...room.custom.tracks].map(i => ({ title: i.title, artist: i.artist }));
  if (pool.length < 4) pool = pool.concat(room.queue.filter(t => !!t.work === !!track.work).map(t => ({ title: t.title, artist: t.work ? '' : t.artist })));
  const opts = [correct];
  for (const o of shuffle(pool)) {
    if (opts.length >= 4) break;
    const k = norm(track.work ? o.title : o.artist);
    if (!k || used.has(k)) continue;
    used.add(k); opts.push({ id: 'x' + opts.length, ...o });
  }
  return shuffle(opts);
}

const needed = (room, track) => track.work ? ['title'] : room.settings.answer === 'both' ? ['artist', 'title'] : [room.settings.answer];

async function nextRound(room) {
  clearTimeout(room.timer);
  room.roundIndex++;
  if (room.roundIndex >= room.queue.length) return endGame(room);
  const track = room.queue[room.roundIndex];
  room.phase = 'prep';
  const preview = await freshPreview(track);
  if (room.phase !== 'prep') return; // partie arrêtée entre-temps
  const s = room.settings;
  const startAt = Date.now() + 3500; // compte à rebours de 3 s, le temps de charger l'audio
  room.round = {
    track, preview, startAt, endAt: startAt + s.duration * 1000,
    found: new Map(), firstArtist: null, firstTitle: null, firstAnswer: null,
    choices: s.mode === 'qcm' ? makeChoices(room, track) : null,
  };
  room.phase = 'playing';
  broadcast(room);
  io.to(room.code).emit('round', roundPayload(room));
  room.timer = setTimeout(() => revealRound(room), room.round.endAt - Date.now() + 300);
}

function roundPayload(room, late = false) {
  const r = room.round, t = r.track, s = room.settings;
  const cat = CATEGORIES.find(c => c.id === t.cat);
  return {
    index: room.roundIndex, total: room.queue.length, preview: r.preview,
    startIn: r.startAt - Date.now(), duration: s.duration, choices: r.choices,
    mode: s.mode, answer: s.answer, cat: t.cat, work: !!t.work, label: cat?.label || '', late,
  };
}

function pointsFor(room, now) {
  const s = room.settings, r = room.round;
  const remaining = Math.max(0, Math.min(1, (r.endAt - now) / (s.duration * 1000)));
  return s.speedBonus ? Math.round(50 + 50 * remaining) : 100;
}

function allDone(room) {
  const online = [...room.players.values()].filter(p => p.online);
  return online.length > 0 && online.every(p => {
    const f = room.round.found.get(p.id) || {};
    if (room.settings.mode === 'qcm') return f.answered;
    return needed(room, room.round.track).every(k => f[k]);
  });
}

function revealRound(room) {
  if (room.phase !== 'playing') return;
  clearTimeout(room.timer);
  room.phase = 'reveal';
  const r = room.round, t = r.track, s = room.settings;
  const results = [...room.players.values()].map(p => {
    const f = r.found.get(p.id) || {};
    const ok = s.mode === 'qcm' ? f.correct : needed(room, t).some(k => f[k]);
    p.streak = ok ? (p.streak || 0) + 1 : 0;
    return { id: p.id, gained: f.points || 0, artist: !!f.artist, title: !!f.title, correct: !!f.correct, time: f.time || null };
  });
  const sub = t.work ? [t.dzTitle, t.dzArtist].filter(Boolean).join(' — ') : '';
  room.history.push({ title: t.title, artist: t.work ? sub : t.artist });
  broadcast(room);
  io.to(room.code).emit('reveal', {
    track: { title: t.title, artist: t.work ? '' : t.artist, sub, note: t.note || '', work: !!t.work, cover: t.cover, link: typeof t.id === 'number' ? `https://www.deezer.com/track/${t.id}` : '' },
    results, index: room.roundIndex, total: room.queue.length, pause: s.pause,
  });
  if (s.pause > 0) room.timer = setTimeout(() => nextRound(room), s.pause * 1000);
}

function endGame(room) {
  clearTimeout(room.timer);
  room.phase = 'end';
  broadcast(room);
  io.to(room.code).emit('end', { history: room.history });
  const top = [...room.players.values()].sort((a, b) => b.score - a.score)[0];
  if (top) sysMsg(room, `🏆 ${top.name} remporte la partie avec ${top.score} points !`);
}

// ───────────────────────── sockets ─────────────────────────
io.on('connection', (socket) => {
  let room = null, me = null;

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
      const used = [...r.players.values()].map(x => x.color);
      p = { id: pid, name, avatar: avatar || AVATARS[r.players.size % AVATARS.length], color: COLORS.find(c => !used.includes(c)) || COLORS[r.players.size % COLORS.length], score: 0, streak: 0, online: true, socketId: socket.id };
      r.players.set(pid, p);
      sysMsg(r, `👋 ${name} a rejoint le salon`);
    }
    if (!r.players.get(r.hostId)?.online) r.hostId = pid;
    me = p;
    socket.join(r.code);
    cb?.({ ok: true, code: r.code, chat: r.chat });
    broadcast(r);
    if (r.phase === 'playing' && r.round) socket.emit('round', roundPayload(r, true));
  }

  const isHost = () => room && me && room.hostId === me.id;

  socket.on('settings', (patch) => {
    if (!isHost() || room.phase !== 'lobby') return;
    const s = room.settings;
    if (Array.isArray(patch.categories)) s.categories = patch.categories.filter(id => CATEGORIES.some(c => c.id === id));
    if (['text', 'qcm'].includes(patch.mode)) s.mode = patch.mode;
    if (['both', 'title', 'artist'].includes(patch.answer)) s.answer = patch.answer;
    if ([5, 10, 15, 20, 30, 50].includes(+patch.rounds)) s.rounds = +patch.rounds;
    if ([10, 15, 20, 25, 30].includes(+patch.duration)) s.duration = +patch.duration;
    if ([0, 3, 5, 8, 12].includes(+patch.pause) && patch.pause !== undefined) s.pause = +patch.pause;
    for (const k of ['speedBonus', 'comboBonus', 'firstBonus', 'customOnly']) if (typeof patch[k] === 'boolean') s[k] = patch[k];
    if (typeof patch.customLink === 'string') {
      s.customLink = patch.customLink.slice(0, 400);
      s.customTitle = patch.customTitle ? String(patch.customTitle).slice(0, 100) : '';
      s.customSource = patch.customSource ? String(patch.customSource).slice(0, 20) : '';
      if (!s.customLink) s.customOnly = false;
    }
    broadcast(room);
  });

  socket.on('checkPlaylist', async (link, cb) => {
    try { const c = await customSource(link); cb?.({ ok: true, title: c.title, source: c.source, count: c.tracks.length + c.items.length }); }
    catch (e) { console.warn('playlist', e.message); cb?.({ error: e.message }); }
  });

  socket.on('start', () => {
    if (!isHost() || !['lobby', 'end'].includes(room.phase)) return;
    const s = room.settings;
    if (!s.categories.length && !s.customLink) return socket.emit('toast', { type: 'error', text: 'Choisis au moins une catégorie !' });
    startGame(room);
  });

  socket.on('skip', () => { if (isHost() && room.phase === 'playing') revealRound(room); });
  // l'hôte signale une mauvaise version : on la bannit et on cherchera une autre version la prochaine fois
  socket.on('ban', () => {
    if (!isHost() || room.phase !== 'reveal' || !room.round) return;
    const t = room.round.track;
    if (typeof t.id === 'number') banned.add(t.id);
    if (t.key) resolved.delete(t.key);
    for (const c of liveCache.values()) c.tracks = c.tracks.filter(x => x.id !== t.id);
    console.log(`🚫 BANNI : ${t.key || t.title} → Deezer ${t.id} « ${t.dzTitle} » par ${t.dzArtist}`);
    socket.emit('toast', { text: '🚫 Version bannie : une autre sera cherchée la prochaine fois' });
  });
  socket.on('next', () => { if (isHost() && room.phase === 'reveal') nextRound(room); });
  socket.on('stop', () => {
    if (isHost() && room.phase !== 'lobby') {
      clearTimeout(room.timer); room.phase = 'lobby'; broadcast(room); sysMsg(room, '⏹️ Partie arrêtée par l\'hôte');
    }
  });
  socket.on('backToLobby', () => { if (isHost() && room.phase === 'end') { room.phase = 'lobby'; broadcast(room); } });
  socket.on('kick', (pid) => {
    if (!isHost() || pid === me.id) return;
    const p = room.players.get(pid); if (!p) return;
    room.players.delete(pid);
    io.to(p.socketId).emit('kicked');
    sysMsg(room, `🚪 ${p.name} a été exclu`); broadcast(room);
  });

  socket.on('guess', (text, cb) => {
    if (!room || room.phase !== 'playing' || !me || room.settings.mode !== 'text') return;
    const r = room.round, now = Date.now();
    if (now < r.startAt - 200 || now > r.endAt + 500) return;
    const f = r.found.get(me.id) || { points: 0 };
    const res = checkGuess(text, r.track);
    const s = room.settings, gained = [];
    const need = needed(room, r.track);
    for (const k of need) {
      if (res[k] && !f[k]) {
        f[k] = true; f.time = (now - r.startAt) / 1000;
        let pts = pointsFor(room, now);
        const fk = k === 'artist' ? 'firstArtist' : 'firstTitle';
        if (s.firstBonus && !r[fk]) { r[fk] = me.id; pts += 20; gained.push({ type: 'first', k }); }
        f.points += pts; me.score += pts; gained.push({ type: k, pts });
        if (s.comboBonus && need.length === 2 && f.artist && f.title) { f.points += 50; me.score += 50; gained.push({ type: 'combo', pts: 50 }); }
      }
    }
    r.found.set(me.id, f);
    cb?.({ artist: !!f.artist, title: !!f.title, gained, close: !gained.length && res.close, done: need.every(k => f[k]) });
    if (gained.length) {
      const what = r.track.work ? 'la réponse' : gained.filter(g => g.type === 'artist' || g.type === 'title').map(g => g.type === 'artist' ? 'l\'artiste' : 'le titre').join(' et ');
      io.to(room.code).emit('found', { id: me.id, name: me.name, avatar: me.avatar, what });
      broadcast(room);
      if (allDone(room)) setTimeout(() => revealRound(room), 600);
    }
  });

  socket.on('choose', (choiceId, cb) => {
    if (!room || room.phase !== 'playing' || !me || room.settings.mode !== 'qcm') return;
    const r = room.round, now = Date.now();
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
    // pendant une manche, on évite qu'une bonne réponse fuite dans le chat
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
    if (!['🔥', '😂', '😱', '👏', '💀', '🎉', '😭', '🤯', '❤️', '🐐'].includes(emoji)) return;
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
    const r = room;
    setTimeout(() => {
      if ([...r.players.values()].every(p => !p.online)) { clearTimeout(r.timer); rooms.delete(r.code); }
    }, 30 * 60 * 1000);
  });
});

server.listen(PORT, () => console.log(`🎵 Musikz en ligne sur http://localhost:${PORT}${MOCK ? ' (mode test)' : ''}`));
