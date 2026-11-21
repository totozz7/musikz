// PlayZup — MINI-GOLF (1 à 8 joueurs, tout le monde joue en même temps, les balles des autres sont des fantômes).
// La physique tourne sur le serveur : chaque tir renvoie la trajectoire complète, que tous les écrans rejouent.
const HOLES = require('./data-golf');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'golf';
  const BR = 9, CUP = 15, DT = 1 / 240, FPS = 30;
  const defaults = () => ({ holes: 9, course: 'mix', time: 120 });
  function applySettings(room, p) {
    const s = room.gs.golf;
    if ([3, 6, 9, 18].includes(+p.holes)) s.holes = +p.holes;
    if (['mix', '0', '1', '2', 'all'].includes(String(p.course))) s.course = String(p.course);
    if ([60, 120, 180].includes(+p.time)) s.time = +p.time;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const P = (room, pid) => room.players.get(pid);

  // ───────── géométrie ─────────
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  function segsOf(h) {
    const s = [];
    const o = h.outline; for (let i = 0; i < o.length; i++) { const a = o[i], b = o[(i + 1) % o.length]; s.push([a[0], a[1], b[0], b[1], 6]); }
    (h.walls || []).forEach(w => s.push([...w, 7]));
    return s;
  }
  const millAngle = (m, t) => m.w * t;
  function millSegs(m, t) {
    const out = [], a0 = millAngle(m, t);
    for (let k = 0; k < m.n; k++) { const a = a0 + k * Math.PI * 2 / m.n; out.push([m.x + Math.cos(a) * 16, m.y + Math.sin(a) * 16, m.x + Math.cos(a) * m.r, m.y + Math.sin(a) * m.r, 6, m]); }
    return out;
  }
  const sliderPos = (s, t) => { const f = (1 - Math.cos(2 * Math.PI * t / s.period)) / 2; return [s.a[0] + (s.b[0] - s.a[0]) * f, s.a[1] + (s.b[1] - s.a[1]) * f]; };
  function sliderSegs(s, t) {
    const [cx, cy] = sliderPos(s, t), w = s.w / 2, h = s.h / 2;
    const c = [[cx - w, cy - h], [cx + w, cy - h], [cx + w, cy + h], [cx - w, cy + h]];
    const dt = .01, [nx, ny] = sliderPos(s, t + dt), vx = (nx - cx) / dt, vy = (ny - cy) / dt;
    return c.map((p, i) => [p[0], p[1], c[(i + 1) % 4][0], c[(i + 1) % 4][1], 2, { vx, vy }]);
  }
  function collide(b, seg, restit) {
    const [x1, y1, x2, y2, th, mover] = seg;
    const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
    let u = L2 ? ((b.x - x1) * dx + (b.y - y1) * dy) / L2 : 0; u = Math.max(0, Math.min(1, u));
    const qx = x1 + u * dx, qy = y1 + u * dy;
    let nx = b.x - qx, ny = b.y - qy; const d = Math.hypot(nx, ny), R = BR + th;
    if (d >= R || d === 0) return 0;
    nx /= d; ny /= d;
    b.x = qx + nx * R; b.y = qy + ny * R;
    // vitesse de l'obstacle au point de contact (moulin qui tourne, bloc qui glisse)
    let mvx = 0, mvy = 0;
    if (mover && mover.w !== undefined) { const rx = qx - mover.x, ry = qy - mover.y; mvx = -mover.w * ry; mvy = mover.w * rx; }
    else if (mover) { mvx = mover.vx; mvy = mover.vy; }
    const rvx = b.vx - mvx, rvy = b.vy - mvy, vn = rvx * nx + rvy * ny;
    if (vn < 0) { b.vx -= (1 + restit) * vn * nx; b.vy -= (1 + restit) * vn * ny; return Math.abs(vn); }
    return 0;
  }
  // simulation d'un tir → trajectoire + évènements
  function simulate(h, x, y, ang, pow, t0) {
    const b = { x, y, vx: Math.cos(ang) * (60 + pow * 1180), vy: Math.sin(ang) * (60 + pow * 1180) };
    const segs = segsOf(h), frames = [[Math.round(x), Math.round(y)]], ev = [];
    let t = 0, acc = 0, portalCD = 0, lastSurf = 'grass', boostCD = 0, wallCD = 0, result = 'stop';
    const MAXT = 14;
    while (t < MAXT) {
      t += DT; acc += DT; portalCD -= DT; boostCD -= DT; wallCD -= DT;
      const T = t0 + t;
      // surface
      const surf = (h.water || []).some(p => inPoly(b.x, b.y, p)) && !(h.bridges || []).some(p => inPoly(b.x, b.y, p)) && !(h.islands || []).some(p => inPoly(b.x, b.y, p)) ? 'water' : (h.sand || []).some(p => inPoly(b.x, b.y, p)) ? 'sand' : (h.ice || []).some(p => inPoly(b.x, b.y, p)) ? 'ice' : 'grass';
      if (surf === 'water') { ev.push({ t, k: 'splash', x: Math.round(b.x), y: Math.round(b.y) }); result = 'water'; break; }
      if (surf !== lastSurf && surf === 'sand') ev.push({ t, k: 'sand' });
      lastSurf = surf;
      // vent
      [...(h.wind || []), ...(h.slopes || [])].forEach(w => { if (inPoly(b.x, b.y, w.poly)) { b.vx += w.dir[0] * w.f * DT; b.vy += w.dir[1] * w.f * DT; } });
      // accélérateurs
      (h.boosts || []).forEach(o => { if (boostCD <= 0 && Math.hypot(b.x - o.x, b.y - o.y) < 30) { const sp = Math.max(780, Math.hypot(b.vx, b.vy)); b.vx = o.dir[0] * sp; b.vy = o.dir[1] * sp; boostCD = .4; ev.push({ t, k: 'boost' }); } });
      // portails
      (h.portals || []).forEach(o => { if (portalCD <= 0 && Math.hypot(b.x - o.a[0], b.y - o.a[1]) < 22) { b.x = o.b[0]; b.y = o.b[1]; portalCD = .6; ev.push({ t, k: 'portal' }); frames.push(null); } });
      // frottements
      const sp = Math.hypot(b.vx, b.vy);
      const [dec, lin] = surf === 'sand' ? [1300, 2.6] : surf === 'ice' ? [22, .05] : [150, .42];
      const nsp = Math.max(0, sp - (dec + lin * sp) * DT);
      if (sp > 0) { b.vx *= nsp / sp; b.vy *= nsp / sp; }
      b.x += b.vx * DT; b.y += b.vy * DT;
      // collisions
      let hit = 0;
      for (const s of segs) hit = Math.max(hit, collide(b, s, .78));
      for (const m of h.mills || []) for (const s of millSegs(m, T)) { const k = collide(b, s, .9); if (k) { hit = Math.max(hit, k); if (wallCD <= 0) ev.push({ t, k: 'mill' }); } }
      for (const s of h.sliders || []) for (const sg of sliderSegs(s, T)) hit = Math.max(hit, collide(b, sg, .85));
      if (hit > 60 && wallCD <= 0) { ev.push({ t, k: 'wall', v: Math.min(1, hit / 900) }); wallCD = .08; }
      for (const o of h.bumpers || []) {
        const dx = b.x - o.x, dy = b.y - o.y, d = Math.hypot(dx, dy), R = o.r + BR;
        if (d < R && d > 0) {
          const nx = dx / d, ny = dy / d; b.x = o.x + nx * R; b.y = o.y + ny * R;
          const vn = b.vx * nx + b.vy * ny;
          if (vn < 0) { b.vx -= 2.25 * vn * nx; b.vy -= 2.25 * vn * ny; const s2 = Math.hypot(b.vx, b.vy); if (s2 < 380) { b.vx *= 380 / s2; b.vy *= 380 / s2; } ev.push({ t, k: 'bumper', i: h.bumpers.indexOf(o) }); }
        }
      }
      // le trou
      const cd = Math.hypot(b.x - h.cup[0], b.y - h.cup[1]), spd = Math.hypot(b.vx, b.vy);
      if (cd < CUP) {
        if (spd < 640) { b.x = h.cup[0]; b.y = h.cup[1]; result = 'hole'; ev.push({ t, k: 'hole' }); frames.push([b.x, b.y]); break; }
        const pull = 900 * DT; b.vx += (h.cup[0] - b.x) / cd * pull; b.vy += (h.cup[1] - b.y) / cd * pull; // la balle « lèche » le bord
      } else if (cd < CUP + 10 && spd < 140) { b.vx += (h.cup[0] - b.x) / cd * 120 * DT; b.vy += (h.cup[1] - b.y) / cd * 120 * DT; }
      if (acc >= 1 / FPS) { acc = 0; frames.push([Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10]); }
      if (Math.hypot(b.vx, b.vy) < 3 && ![...(h.wind || []), ...(h.slopes || [])].some(w => inPoly(b.x, b.y, w.poly))) break;
      if (Math.hypot(b.vx, b.vy) < 3 && t > 6) break;
    }
    if (result === 'stop') frames.push([Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10]);
    return { frames, ev, result, end: result === 'water' ? [x, y] : [b.x, b.y], dur: t };
  }

  // ───────── partie ─────────
  function start(room) {
    const s = room.gs.golf, pl = online(room);
    if (pl.length > 8) throw new Error('8 joueurs maximum');
    // parcours : un des 3 (dans l'ordre, difficulté croissante), mélange (tirage au sort trié par difficulté) ou les 30 trous
    const all = HOLES.map((_, i) => i);
    let pool = s.course === 'mix' || s.course === 'all' ? all : all.filter(i => HOLES[i].course === +s.course);
    let order;
    if (s.course === 'all') order = all;
    else if (s.holes >= pool.length) order = pool;
    else { const last = pool[pool.length - 1]; order = [...shuffle(pool.slice(0, -1)).slice(0, s.holes - 1), last].sort((a, b) => a - b); }
    room.g = { game: id, stage: 'play', gameKey: Date.now().toString(36), order, n: -1, time: s.time, players: pl.map(p => p.id),
      cards: Object.fromEntries(pl.map(p => [p.id, []])), timer: null, deadline: 0, fx: null };
    room.phase = 'game';
    sysMsg(room, `⛳ MINI-GOLF — ${order.length} trous (${{ mix: 'mélange', all: 'intégrale', 0: 'Le Jardin', 1: "L'Aventure", 2: "L'Extrême" }[s.course]}). Vise, tire, et évite l'eau !`);
    broadcast(room);
    nextHole(room);
  }
  function nextHole(room) {
    const g = room.g; clear(g);
    g.n++;
    if (g.n >= g.order.length) return over(room);
    const h = HOLES[g.order[g.n]];
    g.hole = h; g.holeStart = Date.now(); g.stage = 'play';
    g.cap = h.par + 4;
    g.balls = Object.fromEntries(g.players.map(p => [p, { x: h.start[0], y: h.start[1], strokes: 0, done: false, shot: null, until: 0 }]));
    sysMsg(room, `⛳ Trou ${g.n + 1}/${g.order.length} : « ${h.name} » — par ${h.par}`);
    later(room, g.time * 1000, () => endHole(room, true));
    pushState(room);
  }
  function checkEnd(room) {
    const g = room.g;
    const active = g.players.filter(p => room.players.get(p)?.online);
    if (active.every(p => g.balls[p].done)) {
      const lastMove = Math.max(...Object.values(g.balls).map(b => b.until || 0));
      later(room, Math.max(0, lastMove - Date.now()) + 1200, () => endHole(room, false));
    }
  }
  function endHole(room, timeUp) {
    const g = room.g; clear(g);
    if (g.stage !== 'play') return;
    g.stage = 'score';
    for (const p of g.players) { const b = g.balls[p]; if (!b.done) { b.done = true; b.strokes = g.cap; b.capped = true; } g.cards[p][g.n] = b.strokes; }
    if (timeUp) sysMsg(room, '⏱️ Temps écoulé sur ce trou !');
    pushState(room);
    later(room, 6500, () => nextHole(room));
  }
  function over(room) {
    const g = room.g; clear(g); g.stage = 'over';
    // seuls les trous terminés comptent (si l'hôte arrête en plein trou, celui-ci est ignoré)
    let nh = 0; while (nh < g.order.length && g.players.every(p => g.cards[p][nh] != null)) nh++;
    const tot = (p) => g.cards[p].slice(0, nh).reduce((a, b) => a + (b || 0), 0);
    g.ranking = g.players.map(p => ({ pid: p, pts: tot(p) })).sort((a, b) => a.pts - b.pts);
    const par = g.order.slice(0, nh).reduce((a, i) => a + HOLES[i].par, 0);
    g.coins = {};
    g.ranking.forEach((r, i) => { const hio = g.cards[r.pid].slice(0, nh).filter(x => x === 1).length; g.coins[r.pid] = nh === 0 ? { coins: 5, win: false } : { coins: Math.max(10, Math.round((20 + (g.ranking.length - i) * 10 + (i === 0 ? 30 : 0)) * Math.min(1, nh / 6)) + Math.max(0, par - r.pts) * 5 + hio * 25), win: i === 0 && g.ranking.length > 1 }; });
    room.gscores.golf = room.gscores.golf || {};
    if (g.ranking.length > 1) room.gscores.golf[g.ranking[0].pid] = (room.gscores.golf[g.ranking[0].pid] || 0) + 1;
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
    shoot(room, me, { ang, pow } = {}) {
      const g = room.g; if (g.stage !== 'play') return { error: 'Pas maintenant' };
      const b = g.balls[me.id]; if (!b) return { error: 'Tu regardes 👀' };
      if (b.done) return { error: 'Tu as fini ce trou' };
      if (Date.now() < b.until) return { error: 'Ta balle roule encore' };
      ang = +ang; pow = Math.max(0, Math.min(1, +pow));
      if (!isFinite(ang) || !isFinite(pow) || pow < .02) return { error: 'Tir ?' };
      const t0 = (Date.now() - g.holeStart) / 1000 + .15;
      const sim = simulate(g.hole, b.x, b.y, ang, pow, t0);
      b.strokes += 1 + (sim.result === 'water' ? 1 : 0);
      b.shot = { k: Date.now(), at: g.holeStart + t0 * 1000, from: [b.x, b.y], frames: sim.frames, ev: sim.ev, result: sim.result, dur: sim.dur };
      b.until = b.shot.at + sim.dur * 1000 + 150;
      [b.x, b.y] = sim.end;
      if (sim.result === 'hole') {
        b.done = true;
        const d = b.strokes - g.hole.par;
        const name = b.strokes === 1 ? 'TROU EN UN !!! 🤯' : d <= -2 ? 'Eagle 🦅' : d === -1 ? 'Birdie 🐦' : d === 0 ? 'Par 👍' : d === 1 ? 'Bogey' : `+${d}`;
        b.label = name;
        setTimeout(() => { if (room.g === g) sysMsg(room, `⛳ ${me.name} : ${name} (${b.strokes} coup${b.strokes > 1 ? 's' : ''})`); }, Math.max(0, b.until - Date.now()));
      } else if (b.strokes >= g.cap) { b.done = true; b.capped = true; b.strokes = g.cap; b.label = 'Maximum atteint'; }
      pushState(room);
      checkEnd(room);
      return { ok: true };
    },
    emote(room, me, { e } = {}) { if (['👏', '😱', '😂', '🔥', '😭', '🐐', '🫣', '🏌️'].includes(e)) { room.g.fx = { e, pid: me.id, k: Date.now() }; pushState(room); } },
    skip(room, me) { if (room.hostId === me.id && room.g.stage === 'play') endHole(room, true); },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') over(room); },
  };
  function view(room, pid) {
    const g = room.g, h = g.hole;
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, n: g.n, total: g.order.length, holeIdx: g.order[g.n], hole: h, holeStart: g.holeStart, now: Date.now(), cap: g.cap,
      balls: g.balls, cards: g.cards, pars: g.order.map(i => HOLES[i].par), names: g.order.map(i => HOLES[i].name), players: g.players, left: Math.max(0, g.deadline - Date.now()), fx: g.fx };
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  function onLeave(room) { if (room.g?.stage === 'play') checkEnd(room); }
  return { id, min: 1, max: 8, defaults, applySettings, start, handlers, view, onLeave, _sim: simulate };
};
