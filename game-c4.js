// PlayZup — PUISSANCE 4 (2 joueurs, les autres regardent). Modes : Classique (7×6, aligne 4), Géant (9×7, aligne 5),
// Bombes (classique + 1 bombe par joueur qui pulvérise les jetons autour). Le gagnant reste à la table.
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'c4';
  const MODES = { classic: { name: '🔴 Classique', w: 7, h: 6, k: 4 }, big: { name: '🟡 Géant', w: 9, h: 7, k: 5 }, bomb: { name: '💣 Bombes', w: 7, h: 6, k: 4, bombs: 1 } };
  const defaults = () => ({ mode: 'classic', time: 20, games: 3 });
  function applySettings(room, p) {
    const s = room.gs.c4;
    if (MODES[p.mode]) s.mode = p.mode;
    if ([10, 20, 40, 0].includes(+p.time)) s.time = +p.time;
    if ([1, 3, 5].includes(+p.games)) s.games = +p.games;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const P = (room, pid) => room.players.get(pid);

  function start(room) {
    const s = room.gs.c4, pl = online(room);
    if (pl.length < 2) throw new Error('Il faut 2 joueurs');
    room.g = { game: id, stage: 'play', gameKey: Date.now().toString(36), mode: s.mode, time: s.time, total: s.games, n: 0,
      queue: shuffle(pl.map(p => p.id)), wins: Object.fromEntries(pl.map(p => [p.id, 0])), draws: 0, results: [], timer: null, deadline: 0, fx: null };
    room.phase = 'game';
    sysMsg(room, `🔴🟡 PUISSANCE 4 — ${MODES[s.mode].name} · ${s.games} manche${s.games > 1 ? 's' : ''}${pl.length > 2 ? ' · le gagnant reste à la table !' : ''}`);
    broadcast(room);
    newGame(room);
  }
  function newGame(room) {
    const g = room.g; clear(g);
    const on = g.queue.filter(x => room.players.get(x)?.online);
    g.queue = [...on, ...g.queue.filter(x => !on.includes(x))];
    if (on.length < 2) return over(room);
    g.n++;
    const [a, b] = g.queue, prev = g.results[g.results.length - 1];
    // celui qui a perdu (ou le 2e) commence
    g.p1 = prev && prev.p1 === a && prev.p2 === b ? b : a; g.p2 = g.p1 === a ? b : a;
    if (!prev && Math.random() < .5) [g.p1, g.p2] = [g.p2, g.p1];
    const M = MODES[g.mode];
    g.W = M.w; g.H = M.h; g.K = M.k;
    g.grid = Array.from({ length: M.h }, () => Array(M.w).fill(0)); // 0 vide, 1 = p1 (rouge), 2 = p2 (jaune)
    g.turn = 1; g.moves = 0; g.last = null; g.line = null; g.result = null; g.bombs = { 1: M.bombs || 0, 2: M.bombs || 0 }; g.blast = null;
    g.stage = 'play';
    sysMsg(room, `🔴 ${P(room, g.p1)?.name} contre 🟡 ${P(room, g.p2)?.name} — manche ${g.n}/${g.total}`);
    arm(room); pushState(room);
  }
  function arm(room) {
    const g = room.g;
    if (!g.time) { clear(g); g.deadline = 0; return; }
    later(room, g.time * 1000 + 600, () => {
      // temps écoulé : on joue au hasard pour lui
      const cols = [...Array(g.W).keys()].filter(c => g.grid[0][c] === 0);
      if (!cols.length) return;
      drop(room, cols[Math.floor(Math.random() * cols.length)], false, true);
    });
  }
  function findLine(g, r, c) {
    const v = g.grid[r][c]; if (!v) return null;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const cells = [[r, c]];
      for (const s of [1, -1]) for (let k = 1; ; k++) { const rr = r + dr * k * s, cc = c + dc * k * s; if (rr < 0 || rr >= g.H || cc < 0 || cc >= g.W || g.grid[rr][cc] !== v) break; cells.push([rr, cc]); }
      if (cells.length >= g.K) return cells;
    }
    return null;
  }
  function settle(g) { // gravité après une bombe
    for (let c = 0; c < g.W; c++) {
      const col = []; for (let r = g.H - 1; r >= 0; r--) if (g.grid[r][c]) col.push(g.grid[r][c]);
      for (let r = g.H - 1, i = 0; r >= 0; r--, i++) g.grid[r][c] = col[i] || 0;
    }
  }
  function drop(room, col, bomb, auto) {
    const g = room.g, v = g.turn;
    let r = -1; for (let i = g.H - 1; i >= 0; i--) if (!g.grid[i][col]) { r = i; break; }
    if (r < 0) return { error: 'Colonne pleine' };
    g.moves++;
    if (bomb) {
      g.bombs[v]--;
      const hit = [];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = col + dc; if (rr >= 0 && rr < g.H && cc >= 0 && cc < g.W && g.grid[rr][cc]) { hit.push([rr, cc]); g.grid[rr][cc] = 0; } }
      g.blast = { r, c: col, hit, k: Date.now() };
      settle(g);
      g.last = { r, c: col, bomb: true, by: v, k: Date.now() };
      sysMsg(room, `💣 ${P(room, v === 1 ? g.p1 : g.p2)?.name} fait exploser ${hit.length} jeton${hit.length > 1 ? 's' : ''} !`);
      // après une bombe, des lignes peuvent apparaître pour les deux
      const wins = new Set(); let line = null;
      for (let rr = 0; rr < g.H; rr++) for (let cc = 0; cc < g.W; cc++) { const l = findLine(g, rr, cc); if (l) { wins.add(g.grid[rr][cc]); line = line || l; } }
      if (wins.size === 1) { g.line = line; return finish(room, [...wins][0], 'ligne'); }
      if (wins.size === 2) return finish(room, 0, 'double');
    } else {
      g.grid[r][col] = v; g.last = { r, c: col, by: v, k: Date.now(), auto: !!auto }; g.blast = null;
      const line = findLine(g, r, col);
      if (line) { g.line = line; return finish(room, v, 'ligne'); }
    }
    if (g.grid[0].every(x => x)) return finish(room, 0, 'plein');
    g.turn = 3 - v;
    arm(room); pushState(room);
    return { ok: true };
  }
  function finish(room, winner, why) {
    const g = room.g; clear(g);
    g.stage = 'result';
    const wp = winner === 1 ? g.p1 : winner === 2 ? g.p2 : null, lp = winner === 1 ? g.p2 : winner === 2 ? g.p1 : null;
    g.result = { winner, wp, why };
    g.results.push({ p1: g.p1, p2: g.p2, winner });
    if (wp) g.wins[wp] = (g.wins[wp] || 0) + 1; else g.draws++;
    sysMsg(room, wp ? `🏆 ${P(room, wp)?.name} aligne ${g.K} jetons !` : '🤝 Match nul !');
    if (g.queue.length > 2) { const loser = lp || g.queue[Math.random() < .5 ? 0 : 1]; const stay = g.queue.slice(0, 2).find(x => x !== loser); g.queue = [stay, ...g.queue.slice(2), loser]; }
    pushState(room);
    later(room, 5000, () => { if (g.n >= g.total) over(room); else newGame(room); });
    return { ok: true };
  }
  function over(room) {
    const g = room.g; clear(g); g.stage = 'over';
    const pts = (p) => g.wins[p] * 3 + g.results.filter(r => !r.winner && (r.p1 === p || r.p2 === p)).length;
    g.ranking = Object.keys(g.wins).map(p => ({ pid: p, pts: pts(p), wins: g.wins[p] })).sort((a, b) => b.pts - a.pts);
    g.coins = {};
    g.ranking.forEach((r, i) => { g.coins[r.pid] = { coins: 10 + g.wins[r.pid] * 20 + ([25, 12, 6][i] || 0), win: i === 0 && r.pts > 0 }; });
    room.gscores.c4 = room.gscores.c4 || {};
    if (g.ranking[0]?.pts > 0) room.gscores.c4[g.ranking[0].pid] = (room.gscores.c4[g.ranking[0].pid] || 0) + 1;
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
    drop(room, me, { col, bomb } = {}) {
      const g = room.g; if (g.stage !== 'play') return { error: 'Pas maintenant' };
      const v = me.id === g.p1 ? 1 : me.id === g.p2 ? 2 : 0;
      if (!v) return { error: 'Tu regardes cette manche 👀' };
      if (g.turn !== v) return { error: "Ce n'est pas ton tour" };
      col = +col; if (!(col >= 0 && col < g.W)) return { error: 'Colonne ?' };
      if (bomb && !(g.bombs[v] > 0)) return { error: 'Plus de bombe' };
      return drop(room, col, !!bomb);
    },
    hover(room, me, { col } = {}) { const g = room.g; const v = me.id === g.p1 ? 1 : me.id === g.p2 ? 2 : 0; if (g.stage === 'play' && v === g.turn) { g.hoverCol = +col; pushState(room); } },
    emote(room, me, { e } = {}) { if (['👏', '😱', '🤔', '😂', '🔥', '😭', '🐐', '🫡'].includes(e)) { room.g.fx = { e, pid: me.id, k: Date.now() }; pushState(room); } },
    resign(room, me) { const g = room.g; const v = me.id === g.p1 ? 1 : me.id === g.p2 ? 2 : 0; if (g.stage === 'play' && v) finish(room, 3 - v, 'abandon'); },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') over(room); },
  };
  function view(room, pid) {
    const g = room.g, me = pid === g.p1 ? 1 : pid === g.p2 ? 2 : 0;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, mode: g.mode, modeName: MODES[g.mode].name, W: g.W, H: g.H, K: g.K, grid: g.grid, turn: g.turn, me,
      p1: g.p1, p2: g.p2, last: g.last, line: g.line, result: g.result, n: g.n, total: g.total, wins: g.wins, queue: g.queue, bombs: g.bombs, blast: g.blast,
      hoverCol: g.hoverCol, fx: g.fx, left: Math.max(0, g.deadline - Date.now()), time: g.time, moves: g.moves };
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  function onLeave(room) {
    const g = room.g; if (!g) return;
    setTimeout(() => {
      if (room.g !== g || g.stage !== 'play') return;
      for (const [v, p] of [[1, g.p1], [2, g.p2]]) if (!room.players.get(p)?.online) return finish(room, 3 - v, 'depart');
    }, 15000);
  }
  return { id, min: 2, max: 12, defaults, applySettings, start, handlers, view, onLeave };
};
