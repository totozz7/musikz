// PlayZup — 25 PILE (1 à 12 joueurs) : 25 questions dans le désordre, les réponses sont TOUS les nombres de 1 à 25,
// chacun une seule fois. Place les boules numérotées sur les bonnes questions (la déduction aide !).
const DATA = require('./data-25');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'n25';
  const MIN = 1, MAX = 12;
  const defaults = () => ({ mode: 'easy', time: 8, checks: 2 });
  function applySettings(room, p) {
    const s = room.gs.n25;
    if (['easy', 'medium', 'mix'].includes(p.mode)) s.mode = p.mode;
    if ([5, 8, 12].includes(+p.time)) s.time = +p.time;
    if ([0, 1, 2, 3].includes(+p.checks)) s.checks = +p.checks;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function start(room) {
    const s = room.gs.n25;
    const pl = online(room); if (pl.length < MIN) throw new Error('Pas assez de joueurs');
    const qs = shuffle(Array.from({ length: 25 }, (_, k) => {
      const n = k + 1, lvl = s.mode === 'easy' ? 0 : s.mode === 'medium' ? 1 : Math.round(Math.random());
      return { n, text: pick(DATA[n][lvl]) };
    }));
    room.g = { game: id, stage: 'play', gameKey: Date.now().toString(36), qs, mode: s.mode, maxChecks: s.checks, startAt: Date.now(),
      boards: Object.fromEntries(pl.map(p => [p.id, {}])), done: {}, checks: {}, lastCheck: {}, timer: null, deadline: 0 };
    room.phase = 'game';
    sysMsg(room, `🎯 25 PILE — mode ${s.mode === 'easy' ? 'facile' : s.mode === 'medium' ? 'moyen' : 'mélange'} · ${s.time} min · chaque nombre de 1 à 25 sert une seule fois !`);
    broadcast(room);
    later(room, s.time * 60000, () => end(room));
    pushState(room);
  }
  const good = (g, pid) => Object.entries(g.boards[pid] || {}).filter(([i, n]) => g.qs[i].n === n).length;
  function end(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const res = Object.keys(g.boards).map(pid => ({ pid, pts: good(g, pid), t: g.done[pid] || Infinity }))
      .sort((a, b) => b.pts - a.pts || a.t - b.t);
    g.ranking = res.map(r => ({ pid: r.pid, pts: r.pts, t: r.t === Infinity ? null : Math.round((r.t - g.startAt) / 1000) }));
    g.coins = {};
    res.forEach((r, i) => { g.coins[r.pid] = { coins: 10 + r.pts + (r.pts === 25 ? 15 : 0) + (res.length > 1 ? [30, 15, 8][i] || 0 : 0), win: i === 0 }; });
    room.gscores.n25 = room.gscores.n25 || {};
    if (res[0] && res.length > 1) room.gscores.n25[res[0].pid] = (room.gscores.n25[res[0].pid] || 0) + 1;
    sysMsg(room, `🏆 25 PILE : ${room.players.get(res[0]?.pid)?.name || '?'} gagne avec ${res[0]?.pts || 0}/25 !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    set(room, me, { i, n } = {}) {
      const g = room.g; if (g.stage !== 'play') return { error: 'Partie terminée' };
      if (g.done[me.id]) return { error: 'Tu as déjà validé ta grille' };
      const b = g.boards[me.id] = g.boards[me.id] || {};
      i = +i; if (!(i >= 0 && i < 25)) return { error: 'Question invalide' };
      if (n === null || n === undefined || n === '') { delete b[i]; }
      else {
        n = +n; if (!(n >= 1 && n <= 25)) return { error: 'Nombre invalide' };
        for (const k of Object.keys(b)) if (b[k] === n) delete b[k]; // un nombre ne sert qu'une fois
        b[i] = n;
      }
      pushState(room);
      return { ok: true };
    },
    check(room, me) {
      const g = room.g; if (g.stage !== 'play' || g.done[me.id]) return { error: 'Impossible maintenant' };
      const used = g.checks[me.id] || 0; if (used >= g.maxChecks) return { error: 'Plus de vérification 😬' };
      g.checks[me.id] = used + 1;
      const placed = Object.keys(g.boards[me.id] || {}).length, ok = good(g, me.id);
      g.lastCheck[me.id] = { ok, placed };
      pushState(room);
      return { ok, placed, left: g.maxChecks - used - 1 };
    },
    done(room, me) {
      const g = room.g; if (g.stage !== 'play' || g.done[me.id]) return { error: 'Déjà validé' };
      g.done[me.id] = Date.now();
      sysMsg(room, `✅ ${me.name} a validé sa grille !`);
      if (online(room).every(p => g.done[p.id] || !(p.id in g.boards))) end(room); else pushState(room);
      return { ok: true };
    },
    end(room, me) { if (room.hostId === me.id && room.g.stage === 'play') end(room); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function view(room, pid) {
    const g = room.g, over = g.stage === 'over';
    if (!g.boards[pid] && g.stage === 'play') g.boards[pid] = {};
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, mode: g.mode, me: pid, left: Math.max(0, g.deadline - Date.now()),
      questions: g.qs.map((q, i) => ({ i, text: q.text, ...(over ? { n: q.n } : {}) })),
      mine: g.boards[pid] || {}, done: !!g.done[pid], checksLeft: g.maxChecks - (g.checks[pid] || 0), maxChecks: g.maxChecks, lastCheck: g.lastCheck[pid] || null,
      race: Object.keys(g.boards).map(p => ({ pid: p, placed: Object.keys(g.boards[p]).length, done: !!g.done[p] })) };
    if (over) { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; v.boards = g.boards; }
    return v;
  }
  function onLeave(room) { const g = room.g; if (g?.stage === 'play' && online(room).length && online(room).every(p => g.done[p.id])) end(room); }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave };
};
