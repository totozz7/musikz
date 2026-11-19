// PlayZup — QUIZ ! (1 à 12 joueurs) : questions à 4 choix par thème (plus tu réponds vite, plus tu gagnes)
// + manches « 🦄 La moins répondue » : une question ouverte, la bonne réponse donnée par le MOINS de joueurs rapporte le plus.
const { THEMES, RARE } = require('./data-quiz');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'quiz';
  const MIN = 1, MAX = 12;
  const TK = Object.keys(THEMES);
  const defaults = () => ({ count: 15, time: 15, ...Object.fromEntries(TK.map(k => ['t_' + k, true])), t_rare: true });
  function applySettings(room, p) {
    const s = room.gs.quiz;
    if ([10, 15, 20, 30].includes(+p.count)) s.count = +p.count;
    if ([10, 15, 20].includes(+p.time)) s.time = +p.time;
    [...TK, 'rare'].forEach(k => { if (p['t_' + k] !== undefined) s['t_' + k] = p['t_' + k] === true; });
  }
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/['’\-_.!?,;:()&]/g, ' ')
    .replace(/\b(le|la|les|l|un|une|des|du|de|d|the)\b/g, ' ').replace(/\s+/g, ' ').trim().split(' ').map(w => w.length > 3 ? w.replace(/(s|x)$/, '') : w).join(' ');
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // réponse libre → nom canonique (ou null)
  function canon(list, text) {
    const t = norm(text); if (!t) return null;
    const L = list.map(x => { const f = x.split('|'); return { name: f[0], forms: f.map(norm) }; });
    let hit = L.find(x => x.forms.includes(t)); if (hit) return hit.name;
    let best = null, bd = 9;
    L.forEach(x => x.forms.forEach(f => { const tol = f.length >= 9 ? 2 : f.length >= 5 ? 1 : 0; const d = lev(t, f); if (d <= tol && d < bd) { bd = d; best = x.name; } }));
    return best;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);

  function build(s) {
    const themes = TK.filter(k => s['t_' + k]);
    const pool = shuffle(themes.flatMap(k => THEMES[k].q.map(q => ({ type: 'mcq', theme: k, q }))));
    const rares = shuffle(RARE.slice());
    const out = [];
    for (let i = 1; i <= s.count; i++) {
      const wantRare = s.t_rare && (!themes.length || i % 5 === 0);
      if (wantRare && rares.length) out.push({ type: 'rare', theme: 'rare', q: rares.pop() });
      else if (pool.length) out.push(pool.pop());
      else if (rares.length && s.t_rare) out.push({ type: 'rare', theme: 'rare', q: rares.pop() });
    }
    return out.map(x => {
      if (x.type === 'rare') return { type: 'rare', theme: 'rare', text: x.q[0], valid: x.q[1] };
      const opts = shuffle([x.q[1], x.q[2], x.q[3], x.q[4]]);
      return { type: 'mcq', theme: x.theme, text: x.q[0], options: opts, good: opts.indexOf(x.q[1]) };
    });
  }
  function start(room) {
    const s = room.gs.quiz;
    if (!TK.some(k => s['t_' + k]) && !s.t_rare) throw new Error('Choisis au moins un thème');
    const pl = online(room); if (pl.length < MIN) throw new Error('Pas assez de joueurs');
    const qs = build(s);
    room.g = { game: id, stage: 'intro', gameKey: Date.now().toString(36), qs, total: qs.length, n: 0, time: s.time * 1000,
      scores: Object.fromEntries(pl.map(p => [p.id, 0])), streak: {}, prevRank: [], timer: null, deadline: 0 };
    room.phase = 'game';
    sysMsg(room, `❓ QUIZ — ${qs.length} questions · réponds vite pour gagner plus !`);
    broadcast(room);
    later(room, 2600, () => next(room));
    pushState(room);
  }
  function next(room) {
    const g = room.g; clear(g);
    if (g.n >= g.total) return finish(room);
    g.cur = g.qs[g.n]; g.n++;
    g.ans = {}; g.gains = {}; g.groups = null;
    g.stage = 'q'; g.qStart = Date.now();
    g.qTime = g.cur.type === 'rare' ? g.time + 10000 : g.time;
    later(room, g.qTime, () => reveal(room));
    pushState(room);
  }
  function allIn(room) { const g = room.g; return online(room).every(p => g.ans[p.id]); }
  function reveal(room) {
    const g = room.g; clear(g);
    g.prevRank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const q = g.cur;
    if (q.type === 'mcq') {
      Object.keys(g.scores).forEach(pid => {
        const a = g.ans[pid];
        if (a && a.i === q.good) {
          g.streak[pid] = (g.streak[pid] || 0) + 1;
          const speed = Math.max(0, 1 - a.t / g.qTime);
          const bonus = Math.min(300, Math.max(0, g.streak[pid] - 2) * 100);
          g.gains[pid] = Math.round(500 + 500 * speed) + bonus;
        } else { g.streak[pid] = 0; g.gains[pid] = 0; }
      });
    } else {
      const groups = {};
      Object.entries(g.ans).forEach(([pid, a]) => { const c = canon(q.valid, a.text); a.ok = c; if (c) (groups[c] = groups[c] || []).push(pid); });
      const counts = Object.values(groups).map(l => l.length), min = counts.length ? Math.min(...counts) : 0;
      Object.keys(g.scores).forEach(pid => {
        const c = g.ans[pid]?.ok;
        g.gains[pid] = !c ? 0 : groups[c].length === min ? 1000 : 300;
        if (c) g.streak[pid] = (g.streak[pid] || 0) + 1; else g.streak[pid] = 0;
      });
      g.groups = Object.entries(groups).map(([name, pids]) => ({ name, pids, rare: pids.length === min })).sort((a, b) => a.pids.length - b.pids.length);
      g.wrong = Object.entries(g.ans).filter(([, a]) => !a.ok).map(([pid, a]) => ({ pid, text: a.text }));
      const said = new Set(Object.keys(groups));
      g.ideas = shuffle(q.valid.map(v => v.split('|')[0]).filter(v => !said.has(v))).slice(0, 6);
    }
    Object.entries(g.gains).forEach(([pid, n]) => { g.scores[pid] = (g.scores[pid] || 0) + n; });
    g.stage = 'reveal';
    later(room, q.type === 'rare' ? 7500 : 5200, () => next(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 10 + Math.round(pts / 250) + (rank.length > 1 ? [30, 15, 8][i] || 0 : 0), win: i === 0 }; });
    room.gscores.quiz = room.gscores.quiz || {};
    if (rank[0] && rank.length > 1) room.gscores.quiz[rank[0][0]] = (room.gscores.quiz[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 QUIZ : ${room.players.get(rank[0]?.[0])?.name || '?'} gagne avec ${rank[0]?.[1] || 0} pts !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    pick(room, me, i) {
      const g = room.g; if (g.stage !== 'q' || g.cur.type !== 'mcq') return { error: 'Trop tard' };
      if (g.ans[me.id]) return { error: 'Déjà répondu' };
      i = +i; if (!(i >= 0 && i < 4)) return { error: 'Choix invalide' };
      g.ans[me.id] = { i, t: Date.now() - g.qStart };
      if (!(me.id in g.scores)) g.scores[me.id] = 0;
      if (allIn(room)) reveal(room); else pushState(room);
      return { ok: true };
    },
    say(room, me, text) {
      const g = room.g; if (g.stage !== 'q' || g.cur.type !== 'rare') return { error: 'Trop tard' };
      if (g.ans[me.id]) return { error: 'Déjà répondu' };
      text = String(text || '').trim().slice(0, 40); if (!text) return { error: 'Écris une réponse' };
      g.ans[me.id] = { text, t: Date.now() - g.qStart };
      if (!(me.id in g.scores)) g.scores[me.id] = 0;
      if (allIn(room)) reveal(room); else pushState(room);
      return { ok: true };
    },
    skip(room, me) { const g = room.g; if (room.hostId === me.id && g.stage === 'q') reveal(room); },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') finish(room); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function view(room, pid) {
    const g = room.g, q = g.cur, rv = g.stage === 'reveal';
    const th = q ? (q.theme === 'rare' ? { name: 'La moins répondue', emoji: '🦄' } : { name: THEMES[q.theme].name, emoji: THEMES[q.theme].emoji }) : null;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, n: g.n, total: g.total, me: pid, scores: g.scores, streak: g.streak,
      left: Math.max(0, g.deadline - Date.now()), qTime: g.qTime, key: g.gameKey + ':' + g.n, prevRank: g.prevRank,
      answered: Object.keys(g.ans || {}), mine: g.ans?.[pid] ? (q.type === 'mcq' ? { i: g.ans[pid].i } : { text: g.ans[pid].text }) : null };
    if (q) v.q = { type: q.type, theme: th, text: q.text, options: q.options };
    if (rv) {
      v.gains = g.gains;
      if (q.type === 'mcq') { v.good = q.good; v.picks = Object.fromEntries(Object.entries(g.ans).map(([p, a]) => [p, a.i])); }
      else { v.groups = g.groups; v.wrong = g.wrong; v.ideas = g.ideas; }
    }
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  function onLeave(room) { const g = room.g; if (g?.stage === 'q' && allIn(room) && Object.keys(g.ans).length) reveal(room); }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, _canon: canon };
};
