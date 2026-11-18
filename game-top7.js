// PlayZup — TOP 7 (1 à 10 joueurs), inspiré des « panels » télé : un thème, les 7 réponses préférées des gens.
// Chacun son tour, on propose une réponse : si elle est dans le top, on gagne son rang en points
// (la n°1, la plus évidente = 1 point… la n°7, la plus rare = 7 points). Raté = 0.
const THEMES = require('./data-top7');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'top7';
  const MIN = 1, MAX = 10;
  const defaults = () => ({ rounds: 5, time: 20, tries: 3 });
  function applySettings(room, p) {
    const s = room.gs.top7;
    if ([3, 5, 8, 12].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([15, 20, 30].includes(+p.time)) s.time = +p.time;
    if ([2, 3, 4].includes(+p.tries)) s.tries = +p.tries;
  }
  // ── comparaison tolérante (accents, articles, pluriels, petites fautes) ──
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/['’\-_.!?,;:()&]/g, ' ')
    .replace(/\b(le|la|les|l|un|une|des|du|de|d|au|aux|en|a|the)\b/g, ' ').replace(/\s+/g, ' ').trim()
    .split(' ').map(w => w.length > 3 ? w.replace(/(s|x)$/, '') : w).join(' ');
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function match(theme, text) { // → index 0..6 ou -1
    const t = norm(text); if (!t) return -1;
    const al = theme.answers.map(a => a.map(norm));
    let i = al.findIndex(l => l.includes(t)); if (i >= 0) return i;
    let best = -1, bd = 9;
    al.forEach((l, k) => l.forEach(x => { const tol = x.length >= 9 ? 2 : x.length >= 5 ? 1 : 0; const d = lev(t, x); if (d <= tol && d < bd) { bd = d; best = k; } }));
    if (best >= 0) return best;
    let bl = 0; // la réponse contient une des formes (mot entier), on garde la plus longue
    al.forEach((l, k) => l.forEach(x => { if (x.length >= 3 && x.length > bl && (' ' + t + ' ').includes(' ' + x + ' ')) { bl = x.length; best = k; } }));
    return best;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);

  function start(room) {
    const s = room.gs.top7;
    const pl = online(room); if (pl.length < MIN) throw new Error('Pas assez de joueurs');
    const deck = shuffle(THEMES.map((t, i) => i)).slice(0, s.rounds).map(i => ({ emoji: THEMES[i][0], title: THEMES[i][1], answers: THEMES[i][2] }));
    room.g = { game: id, stage: 'intro', gameKey: Date.now().toString(36), deck, total: deck.length, n: 0, time: s.time * 1000, tries: s.tries,
      order: shuffle(pl.map(p => p.id)), scores: Object.fromEntries(pl.map(p => [p.id, 0])), timer: null, deadline: 0, log: [] };
    room.phase = 'game';
    sysMsg(room, `7️⃣ TOP 7 — ${deck.length} thèmes · ${s.tries} essais chacun par thème · trouve les réponses les plus RARES du top !`);
    broadcast(room);
    nextTheme(room);
  }
  function nextTheme(room) {
    const g = room.g; clear(g);
    if (g.n >= g.total) return finish(room);
    g.theme = g.deck[g.n]; g.n++;
    g.board = g.theme.answers.map(() => null); // null ou { by, text }
    g.used = {}; g.guesses = []; g.turn = -1; g.result = null;
    g.first = (g.n - 1) % g.order.length; // chacun commence à son tour
    g.stage = 'intro';
    later(room, 3800, () => nextTurn(room));
    pushState(room);
  }
  function roundDone(g, room) {
    if (g.board.every(Boolean)) return true;
    return g.order.every(pid => !room.players.get(pid)?.online || (g.used[pid] || 0) >= g.tries);
  }
  function nextTurn(room) {
    const g = room.g; clear(g);
    if (roundDone(g, room)) return revealRest(room);
    // prochain joueur en ligne qui a encore des essais
    for (let k = 0; k < g.order.length; k++) {
      g.turn++;
      const pid = g.order[(g.first + g.turn) % g.order.length];
      const p = room.players.get(pid);
      if (p?.online && (g.used[pid] || 0) < g.tries) { g.cur = pid; break; }
    }
    g.stage = 'turn'; g.result = null; g.typing = '';
    later(room, g.time, () => answer(room, g.cur, null));
    pushState(room);
  }
  function answer(room, pid, text) {
    const g = room.g; if (g.stage !== 'turn' || g.cur !== pid) return;
    clear(g);
    g.used[pid] = (g.used[pid] || 0) + 1;
    const raw = String(text || '').trim().slice(0, 50);
    let i = raw ? match(g.theme, raw) : -1, why = raw ? 'miss' : 'late', pts = 0;
    if (i >= 0 && g.board[i]) why = 'dup';
    else if (i >= 0) { why = 'hit'; pts = i + 1; g.board[i] = { by: pid, text: raw }; g.scores[pid] = (g.scores[pid] || 0) + pts; }
    g.result = { pid, text: raw, i: why === 'hit' || why === 'dup' ? i : -1, why, pts, k: Date.now() };
    g.guesses.push(g.result);
    g.stage = 'result';
    later(room, why === 'hit' ? 2600 : 1900, () => nextTurn(room));
    pushState(room);
  }
  function revealRest(room) {
    const g = room.g; clear(g);
    g.stage = 'reveal'; g.result = null;
    const missing = g.board.filter(b => !b).length;
    later(room, 2600 + missing * 700, () => nextTheme(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 10 + pts + (rank.length > 1 ? [30, 15, 8][i] || 0 : 0), win: i === 0 }; });
    room.gscores.top7 = room.gscores.top7 || {};
    if (rank[0] && rank.length > 1) room.gscores.top7[rank[0][0]] = (room.gscores.top7[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 TOP 7 : ${room.players.get(rank[0]?.[0])?.name || '?'} gagne avec ${rank[0]?.[1] || 0} pts !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    answer(room, me, text) {
      const g = room.g; if (g.stage !== 'turn' || g.cur !== me.id) return { error: 'Ce n\'est pas ton tour' };
      if (!String(text || '').trim()) return { error: 'Écris une réponse' };
      answer(room, me.id, text);
      return { ok: true };
    },
    typing(room, me, n) { // petit indicateur « en train d'écrire »
      const g = room.g; if (g.stage !== 'turn' || g.cur !== me.id) return;
      const t = Math.max(0, Math.min(40, +n || 0)); if (t === g.typing) return; g.typing = t; pushState(room);
    },
    skip(room, me) { const g = room.g; if (room.hostId === me.id && g.stage === 'turn') answer(room, g.cur, null); },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') finish(room); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function view(room, pid) {
    const g = room.g;
    const showAll = g.stage === 'reveal' || g.stage === 'over';
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, n: g.n, total: g.total, me: pid, scores: g.scores, order: g.order, cur: g.cur, tries: g.tries,
      used: g.used, left: Math.max(0, g.deadline - Date.now()), time: g.time, typing: g.typing || 0, result: g.result,
      theme: g.theme ? { emoji: g.theme.emoji, title: g.theme.title } : null, round: g.gameKey + ':' + g.n,
      board: (g.board || []).map((b, i) => b ? { rank: i + 1, text: g.theme.answers[i][0], by: b.by, said: b.text } : showAll ? { rank: i + 1, text: g.theme.answers[i][0], missed: true } : { rank: i + 1 }),
      guesses: (g.guesses || []).slice(-8) };
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  function onLeave(room, pid) { const g = room.g; if (g?.stage === 'turn' && g.cur === pid) answer(room, pid, null); }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, _match: match, _norm: norm };
};
