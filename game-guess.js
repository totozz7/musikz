// PlayZup — Guess Party : une image floutée / pixelisée / zoomée apparaît, le premier qui devine marque le plus de points.
// Thèmes et réponses dans data-guess.js. Images récupérées à la volée (Wikipédia, Deezer, flagcdn) et mises en cache.
const THEMES = require('./data-guess');
const { match } = require('./matching');

module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'guess';
  const MIN = 1, MAX = 12;
  const UA = 'PlayZup/1.0 (jeu privé entre amis; https://github.com)';
  const MOCK = !!process.env.MOCK;
  const defaults = () => ({ themes: ['cartoons', 'films', 'raprfr'], level: 1, rounds: 10, time: 30 });

  function applySettings(room, p) {
    const s = room.gs.guess;
    if (Array.isArray(p.themes)) { const t = p.themes.filter(x => THEMES.some(th => th.id === x)); if (t.length) s.themes = [...new Set(t)]; }
    if ([1, 2, 3].includes(+p.level)) s.level = +p.level;
    if ([5, 10, 15, 20].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([20, 30, 45].includes(+p.time)) s.time = +p.time;
  }

  // ── lecture des données ──
  function parse(theme, line, d) {
    const f = line.split('|');
    if (theme.src === 'album') {
      const al = (x) => (x || '').split(',').map(v => v.trim()).filter(Boolean);
      return { theme: theme.id, d, src: 'album', artist: f[0], album: f[1], parts: [
        { k: 'artist', label: 'Artiste', answers: [f[0], ...al(f[2])] },
        { k: 'album', label: 'Album', answers: [f[1], ...al(f[3])] }], show: `${f[0]} — ${f[1]}`, key: `${f[0]}|${f[1]}` };
    }
    return { theme: theme.id, d, src: theme.src, key: f[1], show: f[0], parts: [{ k: 'name', label: 'Réponse', answers: [f[0], f[1].replace(/\s*\(.*\)$/, ''), ...(f[2] || '').split(',').map(v => v.trim()).filter(Boolean)] }] };
  }
  function candidates(s, n) {
    // niveau 1 : connus ; niveau 2 : surtout « moyens » ; niveau 3 : surtout « durs »
    const mix = { 1: [[1, 1]], 2: [[2, .75], [1, .25]], 3: [[3, .75], [2, .25]] }[s.level];
    const pools = s.themes.map(tid => { const th = THEMES.find(t => t.id === tid); return { th, lists: mix.map(([d]) => shuffle(th.items[d].map(l => parse(th, l, d)))) }; });
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < n * 20) {
      const p = pools[out.length % pools.length];
      let r = Math.random(), li = 0; for (; li < mix.length - 1; li++) { r -= mix[li][1]; if (r < 0) break; }
      const it = p.lists[li].pop() || p.lists.find(l => l.length)?.pop();
      if (it) out.push(it);
    }
    return shuffle(out);
  }

  // ── images ──
  const cache = new Map();
  async function getJSON(url) {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function resolveWiki(titles) {
    const todo = [...new Set(titles.filter(t => !cache.has('w:' + t)))];
    for (let i = 0; i < todo.length; i += 50) {
      const batch = todo.slice(i, i + 50);
      try {
        const j = await getJSON('https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail&pithumbsize=900&pilicense=any&pilimit=50&redirects=1&titles=' + encodeURIComponent(batch.join('|')));
        const q = j.query || {}, map = {};
        (q.normalized || []).forEach(x => { map[x.from] = x.to; });
        (q.redirects || []).forEach(x => { map[x.from] = x.to; });
        const pages = Object.fromEntries((q.pages || []).map(p => [p.title, p.thumbnail?.source || null]));
        batch.forEach(t => { let k = t; for (let h = 0; h < 3 && map[k]; h++) k = map[k]; cache.set('w:' + t, pages[k] || null); });
      } catch (e) { console.log('wiki', e.message); }
    }
  }
  async function resolveAlbum(it) {
    const k = 'a:' + it.key;
    if (cache.has(k)) return;
    let url = null;
    try {
      const q = encodeURIComponent(`artist:"${it.artist}" album:"${it.album}"`);
      let j = await getJSON(`https://api.deezer.com/search/album?q=${q}&limit=5`);
      if (!j.data?.length) j = await getJSON(`https://api.deezer.com/search/album?q=${encodeURIComponent(it.artist + ' ' + it.album)}&limit=8`);
      const best = (j.data || []).find(a => match(a.artist?.name, it.artist) === 'ok' && match(a.title, it.album)) || (j.data || []).find(a => match(a.artist?.name, it.artist) === 'ok');
      url = best?.cover_xl || best?.cover_big || null;
    } catch (e) { console.log('deezer', e.message); }
    cache.set(k, url);
  }
  function mockImage(it, i) {
    const hues = [350, 30, 190, 270, 140, 50];
    const h = hues[i % hues.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},90%,60%)"/><stop offset="1" stop-color="hsl(${h + 60},80%,35%)"/></linearGradient></defs><rect width="600" height="600" fill="url(#a)"/><circle cx="420" cy="180" r="120" fill="#fff4"/><rect x="60" y="330" width="300" height="200" rx="30" fill="#0003"/><text x="300" y="320" font-size="60" text-anchor="middle" fill="#fff" font-family="sans-serif">${it.show.replace(/[<&]/g, '')}</text></svg>`;
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }
  async function resolveAll(list) {
    if (MOCK) return list.map((it, i) => ({ ...it, img: mockImage(it, i) }));
    await resolveWiki(list.filter(i => i.src === 'wiki').map(i => i.key));
    const albums = list.filter(i => i.src === 'album');
    for (let i = 0; i < albums.length; i += 4) await Promise.all(albums.slice(i, i + 4).map(resolveAlbum));
    return list.map(it => ({ ...it, img: it.src === 'flag' ? `https://flagcdn.com/w640/${it.key}.png` : cache.get((it.src === 'wiki' ? 'w:' : 'a:') + it.key) || null })).filter(it => it.img);
  }

  // ── déroulé ──
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }

  function start(room) {
    const s = room.gs.guess;
    if (!s.themes.length) throw new Error('Choisis au moins un thème');
    const players = [...room.players.values()].filter(p => p.online);
    room.g = { game: id, stage: 'loading', gameKey: Date.now().toString(36), level: s.level, time: s.time * 1000, total: s.rounds,
      list: [], idx: -1, round: null, scores: {}, found: {}, feed: [], timer: null, deadline: 0, results: [] };
    players.forEach(p => { room.g.scores[p.id] = 0; });
    room.phase = 'game';
    const g = room.g;
    sysMsg(room, `🖼️ Guess Party — ${s.rounds} images · niveau ${['', 'facile', 'moyen', 'très dur'][s.level]} · ${s.themes.map(t => THEMES.find(x => x.id === t).emoji).join(' ')}`);
    pushState(room);
    resolveAll(candidates(s, s.rounds * 2 + 4)).then(list => {
      if (room.g !== g) return;
      if (list.length < Math.min(3, s.rounds)) {
        room.g = null; room.phase = 'lobby';
        sysMsg(room, '❌ Impossible de charger les images (connexion à Wikipédia/Deezer ?). Réessaie dans un instant.');
        return broadcast(room);
      }
      // on équilibre les thèmes dans l'ordre des manches
      g.list = list.slice(0, s.rounds);
      g.total = g.list.length;
      broadcast(room);
      later(room, 1200, () => nextRound(room));
    });
  }

  function nextRound(room) {
    const g = room.g;
    g.idx++;
    if (g.idx >= g.list.length) return finish(room);
    const it = g.list[g.idx];
    g.stage = 'play';
    g.found = {};
    g.firsts = {};
    g.round = { startAt: Date.now() + 2500, dur: g.time, fx: { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 } };
    pushState(room);
    later(room, 2500 + g.time, () => endRound(room));
  }

  const parts = (g) => g.list[g.idx].parts;
  function allDone(room) {
    const g = room.g, n = parts(g).length;
    return [...room.players.values()].filter(p => p.online).every(p => Object.keys(g.found[p.id] || {}).length >= n);
  }

  function endRound(room) {
    const g = room.g; if (g.stage !== 'play') return;
    clear(g);
    g.stage = 'reveal';
    const it = g.list[g.idx];
    g.results.push({ show: it.show, img: it.img, theme: it.theme, finders: Object.keys(g.found).filter(pid => Object.keys(g.found[pid]).length) });
    pushState(room);
    later(room, 6500, () => nextRound(room));
  }

  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    const humans = rank.length;
    g.coins = {};
    rank.forEach(([pid], i) => {
      const good = g.results.reduce((a, r, k) => a + (g.goodBy?.[pid]?.[k] || 0), 0);
      let c = 10 + 4 * good;
      if (humans >= 2) c += [30, 15, 8][i] || 0; else c += Math.round(good * 1.5);
      g.coins[pid] = { coins: c, good, win: i === 0 && humans >= 2 };
    });
    room.gscores.guess = room.gscores.guess || {};
    if (rank[0] && humans >= 2) room.gscores.guess[rank[0][0]] = (room.gscores.guess[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 Guess Party : ${room.players.get(rank[0]?.[0])?.name || '?'} gagne avec ${rank[0]?.[1] || 0} pts !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }

  const handlers = {
    guess(room, me, text) {
      const g = room.g;
      if (g.stage !== 'play' || Date.now() < g.round.startAt || typeof text !== 'string' || !text.trim()) return { verdict: 'wait' };
      const mine = g.found[me.id] = g.found[me.id] || {};
      let got = [], close = false;
      for (const p of parts(g)) {
        if (mine[p.k]) continue;
        let ok = false;
        for (const a of p.answers) { const m = match(text, a); if (m === 'ok') { ok = true; break; } if (m === 'close') close = true; }
        if (ok) got.push(p);
      }
      if (!got.length) return { verdict: close ? 'close' : 'no' };
      const left = Math.max(0, g.round.startAt + g.round.dur - Date.now()) / g.round.dur;
      let gain = 0;
      for (const p of got) {
        let pts = Math.round(50 + 100 * left);
        if (!g.firsts[p.k]) { g.firsts[p.k] = me.id; pts += 25; }
        mine[p.k] = pts; gain += pts;
        g.goodBy = g.goodBy || {}; g.goodBy[me.id] = g.goodBy[me.id] || {}; g.goodBy[me.id][g.idx] = (g.goodBy[me.id][g.idx] || 0) + 1;
      }
      g.scores[me.id] = (g.scores[me.id] || 0) + gain;
      const all = Object.keys(mine).length >= parts(g).length;
      g.feed.unshift({ pid: me.id, txt: all ? (parts(g).length > 1 ? 'a tout trouvé ! 🎯' : 'a trouvé ! 🎯') : `a trouvé ${got.map(p => p.k === 'artist' ? "l'artiste" : "l'album").join(' et ')} !`, at: Date.now() });
      g.feed = g.feed.slice(0, 12);
      pushState(room);
      if (allDone(room)) later(room, 900, () => endRound(room));
      return { verdict: 'ok', parts: got.map(p => p.k), gain, all };
    },
    skip(room, me) { // l'hôte peut passer l'image
      const g = room.g; if (room.hostId !== me.id || g.stage !== 'play') return;
      endRound(room);
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g;
    const it = g.list[g.idx];
    const th = it && THEMES.find(t => t.id === it.theme);
    const v = {
      game: id, stage: g.stage, gameKey: g.gameKey, level: g.level, idx: g.idx, total: g.total,
      scores: g.scores, feed: g.feed.slice(0, 8), left: Math.max(0, g.deadline - Date.now()),
      players: Object.keys(g.scores).map(p => ({ pid: p, n: Object.keys(g.found[p] || {}).length })),
    };
    if (it && g.stage !== 'loading') {
      v.round = { ...g.round, now: Date.now(), img: it.img, theme: { id: th.id, name: th.name, emoji: th.emoji, ask: th.ask }, d: it.d,
        parts: it.parts.map(p => ({ k: p.k, label: p.label, len: p.answers[0].length,
          hint: g.level < 3 ? p.answers[0].replace(/[^\s'’\-.,:!?&]/g, (c, i, s) => (i === 0 || /[\s'’\-]/.test(s[i - 1]) ? c : '_')) : null })),
        mine: g.found[pid] || {} };
      if (g.stage === 'reveal' || g.stage === 'over') v.round.answer = it.show;
      if (MOCK) v.round.dbg = it.parts.map(p => p.answers[0]); // tests automatiques uniquement
    }
    const nx = g.list[g.idx + 1]; if (nx) v.next = nx.img; // préchargement
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; v.results = g.results; }
    return v;
  }

  // si quelqu'un part, la manche peut se finir plus tôt (tous les présents ont trouvé)
  function onLeave(room) { const g = room.g; if (g?.game === id && g.stage === 'play' && allDone(room)) later(room, 600, () => endRound(room)); }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, themes: THEMES.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, n: t.items[1].length + t.items[2].length + t.items[3].length })) };
};
