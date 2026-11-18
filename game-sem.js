// PlayZup — ÇA CHAUFFE ! (1 à 12 joueurs) : trouve le mot secret en proposant des mots ; chaque essai donne une
// « température » (proximité de sens, de -100 à 100 °C) et un rang ‰ si tu es dans les 1000 mots les plus proches.
// Le premier qui trouve gagne la manche, puis un nouveau mot arrive (à l'infini si on veut).
// Proximités calculées avec des vecteurs de mots français (sem-vectors.bin : 50 000 mots × 300 dimensions, int8).
const fs = require('fs');
const path = require('path');
const SECRETS = require('./data-sem');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'sem';
  const MIN = 1, MAX = 12, DIM = 300;
  let DB = null;
  function load() {
    if (DB) return DB;
    const dir = __dirname;
    const words = fs.readFileSync(path.join(dir, 'sem-words.txt'), 'utf8').split('\n');
    const buf = fs.readFileSync(path.join(dir, 'sem-vectors.bin'));
    const V = new Int8Array(buf.buffer, buf.byteOffset, buf.length);
    const N = words.length, norms = new Float32Array(N), index = new Map(), loose = new Map();
    for (let i = 0; i < N; i++) {
      let s = 0; for (let k = 0, o = i * DIM; k < DIM; k++) s += V[o + k] * V[o + k];
      norms[i] = Math.sqrt(s) || 1;
      index.set(words[i], i);
      const st = words[i].normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (!loose.has(st)) loose.set(st, i);
    }
    DB = { words, V, N, norms, index, loose, secrets: SECRETS.filter(w => index.has(w)) };
    return DB;
  }
  function sims(i) {
    const { V, N, norms } = load(), out = new Float32Array(N), o = i * DIM;
    for (let j = 0; j < N; j++) { let s = 0; const p = j * DIM; for (let k = 0; k < DIM; k++) s += V[o + k] * V[p + k]; out[j] = s / (norms[i] * norms[j]); }
    return out;
  }
  function lookup(w) {
    const db = load();
    w = String(w || '').trim().toLowerCase().replace(/’/g, "'").replace(/^(le |la |les |l'|un |une |des )/, '');
    if (db.index.has(w)) return db.index.get(w);
    const st = w.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return db.loose.has(st) ? db.loose.get(st) : -1;
  }

  const defaults = () => ({ words: 5, hints: true });
  function applySettings(room, p) {
    const s = room.gs.sem;
    if ([1, 3, 5, 10, 0].includes(+p.words)) s.words = +p.words;
    if (p.hints !== undefined) s.hints = p.hints === true;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; (g.hintT || []).forEach(clearTimeout); g.hintT = []; };
  function later(room, ms, fn) { const g = room.g; clearTimeout(g.timer); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const players = (room) => [...room.players.values()].filter(p => p.online);

  function start(room) {
    const s = room.gs.sem;
    const db = load();
    room.g = { game: id, stage: 'play', gameKey: Date.now().toString(36), total: s.words, hints: s.hints, n: 0, scores: {}, found: 0,
      deck: shuffle([...db.secrets]), guesses: {}, best: {}, giveup: {}, timer: null, hintT: [], deadline: 0, history: [] };
    players(room).forEach(p => { room.g.scores[p.id] = 0; });
    room.phase = 'game';
    sysMsg(room, `🔥 Ça chauffe ! — ${s.words ? s.words + ' mots' : 'mots à l\'infini'} · trouve le mot secret avant les autres`);
    broadcast(room);
    nextWord(room);
  }
  function nextWord(room) {
    const g = room.g; clear(g);
    if (g.total && g.n >= g.total) return finish(room);
    g.n++;
    if (!g.deck.length) g.deck = shuffle([...load().secrets]);
    g.word = g.deck.pop(); g.wi = load().index.get(g.word);
    const S = sims(g.wi); g.S = S;
    g.sorted = Float32Array.from(S).sort().reverse(); // décroissant
    g.guesses = {}; g.best = {}; g.giveup = {}; g.winner = null; g.hint = '';
    g.stage = 'play'; g.startAt = Date.now();
    if (g.hints) {
      g.hintT.push(setTimeout(() => { if (room.g === g && g.stage === 'play') { g.hint = `Commence par « ${g.word[0].toUpperCase()} »`; pushState(room); } }, 120000));
      g.hintT.push(setTimeout(() => { if (room.g === g && g.stage === 'play') { g.hint = `Commence par « ${g.word[0].toUpperCase()} » · ${g.word.length} lettres`; pushState(room); } }, 240000));
    }
    pushState(room);
  }
  function rankOf(g, s) { // nombre de mots strictement plus proches + 1
    let lo = 0, hi = g.sorted.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (g.sorted[m] > s + 1e-7) lo = m + 1; else hi = m; }
    return lo + 1;
  }
  function endWord(room, why, winner) {
    const g = room.g; clear(g);
    const { words } = load();
    const order = Array.from(g.S.keys()).sort((a, b) => g.S[b] - g.S[a]).slice(1, 11).map(i => ({ w: words[i], t: Math.round(g.S[i] * 10000) / 100 }));
    const gains = {};
    if (winner) gains[winner] = 100 + Math.max(0, 50 - (g.guesses[winner]?.length || 0));
    Object.entries(g.best).forEach(([pid, b]) => { if (pid !== winner && b.per > 0) gains[pid] = Math.round(b.per / 20); });
    Object.entries(gains).forEach(([pid, p]) => { g.scores[pid] = (g.scores[pid] || 0) + p; });
    if (winner) g.found++;
    g.last = { word: g.word, why, winner, near: order, gains, best: Object.fromEntries(Object.entries(g.best).map(([p, b]) => [p, b])), counts: Object.fromEntries(Object.entries(g.guesses).map(([p, l]) => [p, l.length])) };
    g.history.push({ word: g.word, winner });
    g.stage = 'reveal';
    later(room, 9000, () => nextWord(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 10 + Math.round(pts / 10) + (rank.length > 1 ? [30, 15, 8][i] || 0 : 0), win: i === 0 }; });
    room.gscores.sem = room.gscores.sem || {};
    if (rank[0] && rank.length > 1) room.gscores.sem[rank[0][0]] = (room.gscores.sem[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 Ça chauffe ! : ${room.players.get(rank[0]?.[0])?.name || '?'} gagne avec ${rank[0]?.[1] || 0} pts !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    guess(room, me, text) {
      const g = room.g; if (g.stage !== 'play') return { error: 'Attends le prochain mot…' };
      const i = lookup(text);
      if (i < 0) return { error: `Je ne connais pas « ${String(text).slice(0, 30)} » 🤔` };
      const { words } = load();
      const w = words[i];
      const list = g.guesses[me.id] = g.guesses[me.id] || [];
      if (!(me.id in g.scores)) g.scores[me.id] = 0;
      const prev = list.find(x => x.w === w);
      if (prev) return { dup: true, ...prev };
      const s = g.S[i], rank = rankOf(g, s), per = rank <= 1000 ? 1001 - rank : 0;
      const r = { w, t: Math.round(s * 10000) / 100, per, n: list.length + 1 };
      list.push(r);
      const b = g.best[me.id];
      if (!b || r.t > b.t) g.best[me.id] = { t: r.t, per: r.per };
      if (i === g.wi) { endWord(room, 'found', me.id); return { ...r, win: true }; }
      pushState(room);
      return r;
    },
    giveup(room, me) {
      const g = room.g; if (g.stage !== 'play') return;
      if (g.giveup[me.id]) delete g.giveup[me.id]; else g.giveup[me.id] = 1;
      if (Object.keys(g.giveup).length * 2 > players(room).length) return endWord(room, 'giveup', null);
      pushState(room);
    },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') finish(room); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function view(room, pid) {
    const g = room.g;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, n: g.n, total: g.total, me: pid, scores: g.scores, hint: g.hint, startAt: g.startAt, now: Date.now(),
      mine: g.guesses[pid] || [], race: Object.keys(g.scores).map(p => ({ pid: p, n: (g.guesses[p] || []).length, best: g.best[p] || null })),
      giveup: Object.keys(g.giveup || {}), left: Math.max(0, g.deadline - Date.now()), round: g.gameKey + ':' + g.n };
    if (g.stage === 'reveal' || g.stage === 'over') v.last = g.last;
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; v.history = g.history; }
    return v;
  }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, _load: load, _sims: sims };
};
