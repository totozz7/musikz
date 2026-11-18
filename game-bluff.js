// PlayZup — LE BLUFF (2 à 10 joueurs). Une anecdote vraie à trou : chacun invente une fausse réponse crédible,
// puis tout le monde cherche la vraie parmi les bluffs. Trouver la vérité = 100 pts, chaque joueur piégé par ton bluff = 50 pts.
const FACTS = require('./data-bluff');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'bluff';
  const MIN = 2, MAX = 10;
  const defaults = () => ({ rounds: 6, time: 60 });
  function applySettings(room, p) {
    const s = room.gs.bluff;
    if ([4, 6, 8, 10].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([40, 60, 90].includes(+p.time)) s.time = +p.time;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/^(le |la |les |l'|un |une |des |du |d')/, '').replace(/[^a-z0-9]/g, '');
  const players = (room) => [...room.players.values()].filter(p => p.online);

  function start(room) {
    const s = room.gs.bluff;
    if (players(room).length < MIN) throw new Error('Il faut au moins 2 joueurs pour bluffer 😏');
    room.g = { game: id, stage: 'write', gameKey: Date.now().toString(36), rounds: s.rounds, time: s.time * 1000, round: 0,
      facts: shuffle([...FACTS]), scores: {}, lies: {}, picks: {}, options: [], timer: null, deadline: 0, gains: {}, fooled: {} };
    players(room).forEach(p => { room.g.scores[p.id] = 0; });
    room.phase = 'game';
    sysMsg(room, `🎭 Le Bluff — ${s.rounds} anecdotes · invente, piège, démasque !`);
    broadcast(room);
    nextRound(room);
  }
  function nextRound(room) {
    const g = room.g;
    g.round++;
    if (g.round > g.rounds) return finish(room);
    g.fact = g.facts[(g.round - 1) % g.facts.length];
    g.lies = {}; g.picks = {}; g.options = []; g.gains = {}; g.fooled = {};
    g.stage = 'write';
    later(room, g.time, () => toVote(room));
    pushState(room);
  }
  const isTruth = (g, t) => [g.fact[1], ...g.fact[2]].some(x => norm(x) === norm(t));
  function toVote(room) {
    const g = room.g; if (g.stage !== 'write') return;
    // on regroupe les bluffs identiques
    const groups = {};
    Object.entries(g.lies).forEach(([pid, t]) => { const k = norm(t); (groups[k] = groups[k] || { text: t, authors: [] }).authors.push(pid); });
    const opts = Object.values(groups).map(o => ({ text: o.text, authors: o.authors }));
    opts.push({ text: g.fact[1], truth: true, authors: [] });
    const decoys = shuffle([...g.fact[3]]).filter(d => !opts.some(o => norm(o.text) === norm(d)));
    while (opts.length < 4 && decoys.length) opts.push({ text: decoys.pop(), house: true, authors: [] });
    g.options = shuffle(opts).map((o, i) => ({ ...o, id: i }));
    g.stage = 'vote';
    later(room, 30000, () => reveal(room));
    pushState(room);
  }
  function reveal(room) {
    const g = room.g; if (g.stage !== 'vote') return;
    clear(g);
    const mult = g.round === g.rounds ? 2 : 1;
    Object.entries(g.picks).forEach(([pid, oid]) => {
      const o = g.options[oid]; if (!o) return;
      if (o.truth) g.gains[pid] = (g.gains[pid] || 0) + 100 * mult;
      else o.authors.forEach(a => { g.gains[a] = (g.gains[a] || 0) + 50 * mult; g.fooled[a] = (g.fooled[a] || 0) + 1; });
    });
    Object.entries(g.gains).forEach(([pid, p]) => { g.scores[pid] = (g.scores[pid] || 0) + p; });
    g.stage = 'reveal';
    later(room, 3200 + g.options.length * 1700, () => nextRound(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 10 + Math.round(pts / 25) + ([30, 15, 8][i] || 0), win: i === 0 }; });
    room.gscores.bluff = room.gscores.bluff || {};
    if (rank[0]) room.gscores.bluff[rank[0][0]] = (room.gscores.bluff[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 Le Bluff : ${room.players.get(rank[0]?.[0])?.name || '?'} est le roi du mensonge (${rank[0]?.[1] || 0} pts) !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    lie(room, me, text) {
      const g = room.g; if (g.stage !== 'write') return;
      text = String(text || '').trim().slice(0, 50);
      if (!text) return { error: 'Écris quelque chose 😉' };
      if (isTruth(g, text)) return { error: 'Trop proche de la vérité ! Invente autre chose 😏', truth: true };
      if (!(me.id in g.scores)) g.scores[me.id] = 0;
      g.lies[me.id] = text;
      pushState(room);
      if (players(room).every(p => g.lies[p.id])) later(room, 800, () => toVote(room));
      return { ok: true };
    },
    pick(room, me, oid) {
      const g = room.g; if (g.stage !== 'vote') return;
      const o = g.options[+oid]; if (!o || o.authors.includes(me.id)) return { error: "C'est ton propre bluff 😅" };
      g.picks[me.id] = +oid;
      pushState(room);
      if (players(room).every(p => g.picks[p.id] !== undefined)) later(room, 700, () => reveal(room));
      return { ok: true };
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function view(room, pid) {
    const g = room.g;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, round: g.round, rounds: g.rounds, me: pid, time: g.time, left: Math.max(0, g.deadline - Date.now()),
      q: g.fact?.[0], scores: g.scores, myLie: g.lies[pid] || null, wrote: Object.keys(g.lies), picked: Object.keys(g.picks), myPick: g.picks[pid] ?? null, final: g.round === g.rounds };
    if (g.stage === 'vote') v.options = g.options.map(o => ({ id: o.id, text: o.text, mine: o.authors.includes(pid) }));
    if (g.stage === 'reveal' || g.stage === 'over') {
      v.options = g.options.map(o => ({ id: o.id, text: o.text, truth: !!o.truth, house: !!o.house, authors: o.authors, pickers: Object.keys(g.picks).filter(p => g.picks[p] === o.id) }));
      v.gains = g.gains; v.answer = g.fact?.[1];
    }
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view };
};
