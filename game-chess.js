// PlayZup — ÉCHECS (2 joueurs, les autres regardent et parient). Modes : classique, Chess960, Roi de la colline,
// 3 échecs, Brouillard de guerre. Pendules, nulle, abandon. À plus de 2 : « le roi reste » (le gagnant garde sa place).
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'chess';
  const MIN = 2, MAX = 12;
  const MODES = { classic: '♟️ Classique', c960: '🎲 Chess960', hill: '⛰️ Roi de la colline', check3: '3️⃣ Trois échecs', fog: '🌫️ Brouillard' };
  const TIMES = { '3+2': [3, 2], '5+3': [5, 3], '10+0': [10, 0], '15+10': [15, 10], none: [0, 0] };
  const defaults = () => ({ mode: 'classic', time: '5+3', games: 1 });
  function applySettings(room, p) {
    const s = room.gs.chess;
    if (MODES[p.mode]) s.mode = p.mode;
    if (TIMES[p.time]) s.time = p.time;
    if ([1, 3, 5].includes(+p.games)) s.games = +p.games;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const P = (room, pid) => room.players.get(pid);

  // ───────────── moteur ─────────────
  // case = 0..63, 0 = a8, 7 = h8, 56 = a1, 63 = h1. Pièce = { t: 'KQRBNP', c: 'w'|'b', id }
  const F = (s) => s & 7, R = (s) => s >> 3; // R = 0 → rangée 8
  const sqName = (s) => 'abcdefgh'[F(s)] + (8 - R(s));
  const at = (f, r) => (f < 0 || f > 7 || r < 0 || r > 7) ? -1 : r * 8 + f;
  const opp = (c) => c === 'w' ? 'b' : 'w';
  const KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  const KG = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]], ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function setup(mode) {
    let back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    if (mode === 'c960') {
      for (;;) {
        back = shuffle(back.slice());
        const b = back.map((x, i) => x === 'B' ? i % 2 : -1).filter(x => x >= 0);
        const k = back.indexOf('K'), r1 = back.indexOf('R'), r2 = back.lastIndexOf('R');
        if (b[0] !== b[1] && r1 < k && k < r2) break;
      }
    }
    const B = Array(64).fill(null); let n = 0;
    for (let f = 0; f < 8; f++) {
      B[at(f, 0)] = { t: back[f], c: 'b', id: n++ }; B[at(f, 1)] = { t: 'P', c: 'b', id: n++ };
      B[at(f, 6)] = { t: 'P', c: 'w', id: n++ }; B[at(f, 7)] = { t: back[f], c: 'w', id: n++ };
    }
    const cast = mode === 'c960' ? {} : { wK: true, wQ: true, bK: true, bQ: true };
    return { B, turn: 'w', cast, ep: -1, half: 0, full: 1 };
  }
  function attacked(B, s, by) {
    const f = F(s), r = R(s);
    const dir = by === 'w' ? 1 : -1; // un pion blanc attaque vers le haut (r - 1)
    for (const df of [-1, 1]) { const q = at(f + df, r + dir); if (q >= 0 && B[q]?.c === by && B[q].t === 'P') return true; }
    for (const [a, b] of KN) { const q = at(f + a, r + b); if (q >= 0 && B[q]?.c === by && B[q].t === 'N') return true; }
    for (const [a, b] of KG) { const q = at(f + a, r + b); if (q >= 0 && B[q]?.c === by && B[q].t === 'K') return true; }
    for (const [dirs, ts] of [[DIAG, 'BQ'], [ORTH, 'RQ']]) for (const [a, b] of dirs) {
      for (let k = 1; ; k++) { const q = at(f + a * k, r + b * k); if (q < 0) break; const p = B[q]; if (p) { if (p.c === by && ts.includes(p.t)) return true; break; } }
    }
    return false;
  }
  const kingSq = (B, c) => B.findIndex(p => p && p.c === c && p.t === 'K');
  const inCheck = (st, c) => { const k = kingSq(st.B, c); return k >= 0 && attacked(st.B, k, opp(c)); };

  function pseudo(st, c, fog) {
    const B = st.B, out = [];
    const add = (from, to, extra = {}) => {
      if (B[from].t === 'P' && (R(to) === 0 || R(to) === 7)) for (const pr of ['Q', 'R', 'B', 'N']) out.push({ from, to, promo: pr, ...extra });
      else out.push({ from, to, ...extra });
    };
    for (let s = 0; s < 64; s++) {
      const p = B[s]; if (!p || p.c !== c) continue;
      const f = F(s), r = R(s);
      if (p.t === 'P') {
        const d = c === 'w' ? -1 : 1, start = c === 'w' ? 6 : 1;
        const one = at(f, r + d);
        if (one >= 0 && !B[one]) { add(s, one); const two = at(f, r + 2 * d); if (r === start && !B[two]) out.push({ from: s, to: two, double: true }); }
        for (const df of [-1, 1]) {
          const q = at(f + df, r + d); if (q < 0) continue;
          if (B[q] && B[q].c !== c) add(s, q);
          else if (q === st.ep) out.push({ from: s, to: q, ep: true });
        }
      } else if (p.t === 'N' || p.t === 'K') {
        for (const [a, b] of (p.t === 'N' ? KN : KG)) { const q = at(f + a, r + b); if (q >= 0 && B[q]?.c !== c) add(s, q); }
      } else {
        const dirs = p.t === 'B' ? DIAG : p.t === 'R' ? ORTH : [...DIAG, ...ORTH];
        for (const [a, b] of dirs) for (let k = 1; ; k++) { const q = at(f + a * k, r + b * k); if (q < 0) break; if (B[q]) { if (B[q].c !== c) add(s, q); break; } add(s, q); }
      }
    }
    // roque (pas en Chess960)
    const home = c === 'w' ? 7 : 0, ks = at(4, home);
    if (B[ks]?.t === 'K' && B[ks].c === c && (fog || !attacked(B, ks, opp(c)))) {
      if (st.cast[c + 'K'] && B[at(7, home)]?.t === 'R' && !B[at(5, home)] && !B[at(6, home)] && (fog || (!attacked(B, at(5, home), opp(c)) && !attacked(B, at(6, home), opp(c)))))
        out.push({ from: ks, to: at(6, home), castle: 'K' });
      if (st.cast[c + 'Q'] && B[at(0, home)]?.t === 'R' && !B[at(1, home)] && !B[at(2, home)] && !B[at(3, home)] && (fog || (!attacked(B, at(3, home), opp(c)) && !attacked(B, at(2, home), opp(c)))))
        out.push({ from: ks, to: at(2, home), castle: 'Q' });
    }
    return out;
  }
  function apply(st, m) {
    const B = st.B.slice(), p = B[m.from], c = p.c, home = c === 'w' ? 7 : 0;
    let cap = B[m.to];
    if (m.ep) { const q = at(F(m.to), R(m.from)); cap = B[q]; B[q] = null; }
    B[m.to] = m.promo ? { t: m.promo, c, id: p.id } : p; B[m.from] = null;
    if (m.castle === 'K') { B[at(5, home)] = B[at(7, home)]; B[at(7, home)] = null; }
    if (m.castle === 'Q') { B[at(3, home)] = B[at(0, home)]; B[at(0, home)] = null; }
    const cast = { ...st.cast };
    if (p.t === 'K') { cast[c + 'K'] = cast[c + 'Q'] = false; }
    for (const [sq, k] of [[63, 'wK'], [56, 'wQ'], [7, 'bK'], [0, 'bQ']]) if (m.from === sq || m.to === sq) cast[k] = false;
    return { B, turn: opp(c), cast, ep: m.double ? (m.from + m.to) / 2 : -1, half: (p.t === 'P' || cap) ? 0 : st.half + 1, full: st.full + (c === 'b' ? 1 : 0), cap };
  }
  function legal(st, c, fog) {
    const ps = pseudo(st, c, fog);
    if (fog) return ps;
    return ps.filter(m => !inCheck(apply(st, m), c));
  }
  const posKey = (st) => st.B.map(p => p ? (p.c === 'w' ? p.t : p.t.toLowerCase()) : '.').join('') + st.turn + Object.keys(st.cast).filter(k => st.cast[k]).join('') + st.ep;
  function material(B) {
    const left = B.filter(p => p && p.t !== 'K');
    if (!left.length) return true;
    if (left.length === 1 && 'BN'.includes(left[0].t)) return true;
    return false;
  }
  const FR = { K: 'R', Q: 'D', R: 'T', B: 'F', N: 'C', P: '' };
  function san(st, m, list, after, fog) {
    const p = st.B[m.from];
    let s;
    if (m.castle) s = m.castle === 'K' ? 'O-O' : 'O-O-O';
    else {
      const cap = st.B[m.to] || m.ep;
      let dis = '';
      if (p.t !== 'P') {
        const twins = list.filter(o => o.to === m.to && o.from !== m.from && st.B[o.from].t === p.t);
        if (twins.length) dis = twins.some(o => F(o.from) === F(m.from)) ? sqName(m.from)[1] : sqName(m.from)[0];
        if (twins.some(o => F(o.from) === F(m.from)) && twins.some(o => R(o.from) === R(m.from))) dis = sqName(m.from);
      }
      s = FR[p.t] + dis + (cap ? (p.t === 'P' ? sqName(m.from)[0] : '') + 'x' : '') + sqName(m.to) + (m.promo ? '=' + FR[m.promo] : '');
    }
    if (!fog && inCheck(after, after.turn)) s += legal(after, after.turn, false).length ? '+' : '#';
    return s;
  }
  const VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

  // ───────────── partie ─────────────
  function start(room) {
    const s = room.gs.chess;
    const pl = online(room); if (pl.length < MIN) throw new Error('Il faut 2 joueurs');
    const queue = shuffle(pl.map(p => p.id));
    room.g = { game: id, stage: 'intro', gameKey: Date.now().toString(36), mode: s.mode, time: s.time, total: s.games, n: 0, queue,
      wins: Object.fromEntries(pl.map(p => [p.id, 0])), draws: 0, bets: {}, betPts: {}, timer: null, deadline: 0, results: [] };
    room.phase = 'game';
    sysMsg(room, `♟️ ÉCHECS — ${MODES[s.mode]} · ${s.time === 'none' ? 'sans pendule' : s.time + ' min'} · ${s.games} partie${s.games > 1 ? 's' : ''}${pl.length > 2 ? ' · le gagnant reste à la table !' : ''}`);
    broadcast(room);
    newGame(room);
  }
  function newGame(room) {
    const g = room.g; clear(g);
    const on = g.queue.filter(x => room.players.get(x)?.online);
    g.queue = [...on, ...g.queue.filter(x => !on.includes(x))];
    if (on.length < 2) return over(room);
    g.n++;
    const [a, b] = g.queue;
    // on alterne les couleurs si ce sont les mêmes joueurs que la partie d'avant
    const prev = g.results[g.results.length - 1];
    const swap = prev && prev.w === a && prev.b === b;
    g.white = swap ? b : a; g.black = swap ? a : b;
    if (!prev) { if (Math.random() < .5) [g.white, g.black] = [g.black, g.white]; }
    g.st = setup(g.mode); g.hist = []; g.moves = []; g.last = null; g.checks = { w: 0, b: 0 }; g.reps = {}; g.reps[posKey(g.st)] = 1;
    g.captured = { w: [], b: [] }; g.drawOffer = null; g.result = null; g.bets = {}; g.fx = null;
    const [mn, inc] = TIMES[g.time];
    g.clock = mn ? { w: mn * 60000, b: mn * 60000, inc: inc * 1000 } : null; g.turnAt = Date.now(); g.started = false;
    g.stage = 'play';
    sysMsg(room, `♟️ Partie ${g.n}/${g.total} : ⚪ ${P(room, g.white)?.name} contre ⚫ ${P(room, g.black)?.name}`);
    armClock(room);
    pushState(room);
  }
  function armClock(room) {
    const g = room.g;
    if (!g.clock || !g.started) { clear(g); g.deadline = 0; return; }
    const c = g.st.turn;
    later(room, Math.max(0, g.clock[c]), () => finish(room, opp(c), 'temps'));
  }
  function spend(g) {
    if (!g.clock || !g.started) return;
    const c = g.st.turn; g.clock[c] = Math.max(0, g.clock[c] - (Date.now() - g.turnAt));
  }
  const colorOf = (g, pid) => pid === g.white ? 'w' : pid === g.black ? 'b' : null;
  function finish(room, winner, why) {
    const g = room.g; if (g.stage !== 'play') return;
    clear(g); spend(g);
    g.stage = 'result';
    const wp = winner === 'w' ? g.white : winner === 'b' ? g.black : null, lp = winner === 'w' ? g.black : winner === 'b' ? g.white : null;
    g.result = { winner, why, wp };
    g.results.push({ w: g.white, b: g.black, winner, why });
    if (wp) g.wins[wp] = (g.wins[wp] || 0) + 1; else g.draws++;
    // paris des spectateurs
    for (const [sp, bet] of Object.entries(g.bets)) if ((bet === 'draw' && !wp) || bet === wp) g.betPts[sp] = (g.betPts[sp] || 0) + 1;
    const txt = { mat: 'échec et mat', temps: 'au temps', abandon: 'par abandon', colline: 'roi au sommet de la colline', echecs3: 'trois échecs', roi: 'roi capturé', pat: 'pat', nulle: 'nulle acceptée', repet: 'triple répétition', '50': 'règle des 50 coups', materiel: 'matériel insuffisant', depart: 'adversaire parti' }[why] || why;
    sysMsg(room, wp ? `🏆 ${P(room, wp)?.name} gagne (${txt}) !` : `🤝 Partie nulle (${txt}).`);
    // file d'attente : le gagnant reste, le perdant passe derrière
    if (g.queue.length > 2) {
      const loser = lp || g.queue[Math.random() < .5 ? 0 : 1];
      const stay = g.queue.slice(0, 2).find(x => x !== loser);
      g.queue = [stay, ...g.queue.slice(2), loser];
    }
    pushState(room);
    later(room, 7000, () => { if (g.n >= g.total) over(room); else newGame(room); });
  }
  function over(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const ids = Object.keys(g.wins);
    const pts = (p) => g.wins[p] * 3 + g.results.filter(r => !r.winner && (r.w === p || r.b === p)).length + (g.betPts[p] || 0);
    g.ranking = ids.map(p => ({ pid: p, pts: pts(p), wins: g.wins[p] })).sort((a, b) => b.pts - a.pts || b.wins - a.wins);
    g.coins = {};
    g.ranking.forEach((r, i) => { g.coins[r.pid] = { coins: 15 + g.wins[r.pid] * 25 + (g.betPts[r.pid] || 0) * 10 + ([30, 15, 8][i] || 0), win: i === 0 && r.pts > 0 }; });
    room.gscores.chess = room.gscores.chess || {};
    const top = g.ranking[0]; if (top && top.pts > 0) room.gscores.chess[top.pid] = (room.gscores.chess[top.pid] || 0) + 1;
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  function afterMove(room, m, list) {
    const g = room.g, st = g.st, c = st.turn, fog = g.mode === 'fog';
    const nx = apply(st, m);
    const text = san(st, m, list, nx, fog);
    spend(g);
    if (g.clock && g.started) g.clock[c] += g.clock.inc;
    g.started = true;
    if (nx.cap) g.captured[c].push(nx.cap.t);
    g.hist.push(st); g.moves.push({ san: text, c });
    g.last = { from: m.from, to: m.to, cap: !!nx.cap, castle: m.castle || null, promo: m.promo || null, by: c };
    delete nx.cap;
    g.st = nx; g.turnAt = Date.now(); g.drawOffer = null;
    const k = posKey(nx); g.reps[k] = (g.reps[k] || 0) + 1;
    // fins de partie
    if (fog) { if (kingSq(nx.B, opp(c)) < 0) return finish(room, c, 'roi'); }
    const chk = !fog && inCheck(nx, nx.turn);
    if (chk) g.checks[c]++;
    if (g.mode === 'hill') { const ks = kingSq(nx.B, c); if ([27, 28, 35, 36].includes(ks)) return finish(room, c, 'colline'); }
    if (g.mode === 'check3' && g.checks[c] >= 3) return finish(room, c, 'echecs3');
    if (!fog) {
      const moves = legal(nx, nx.turn, false);
      if (!moves.length) return finish(room, chk ? c : null, chk ? 'mat' : 'pat');
    }
    if (g.reps[k] >= 3) return finish(room, null, 'repet');
    if (nx.half >= 100) return finish(room, null, '50');
    if (!fog && material(nx.B)) return finish(room, null, 'materiel');
    armClock(room);
    pushState(room);
  }
  const handlers = {
    move(room, me, { from, to, promo } = {}) {
      const g = room.g; if (g.stage !== 'play') return { error: 'Pas maintenant' };
      const c = colorOf(g, me.id); if (!c) return { error: 'Tu regardes cette partie 👀' };
      if (g.st.turn !== c) return { error: "Ce n'est pas ton tour" };
      const list = legal(g.st, c, g.mode === 'fog');
      const m = list.find(x => x.from === +from && x.to === +to && (!x.promo || x.promo === (promo || 'Q')));
      if (!m) return { error: 'Coup impossible' };
      afterMove(room, m, list);
      return { ok: true };
    },
    resign(room, me) {
      const g = room.g, c = colorOf(g, me.id); if (g.stage !== 'play' || !c) return;
      finish(room, opp(c), 'abandon');
    },
    draw(room, me) {
      const g = room.g, c = colorOf(g, me.id); if (g.stage !== 'play' || !c) return;
      if (g.drawOffer && g.drawOffer !== c) return finish(room, null, 'nulle');
      g.drawOffer = c; sysMsg(room, `🤝 ${me.name} propose la nulle`); pushState(room);
    },
    nodraw(room, me) { const g = room.g, c = colorOf(g, me.id); if (g.stage === 'play' && c && g.drawOffer && g.drawOffer !== c) { g.drawOffer = null; pushState(room); } },
    bet(room, me, { on } = {}) {
      const g = room.g; if (g.stage !== 'play' || colorOf(g, me.id)) return;
      if (g.moves.length >= 6) return { error: 'Les paris sont fermés après 3 coups' };
      if (![g.white, g.black, 'draw'].includes(on)) return;
      g.bets[me.id] = on; pushState(room); return { ok: true };
    },
    emote(room, me, { e } = {}) {
      const g = room.g; if (!['👏', '😱', '🤔', '😂', '🔥', '🫡', '😭', '🐐'].includes(e)) return;
      g.fx = { e, pid: me.id, k: Date.now() }; pushState(room);
    },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') over(room); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function visibleFor(g, c) {
    // brouillard : tes cases + celles où tes pièces peuvent aller
    const vis = new Set();
    g.st.B.forEach((p, s) => { if (p && p.c === c) vis.add(s); });
    pseudo({ ...g.st, turn: c }, c, true).forEach(m => vis.add(m.to));
    // les cases attaquées en diagonale par tes pions
    g.st.B.forEach((p, s) => { if (p && p.c === c && p.t === 'P') { const d = c === 'w' ? -1 : 1; for (const df of [-1, 1]) { const q = at(F(s) + df, R(s) + d); if (q >= 0) vis.add(q); } } });
    return vis;
  }
  function view(room, pid) {
    const g = room.g, c = colorOf(g, pid);
    const fogged = g.mode === 'fog' && g.stage === 'play' && c;
    const vis = fogged ? visibleFor(g, c) : null;
    const board = g.st.B.map((p, s) => p && (!vis || vis.has(s) || p.c === c) ? { t: p.t, c: p.c, id: p.id } : null);
    let moves = null;
    if (g.stage === 'play' && c && g.st.turn === c) {
      moves = {};
      for (const m of legal(g.st, c, g.mode === 'fog')) (moves[m.from] = moves[m.from] || []).includes(m.to) || moves[m.from].push(m.to);
    }
    const clock = g.clock ? { w: g.clock.w - (g.started && g.stage === 'play' && g.st.turn === 'w' ? Date.now() - g.turnAt : 0), b: g.clock.b - (g.started && g.stage === 'play' && g.st.turn === 'b' ? Date.now() - g.turnAt : 0), inc: g.clock.inc } : null;
    const lastVisible = g.last && (!vis || (vis.has(g.last.to) || g.last.by === c)) ? g.last : (g.last ? { by: g.last.by, hidden: true } : null);
    const check = !fogged && g.stage !== 'over' && inCheck(g.st, g.st.turn) ? kingSq(g.st.B, g.st.turn) : -1;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, me: pid, color: c, mode: g.mode, modeName: MODES[g.mode], time: g.time,
      n: g.n, total: g.total, white: g.white, black: g.black, queue: g.queue, wins: g.wins, draws: g.draws,
      board, vis: vis ? [...vis] : null, turn: g.st.turn, moves, last: lastVisible, check, clock, ticking: g.started && g.stage === 'play',
      checks: g.checks, captured: g.captured, hist: g.moves.map(m => (fogged && m.c !== c) ? '?' : m.san), drawOffer: g.drawOffer,
      result: g.result, bets: g.bets, myBet: g.bets[pid] || null, betPts: g.betPts, fx: g.fx, left: Math.max(0, g.deadline - Date.now()) };
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  function onLeave(room, pid) {
    const g = room.g; if (!g) return;
    setTimeout(() => {
      if (room.g !== g || g.stage !== 'play') return;
      for (const [c, p] of [['w', g.white], ['b', g.black]]) if (!room.players.get(p)?.online) {
        g.queue = g.queue.filter(x => x !== p).concat(g.queue.includes(p) ? [p] : []);
        return finish(room, opp(c), 'depart');
      }
    }, 20000);
  }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, _eng: { setup, legal, apply, inCheck } };
};
