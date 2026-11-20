// PlayZup — PETIT BAC (2 à 12 joueurs). Une lettre, des catégories (classiques ou marrantes), on remplit vite,
// STOP ! puis tout le monde valide les réponses des autres (vote ❌). Réponse unique = 10 pts, partagée = 5 pts.
const CATS = require('./data-bac');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'bac';
  const MIN = 1, MAX = 12;
  const LETTERS = 'ABCDEFGHIJLMNOPRSTV'.split('');
  const defaults = () => ({ mode: 'classic', rounds: 4, time: 90, cats: 7 });
  function applySettings(room, p) {
    const s = room.gs.bac;
    if (['classic', 'special'].includes(p.mode)) s.mode = p.mode;
    if ([1, 2, 3, 4, 5, 8].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([60, 90, 120, 180].includes(+p.time)) s.time = +p.time;
    if ([5, 7, 9].includes(+p.cats)) s.cats = +p.cats;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const strip = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const core = (s) => strip(s).replace(/^(le |la |les |l'|l’|un |une |des |du |de la |de l'|d')/, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const norm = (s) => core(s).replace(/s\b/g, '').replace(/x\b/g, '');
  const players = (room) => [...room.players.values()].filter(p => p.online);

  function start(room) {
    const s = room.gs.bac;
    const pool = s.mode === 'classic' ? CATS.classic : CATS.special;
    const cats = shuffle([...pool]).slice(0, s.cats);
    room.g = {
      game: id, stage: 'roll', gameKey: Date.now().toString(36), cats, rounds: s.rounds, time: s.time * 1000, round: 0,
      letters: shuffle([...LETTERS]), letter: null, answers: {}, votes: {}, scores: {}, roundPts: {}, stopper: null, timer: null, deadline: 0, valid: {}, history: [],
    };
    players(room).forEach(p => { room.g.scores[p.id] = 0; });
    room.phase = 'game';
    sysMsg(room, `📝 Petit Bac — ${s.rounds} manche${s.rounds > 1 ? "s" : ""} · ${cats.length} catégories · ${s.time} s par lettre`);
    broadcast(room);
    nextRound(room);
  }
  function nextRound(room) {
    const g = room.g;
    g.round++;
    if (g.round > g.rounds) return finish(room);
    g.letter = g.letters[(g.round - 1) % g.letters.length];
    g.answers = {}; g.votes = {}; g.stopper = null; g.roundPts = {}; g.valid = {};
    g.stage = 'roll';
    later(room, 3200, () => { g.stage = 'write'; later(room, g.time, () => toVote(room)); pushState(room); });
    pushState(room);
  }
  const startsOk = (g, txt) => core(txt).charAt(0).toUpperCase() === g.letter;
  function toVote(room) {
    const g = room.g; if (!['write', 'stopping'].includes(g.stage)) return;
    g.stage = 'vote';
    g.cats.forEach((_, i) => { g.votes[i] = {}; });
    later(room, 25000 + g.cats.length * 6000, () => score(room));
    pushState(room);
  }
  function score(room) {
    const g = room.g; if (g.stage !== 'vote') return;
    clear(g);
    const ps = Object.keys(g.scores);
    const voters = Math.max(1, players(room).length - 1);
    g.cats.forEach((_, i) => {
      const vals = {};
      ps.forEach(pid => {
        const a = (g.answers[pid] || [])[i];
        if (!a || !core(a)) return;
        const rej = Object.keys(g.votes[i]?.[pid] || {}).length;
        const ok = startsOk(g, a) && rej * 2 <= voters && !(voters === 1 && rej === 1);
        g.valid[pid + ':' + i] = ok;
        if (ok) (vals[norm(a)] = vals[norm(a)] || []).push(pid);
      });
      Object.values(vals).forEach(list => list.forEach(pid => { const pts = list.length > 1 ? 5 : 10; g.roundPts[pid] = (g.roundPts[pid] || 0) + pts; g.valid[pid + ':' + i] = pts; }));
    });
    // bonus « STOP » : celui qui a crié STOP avec tout rempli et tout validé
    if (g.stopper && g.cats.every((_, i) => g.valid[g.stopper + ':' + i])) g.roundPts[g.stopper] = (g.roundPts[g.stopper] || 0) + 5;
    Object.entries(g.roundPts).forEach(([pid, p]) => { g.scores[pid] = (g.scores[pid] || 0) + p; });
    g.history.push({ letter: g.letter, pts: { ...g.roundPts } });
    g.stage = 'results';
    later(room, 7000, () => nextRound(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 10 + Math.round(pts / 8) + (rank.length > 1 ? [30, 15, 8][i] || 0 : 10), win: i === 0 }; });
    room.gscores.bac = room.gscores.bac || {};
    if (rank[0] && rank.length > 1) room.gscores.bac[rank[0][0]] = (room.gscores.bac[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 Petit Bac : ${room.players.get(rank[0]?.[0])?.name || '?'} gagne avec ${rank[0]?.[1] || 0} pts !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }

  const handlers = {
    answer(room, me, d) {
      const g = room.g; if (g.stage !== 'write' && g.stage !== 'stopping') return;
      if (!d || !Number.isInteger(+d.i) || +d.i < 0 || +d.i >= g.cats.length) return;
      if (!(me.id in g.scores)) g.scores[me.id] = 0;
      (g.answers[me.id] = g.answers[me.id] || [])[+d.i] = String(d.text || '').slice(0, 40);
    },
    stop(room, me) {
      const g = room.g; if (g.stage !== 'write') return;
      const a = g.answers[me.id] || [];
      if (!g.cats.every((_, i) => a[i] && core(a[i]))) return { error: 'Remplis toutes les catégories avant de crier STOP !' };
      g.stage = 'stopping'; g.stopper = me.id;
      later(room, 3500, () => toVote(room));
      pushState(room);
    },
    vote(room, me, d) {
      const g = room.g; if (g.stage !== 'vote' || !d) return;
      const i = +d.i, t = d.pid; if (!g.votes[i] || t === me.id || !(t in g.scores)) return;
      const v = g.votes[i][t] = g.votes[i][t] || {};
      if (v[me.id]) delete v[me.id]; else v[me.id] = 1;
      pushState(room);
    },
    ready(room, me) { const g = room.g; if (g.stage === 'vote') { g.ready = g.ready || {}; g.ready[me.id] = 1; if (players(room).every(p => g.ready[p.id])) { g.ready = {}; score(room); } else pushState(room); } },
    next(room, me) { if (room.hostId === me.id && room.g.stage === 'vote') { room.g.ready = {}; score(room); } },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, cats: g.cats, round: g.round, rounds: g.rounds, letter: g.letter, time: g.time,
      left: Math.max(0, g.deadline - Date.now()), scores: g.scores, mine: g.answers[pid] || [], stopper: g.stopper, me: pid,
      filled: Object.fromEntries(Object.keys(g.scores).map(p => [p, (g.answers[p] || []).filter(x => x && core(x)).length])) };
    if (['vote', 'results', 'over'].includes(g.stage)) {
      v.table = g.cats.map((c, i) => Object.keys(g.scores).map(p => {
        const a = (g.answers[p] || [])[i] || '';
        return { pid: p, a, bad: !!a && !startsOk(g, a), votes: Object.keys(g.votes[i]?.[p] || {}).length, mine: !!g.votes[i]?.[p]?.[pid], pts: g.stage !== 'vote' ? (g.valid[p + ':' + i] || 0) : null };
      }));
      v.ready = Object.keys(g.ready || {});
    }
    if (g.stage === 'results' || g.stage === 'over') v.roundPts = g.roundPts;
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view };
};
