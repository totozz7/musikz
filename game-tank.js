// PlayZup — TANK ARENA (1 à 8 joueurs + bots) : combat de tanks en 2D vue de dessus.
// Chacun choisit son canon, puis tout le monde s'affronte sur la carte. Dernier tank en vie = victoire.
// Le serveur fait toute la physique (40 fois / s) et envoie un instantané compact 20 fois / s (événement « tk »).
const MAPS = require('./data-tank');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward, emit }) => {
  const id = 'tank';
  const MIN = 1, MAX = 8;
  const T = 50, W = 32, H = 20;                        // taille d'une case, carte en cases
  const DT = 1 / 40, SEND = 2;                          // physique 40 Hz, envoi 20 Hz
  const TR = 18;                                        // rayon d'un tank
  const COLORS = ['#ff3b5c', '#3fa9ff', '#ffc21a', '#3dd68c', '#b46bff', '#ff8a1f', '#00e5e5', '#ff6ad5'];
  // ── les canons ──
  const GUNS = {
    std: { name: 'Canon standard', emoji: '🎯', rate: .5, speed: 650, dmg: 25, bounce: 1, r: 5, life: 2.2, bdmg: 1, desc: 'Équilibré, les obus rebondissent une fois.' },
    heavy: { name: 'Obusier', emoji: '💣', rate: 1.3, speed: 430, dmg: 42, bounce: 0, r: 8, life: 2.4, splash: 80, sdmg: 30, bdmg: 3, desc: 'Lent mais explose et détruit les murs.' },
    mg: { name: 'Mitrailleuse', emoji: '🔫', rate: .1, speed: 780, dmg: 6, bounce: 0, r: 3, life: .7, spread: .09, bdmg: .25, desc: 'Arrose en continu, portée moyenne.' },
    sniper: { name: 'Sniper', emoji: '⚡', rate: 1.5, speed: 1500, dmg: 62, bounce: 0, r: 4, life: 1.3, bdmg: 1, desc: 'Ultra rapide et très puissant, mais lent à recharger.' },
    shotgun: { name: 'Fusil à pompe', emoji: '🌟', rate: .85, speed: 720, dmg: 12, bounce: 0, r: 4, life: .36, pellets: 6, spread: .5, bdmg: .5, desc: 'Dévastateur de près, inutile de loin.' },
    ricochet: { name: 'Ricochet', emoji: '🔁', rate: .55, speed: 600, dmg: 22, bounce: 4, r: 5, life: 3.2, bdmg: 1, desc: 'Les obus rebondissent 4 fois : tire dans les coins !' },
    flame: { name: 'Lance-flammes', emoji: '🔥', rate: .06, speed: 360, dmg: 4, bounce: 0, r: 9, life: .42, spread: .28, bdmg: .1, pierce: true, desc: 'Un torrent de feu à courte portée.' },
    missile: { name: 'Missile guidé', emoji: '🚀', rate: 1.4, speed: 300, dmg: 38, bounce: 0, r: 6, life: 3.2, homing: 2.8, splash: 50, sdmg: 15, bdmg: 2, desc: 'Lent mais suit sa cible tout seul.' },
  };
  const PU = ['heal', 'shield', 'speed', 'power', 'cloak'];
  const SOLID_T = '#bBo~', SOLID_B = '#bBo';            // bloque les tanks / bloque les obus
  const defaults = () => ({ lives: 3, map: 'random', time: 5, bots: 0 });
  function applySettings(room, p) {
    const s = room.gs.tank;
    if ([1, 3, 5, 10].includes(+p.lives)) s.lives = +p.lives;
    if (p.map === 'random' || MAPS.some(m => m.id === p.map)) s.map = p.map;
    if ([3, 5, 8, 0].includes(+p.time)) s.time = +p.time;
    if ([0, 1, 2, 3, 4].includes(+p.bots)) s.bots = +p.bots;
  }
  // ── carte : quart haut-gauche → carte entière symétrique ──
  function build(m) {
    const q = m.q.map(r => (r + '...............').slice(0, 15));
    const rows = q.map(r => r + [...r].reverse().join(''));
    const full = [...rows, ...[...rows].reverse()];
    return ['#'.repeat(W), ...full.map(r => '#' + r + '#'), '#'.repeat(W)].map(r => [...r]);
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const tileAt = (g, x, y) => { const c = Math.floor(x / T), r = Math.floor(y / T); return (c < 0 || r < 0 || c >= W || r >= H) ? '#' : g.grid[r][c]; };
  const center = (c, r) => [c * T + T / 2, r * T + T / 2];

  function start(room) {
    const s = room.gs.tank, ps = online(room);
    if (ps.length + s.bots < 2) throw new Error('Il faut au moins 2 tanks : ajoute un bot dans les réglages 🤖');
    if (ps.length + s.bots > MAX) throw new Error(`8 tanks maximum (joueurs + bots)`);
    stopLoop(room);
    const map = s.map === 'random' ? MAPS[Math.floor(Math.random() * MAPS.length)] : MAPS.find(m => m.id === s.map);
    const grid = build(map);
    const spawns = [], pads = [], spots = [], hp = {}, mines = {};
    grid.forEach((row, r) => row.forEach((ch, c) => {
      if (ch === 'S') { spawns.push(center(c, r)); row[c] = '.'; }
      else if (ch === '+') { spots.push(center(c, r)); row[c] = '.'; }
      else if ('1234'.includes(ch)) pads.push({ c, r, d: ch });
      else if (ch === 'b') hp[r * W + c] = 3;
      else if (ch === 'o') hp[r * W + c] = 1;
      else if (ch === 'x') { mines[r * W + c] = 1; row[c] = '.'; }
    }));
    const tanks = [];
    const add = (pid, name, bot) => tanks.push({ pid, name, bot, color: COLORS[tanks.length % COLORS.length], gun: null, lives: s.lives, hp: 100, alive: false,
      x: 0, y: 0, vx: 0, vy: 0, a: 0, ta: 0, cd: 0, kills: 0, deaths: 0, dmg: 0, inp: { mx: 0, my: 0, ax: 1, ay: 0, f: 0 }, pu: {}, tp: 0, out: 0, lastShot: 0, inv: 0 });
    ps.forEach(p => add(p.id, p.name, false));
    const BOTN = ['Robo-Rex', 'Tankenstein', 'Chenille Folle', 'Kaboom', 'Blindé Joe'];
    for (let i = 0; i < s.bots; i++) add('bot' + i, '🤖 ' + BOTN[i % BOTN.length], true);
    room.g = { game: id, stage: 'pick', gameKey: Date.now().toString(36), map: { id: map.id, name: map.name, emoji: map.emoji, theme: map.theme, desc: map.desc },
      grid, hp, mines, spawns, pads, spots, pickups: [], tanks, bullets: [], ev: [], bid: 1, tick: 0, t: 0, lives: s.lives, time: s.time, out: [], gridV: 0 };
    tanks.filter(t => t.bot).forEach(t => { t.gun = shuffle(Object.keys(GUNS))[0]; });
    sysMsg(room, `💥 TANK ARENA — carte « ${map.name} » ${map.emoji} · ${s.lives} vie${s.lives > 1 ? 's' : ''}. Choisissez votre canon !`);
    room.phase = 'game'; broadcast(room);
    later(room, 20000, () => countdown(room));
    pushState(room);
  }
  function countdown(room) {
    const g = room.g; if (g.stage !== 'pick') return;
    g.tanks.forEach(t => { if (!t.gun) t.gun = 'std'; });
    g.stage = 'count';
    // placement : un départ chacun, le plus loin possible les uns des autres
    const order = shuffle(g.spawns.map((p, i) => i));
    g.tanks.forEach((t, i) => spawnTank(g, t, g.spawns[order[i % order.length]], true));
    later(room, 3200, () => { g.stage = 'play'; g.t0 = Date.now(); if (g.time) later(room, g.time * 60000, () => finish(room, 'time')); startLoop(room); pushState(room); });
    pushState(room);
  }
  function spawnTank(g, t, pos, first) {
    if (!pos) { // le départ le plus éloigné des ennemis
      let best = g.spawns[0], bd = -1;
      for (const sp of [...g.spawns, ...g.spots]) { const d = Math.min(...g.tanks.filter(o => o !== t && o.alive).map(o => Math.hypot(o.x - sp[0], o.y - sp[1])), 9999); if (d > bd) { bd = d; best = sp; } }
      pos = best;
    }
    Object.assign(t, { x: pos[0], y: pos[1], vx: 0, vy: 0, hp: 100, alive: true, cd: .5, pu: {}, inv: first ? 0 : 2.2 });
    t.a = t.ta = Math.atan2(H * T / 2 - pos[1], W * T / 2 - pos[0]);
    g.ev.push(['spawn', t.pid]);
  }
  // ── boucle de jeu ──
  function startLoop(room) {
    const g = room.g; stopLoop(room);
    g.loop = setInterval(() => { if (room.g !== g || g.stage !== 'play') return clearInterval(g.loop); try { step(room); } catch (e) { console.log('tank', e); } }, DT * 1000);
  }
  function stopLoop(room) { if (room.g?.loop) clearInterval(room.g.loop); }
  function solidT(g, x, y) { return SOLID_T.includes(tileAt(g, x, y)); }
  function collideTank(g, t) {
    const c0 = Math.floor(t.x / T), r0 = Math.floor(t.y / T);
    for (let r = r0 - 1; r <= r0 + 1; r++) for (let c = c0 - 1; c <= c0 + 1; c++) {
      if (r < 0 || c < 0 || r >= H || c >= W || !SOLID_T.includes(g.grid[r][c])) continue;
      const nx = Math.max(c * T, Math.min(t.x, c * T + T)), ny = Math.max(r * T, Math.min(t.y, r * T + T));
      const dx = t.x - nx, dy = t.y - ny, d = Math.hypot(dx, dy);
      if (d < TR) {
        if (d > .001) { t.x += dx / d * (TR - d); t.y += dy / d * (TR - d); const vn = (t.vx * dx + t.vy * dy) / d; if (vn < 0) { t.vx -= vn * dx / d; t.vy -= vn * dy / d; } }
        else { t.y -= TR; }
      }
    }
  }
  function damage(room, t, n, by, kind) {
    const g = room.g;
    if (!t.alive || t.inv > 0 || n <= 0) return;
    if (t.pu.shield > g.t) { g.ev.push(['shield', t.pid]); return; }
    const k = by && by !== t ? (by.pu.power > g.t ? 1.5 : 1) : 1;
    n *= k;
    t.hp -= n; if (by && by !== t) by.dmg += n;
    g.ev.push(['hit', t.pid, Math.round(n), kind || '']);
    if (t.hp <= 0) kill(room, t, by, kind);
  }
  function kill(room, t, by, kind) {
    const g = room.g;
    t.alive = false; t.hp = 0; t.lives--; t.deaths++;
    if (by && by !== t) by.kills++;
    g.ev.push(['kill', t.pid, by ? by.pid : '', kind || '', Math.round(t.x), Math.round(t.y)]);
    if (t.lives > 0) t.respawn = g.t + 2.6;
    else { t.out = Date.now(); g.out.push(t.pid); }
    const left = g.tanks.filter(x => x.lives > 0);
    if (left.length <= 1) setTimeout(() => { if (room.g === g && g.stage === 'play') finish(room, 'last'); }, 2200);
  }
  function explode(room, x, y, R, dmg, by, kind, bdmg = 0) {
    const g = room.g;
    g.ev.push(['boom', Math.round(x), Math.round(y), R]);
    g.tanks.forEach(t => { if (!t.alive) return; const d = Math.hypot(t.x - x, t.y - y); if (d < R + TR) damage(room, t, dmg * (1 - Math.max(0, d - TR) / R * .6), by, kind); });
    if (bdmg) { const c0 = Math.floor(x / T), r0 = Math.floor(y / T), rr = Math.ceil(R / T);
      for (let r = r0 - rr; r <= r0 + rr; r++) for (let c = c0 - rr; c <= c0 + rr; c++) { if (r <= 0 || c <= 0 || r >= H - 1 || c >= W - 1) continue; const [cx, cy] = center(c, r); if (Math.hypot(cx - x, cy - y) < R + T * .4) hitTile(room, r, c, bdmg, by); } }
  }
  function hitTile(room, r, c, n, by) {
    const g = room.g, ch = g.grid[r][c], k = r * W + c;
    if (ch !== 'b' && ch !== 'o') return false;
    g.hp[k] = (g.hp[k] || 1) - n;
    if (g.hp[k] <= 0) {
      g.grid[r][c] = ch === 'b' ? ',' : '_'; delete g.hp[k]; g.gridV++;
      g.ev.push(['tile', k, g.grid[r][c]]);
      if (ch === 'o') { const [cx, cy] = center(c, r); setTimeout(() => { if (room.g === g) explode(room, cx, cy, 95, 55, by, 'baril', 3); }, 90); }
    } else g.ev.push(['tile', k, ch, Math.ceil(g.hp[k])]);
    return true;
  }
  function fire(g, t) {
    const G = GUNS[t.gun], n = G.pellets || 1;
    for (let i = 0; i < n; i++) {
      const sp = G.spread ? (n > 1 ? (i / (n - 1) - .5) * G.spread + (Math.random() - .5) * .08 : (Math.random() - .5) * G.spread * 2) : 0;
      const a = t.ta + sp, v = G.speed * (n > 1 ? .85 + Math.random() * .3 : 1);
      const ox = t.x + Math.cos(t.ta) * (TR + 10), oy = t.y + Math.sin(t.ta) * (TR + 10);
      g.bullets.push({ id: g.bid++, x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, owner: t, gun: t.gun, life: G.life, bounce: G.bounce + (g.map.theme === 'neon' ? 2 : 0), age: 0, hit: new Set() });
    }
    t.cd = G.rate; t.lastShot = g.t;
    g.ev.push(['shot', t.pid, t.gun]);
  }
  function step(room) {
    const g = room.g; g.tick++; g.t += DT;
    // ── tanks ──
    for (const t of g.tanks) {
      if (!t.alive) { if (t.lives > 0 && t.respawn && g.t >= t.respawn) { t.respawn = 0; spawnTank(g, t, null); } continue; }
      if (t.bot) botThink(room, t);
      t.inv = Math.max(0, t.inv - DT); t.cd -= DT;
      const ground = tileAt(g, t.x, t.y);
      let mx = t.inp.mx, my = t.inp.my; const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
      const spd = 165 * (ground === 'm' ? .5 : 1) * (t.pu.speed > g.t ? 1.55 : 1);
      if (ground === 'i') { t.vx += mx * 420 * DT; t.vy += my * 420 * DT; t.vx *= .992; t.vy *= .992; const v = Math.hypot(t.vx, t.vy); if (v > spd * 1.3) { t.vx *= spd * 1.3 / v; t.vy *= spd * 1.3 / v; } }
      else { t.vx += (mx * spd - t.vx) * .3; t.vy += (my * spd - t.vy) * .3; }
      t.x += t.vx * DT; t.y += t.vy * DT;
      collideTank(g, t);
      if (ml > .1) { let d = Math.atan2(my, mx) - t.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; t.a += Math.max(-7 * DT, Math.min(7 * DT, d)); }
      if (t.inp.ax || t.inp.ay) t.ta = Math.atan2(t.inp.ay, t.inp.ax);
      // cases spéciales
      const c = Math.floor(t.x / T), r = Math.floor(t.y / T), ch = g.grid[r]?.[c];
      if (ch === 'L') damage(room, t, 38 * DT, null, 'lave');
      if (g.mines[r * W + c]) { delete g.mines[r * W + c]; const [mx2, my2] = center(c, r); explode(room, mx2, my2, 80, 65, null, 'mine', 2); g.ev.push(['mine', r * W + c]); }
      if ('1234'.includes(ch) && g.t > t.tp) {
        const dest = g.pads.find(p => p.c === W - 1 - c && p.r === H - 1 - r) || g.pads.find(p => p.d === ch && (p.c !== c || p.r !== r));
        if (dest) { const [nx, ny] = center(dest.c, dest.r); g.ev.push(['tp', Math.round(t.x), Math.round(t.y), nx, ny]); t.x = nx; t.y = ny; t.tp = g.t + 1.4; }
      }
      for (const p of g.pickups) if (!p.taken && Math.hypot(p.x - t.x, p.y - t.y) < 34) {
        p.taken = true; g.ev.push(['pick', t.pid, p.type]);
        if (p.type === 'heal') t.hp = Math.min(100, t.hp + 50); else t.pu[p.type] = g.t + (p.type === 'shield' ? 5 : 7);
      }
      if (t.inp.f && t.cd <= 0) fire(g, t);
    }
    g.pickups = g.pickups.filter(p => !p.taken);
    // collisions entre tanks
    const al = g.tanks.filter(t => t.alive);
    for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) { const a = al[i], b = al[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); if (d < TR * 2 && d > .01) { const p = (TR * 2 - d) / 2; a.x -= dx / d * p; a.y -= dy / d * p; b.x += dx / d * p; b.y += dy / d * p; } }
    // ── bonus ──
    if (g.tick % 40 === 0 && g.spots.length && g.pickups.length < Math.ceil(g.spots.length / 2) && Math.random() < .25) {
      const free = g.spots.filter(s => !g.pickups.some(p => p.x === s[0] && p.y === s[1]));
      if (free.length) { const s = free[Math.floor(Math.random() * free.length)]; g.pickups.push({ id: g.bid++, x: s[0], y: s[1], type: PU[Math.floor(Math.random() * PU.length)] }); }
    }
    // ── obus ──
    for (const b of g.bullets) {
      const G = GUNS[b.gun];
      b.age += DT; if (b.age > b.life) { b.dead = true; if (G.splash) explode(room, b.x, b.y, G.splash, G.sdmg, b.owner, b.gun, G.bdmg); continue; }
      if (G.homing) {
        const tg = g.tanks.filter(t => t.alive && t !== b.owner).sort((p, q) => Math.hypot(p.x - b.x, p.y - b.y) - Math.hypot(q.x - b.x, q.y - b.y))[0];
        const v = Math.min(620, Math.hypot(b.vx, b.vy) + 260 * DT);
        let a = Math.atan2(b.vy, b.vx);
        if (tg && Math.hypot(tg.x - b.x, tg.y - b.y) < 700) { let d = Math.atan2(tg.y - b.y, tg.x - b.x) - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; a += Math.max(-G.homing * DT, Math.min(G.homing * DT, d)); }
        b.vx = Math.cos(a) * v; b.vy = Math.sin(a) * v;
      }
      const sub = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * DT / 12));
      for (let s = 0; s < sub && !b.dead; s++) {
        const px = b.x, py = b.y; b.x += b.vx * DT / sub; b.y += b.vy * DT / sub;
        // tanks
        for (const t of g.tanks) {
          if (!t.alive || b.hit.has(t) || (t === b.owner && b.age < .25 && !b.bounced)) continue;
          if (Math.hypot(t.x - b.x, t.y - b.y) < TR + G.r) {
            b.hit.add(t);
            if (G.splash) { explode(room, b.x, b.y, G.splash, G.sdmg, b.owner, b.gun, G.bdmg); damage(room, t, G.dmg - G.sdmg * .5, b.owner, b.gun); }
            else damage(room, t, G.dmg, b.owner, b.gun);
            if (!G.pierce) { b.dead = true; g.ev.push(['impact', Math.round(b.x), Math.round(b.y), b.gun]); }
            break;
          }
        }
        if (b.dead) break;
        // murs
        const ch = tileAt(g, b.x, b.y);
        if (SOLID_B.includes(ch)) {
          const c = Math.floor(b.x / T), r = Math.floor(b.y / T);
          const broke = hitTile(room, r, c, G.bdmg, b.owner);
          if (G.splash) { b.dead = true; explode(room, px, py, G.splash, G.sdmg, b.owner, b.gun, G.bdmg); break; }
          if ((b.bounce > 0 || ch === 'B') && !(broke && g.grid[r][c] !== ch)) {
            if (ch !== 'B') b.bounce--;
            const hx = SOLID_B.includes(tileAt(g, b.x, py)), hy = SOLID_B.includes(tileAt(g, px, b.y));
            if (hx && !hy) b.vx *= -1; else if (hy && !hx) b.vy *= -1; else { b.vx *= -1; b.vy *= -1; }
            b.x = px; b.y = py; b.bounced = true; g.ev.push(['bounce', Math.round(px), Math.round(py)]);
            if (b.age > 6) b.dead = true;
          } else { b.dead = true; g.ev.push(['impact', Math.round(px), Math.round(py), b.gun]); }
        }
      }
    }
    g.bullets = g.bullets.filter(b => !b.dead);
    if (g.tick % SEND === 0) send(room);
  }
  function snap(g) {
    const idx = new Map(g.tanks.map((t, i) => [t, i]));
    return {
      t: Math.round(g.t * 1000),
      k: g.tanks.map(t => [Math.round(t.x), Math.round(t.y), +t.a.toFixed(2), +t.ta.toFixed(2), Math.max(0, Math.round(t.hp)), t.alive ? 1 : 0, t.lives,
        (t.pu.shield > g.t ? 1 : 0) | (t.pu.speed > g.t ? 2 : 0) | (t.pu.power > g.t ? 4 : 0) | (t.pu.cloak > g.t ? 8 : 0) | (t.inv > 0 ? 16 : 0) | ('%' === tileAt(g, t.x, t.y) ? 32 : 0) | (g.t - t.lastShot < 1 ? 64 : 0),
        t.kills, Math.round(Math.hypot(t.vx, t.vy))]),
      b: g.bullets.map(b => [b.id, Math.round(b.x), Math.round(b.y), b.gun, +Math.atan2(b.vy, b.vx).toFixed(2), idx.get(b.owner)]),
      p: g.pickups.map(p => [p.id, p.x, p.y, p.type]),
      e: g.ev,
    };
  }
  function send(room) { const g = room.g; emit(room, 'tk', snap(g)); g.ev = []; }
  // ── bots ──
  function los(g, a, b) { const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 20); for (let i = 1; i < n; i++) { const x = a.x + (b.x - a.x) * i / n, y = a.y + (b.y - a.y) * i / n; if (SOLID_B.includes(tileAt(g, x, y))) return false; } return true; }
  function flow(g, tx, ty) { // distance en cases jusqu'à la cible (évite murs, eau et lave)
    const D = new Int16Array(W * H).fill(-1), q = [], c0 = Math.floor(tx / T), r0 = Math.floor(ty / T);
    D[r0 * W + c0] = 0; q.push(r0 * W + c0);
    for (let i = 0; i < q.length; i++) { const k = q[i], c = k % W, r = (k - c) / W;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= W || nr >= H) continue; const nk = nr * W + nc; if (D[nk] >= 0 || SOLID_T.includes(g.grid[nr][nc]) || g.grid[nr][nc] === 'L') continue; D[nk] = D[k] + 1; q.push(nk); } }
    return D;
  }
  function botThink(room, t) {
    const g = room.g, b = t.bot === true ? (t.bot = { next: 0, tgt: null, flow: null, strafe: 1 }) : t.bot;
    if (g.t > b.next) {
      b.next = g.t + .5 + Math.random() * .3;
      const en = g.tanks.filter(o => o !== t && o.alive && !(o.pu.cloak > g.t));
      b.tgt = en.sort((p, q) => Math.hypot(p.x - t.x, p.y - t.y) - Math.hypot(q.x - t.x, q.y - t.y))[0] || null;
      const goal = b.tgt || (g.pickups[0] ? { x: g.pickups[0].x, y: g.pickups[0].y } : null);
      b.flow = goal ? flow(g, goal.x, goal.y) : null;
      if (Math.random() < .3) b.strafe *= -1;
    }
    let mx = 0, my = 0;
    const c = Math.floor(t.x / T), r = Math.floor(t.y / T);
    if (b.flow) { let best = b.flow[r * W + c], bd = null;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = b.flow[(r + dr) * W + c + dc]; if (v >= 0 && (best < 0 || v < best)) { best = v; bd = [dc, dr]; } }
      if (bd) { const [cx, cy] = center(c + bd[0], r + bd[1]); mx = cx - t.x; my = cy - t.y; } }
    const tg = b.tgt, see = tg && los(g, t, tg), dist = tg ? Math.hypot(tg.x - t.x, tg.y - t.y) : 1e9;
    if (see && dist < 650) {
      const G = GUNS[t.gun], tt = dist / G.speed;
      const ax = tg.x + tg.vx * tt * .8 - t.x, ay = tg.y + tg.vy * tt * .8 - t.y;
      t.inp.ax = ax + (Math.random() - .5) * 40; t.inp.ay = ay + (Math.random() - .5) * 40;
      const range = G.life * G.speed * .9;
      t.inp.f = dist < range ? 1 : 0;
      if (dist < Math.min(range * .6, 260)) { mx = -ay * b.strafe; my = ax * b.strafe; } // on tourne autour
    } else { t.inp.f = 0; if (mx || my) { t.inp.ax = mx; t.inp.ay = my; } }
    const l = Math.hypot(mx, my) || 1; t.inp.mx = mx / l; t.inp.my = my / l;
  }
  // ── fin ──
  function finish(room, why) {
    const g = room.g; if (g.stage !== 'play') return;
    clear(g); stopLoop(room); send(room);
    g.stage = 'over';
    const rk = [...g.tanks].sort((a, b) => (b.lives > 0) - (a.lives > 0) || b.lives - a.lives || (b.out || 9e15) - (a.out || 9e15) || b.kills - a.kills || b.dmg - a.dmg);
    g.ranking = rk.map(t => ({ pid: t.pid, name: t.name, color: t.color, bot: !!t.bot, pts: t.kills, kills: t.kills, deaths: t.deaths, dmg: Math.round(t.dmg), gun: t.gun }));
    g.coins = {};
    const humans = rk.filter(t => !t.bot);
    rk.forEach((t, i) => { if (!t.bot) g.coins[t.pid] = { coins: 15 + t.kills * 12 + Math.round(t.dmg / 25) + (i === 0 ? 40 : i === 1 ? 15 : 0), win: i === 0 && rk.length > 1 }; });
    room.gscores.tank = room.gscores.tank || {};
    if (rk[0] && !rk[0].bot && humans.length) room.gscores.tank[rk[0].pid] = (room.gscores.tank[rk[0].pid] || 0) + 1;
    sysMsg(room, `🏆 Tank Arena : ${rk[0]?.name} remporte la bataille${why === 'time' ? ' (temps écoulé)' : ''} avec ${rk[0]?.kills} élimination${rk[0]?.kills > 1 ? 's' : ''} !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const me2 = (g, me) => g.tanks.find(t => t.pid === me.id);
  const handlers = {
    gun(room, me, d) { const g = room.g, t = me2(g, me); if (g.stage !== 'pick' || !t || !GUNS[d?.gun]) return; t.gun = d.gun; if (g.tanks.every(x => x.gun && (x.bot || x.ready))) countdown(room); else pushState(room); },
    ready(room, me) { const g = room.g, t = me2(g, me); if (g.stage !== 'pick' || !t) return; t.ready = true; if (!t.gun) t.gun = 'std'; if (g.tanks.every(x => x.bot || x.ready)) countdown(room); else pushState(room); },
    go(room, me) { if (room.hostId === me.id && room.g.stage === 'pick') countdown(room); },
    end(room, me) { if (room.hostId === me.id && room.g.stage === 'play') finish(room, 'host'); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function input(room, me, d) {
    const g = room.g; if (!g || g.game !== id) return;
    const t = me2(g, me); if (!t || !d) return;
    const f = (v) => Math.max(-1, Math.min(1, +v || 0));
    t.inp.mx = f(d.mx); t.inp.my = f(d.my); t.inp.f = d.f ? 1 : 0;
    if (Number.isFinite(+d.ax) && Number.isFinite(+d.ay) && (d.ax || d.ay)) { t.inp.ax = +d.ax; t.inp.ay = +d.ay; }
  }
  function onLeave(room, me) { const g = room.g; const t = g && me2(g, me); if (t) { t.inp = { mx: 0, my: 0, ax: t.inp.ax, ay: t.inp.ay, f: 0 }; } }
  function view(room, pid) {
    const g = room.g;
    return { game: id, stage: g.stage, gameKey: g.gameKey, map: g.map, grid: g.grid.map(r => r.join('')), hp: g.hp, mines: g.stage === 'over' ? Object.keys(g.mines) : [],
      pads: g.pads, left: Math.max(0, (g.deadline || 0) - Date.now()), time: g.time, lives: g.lives,
      tanks: g.tanks.map(t => ({ pid: t.pid, name: t.name, color: t.color, gun: t.gun, ready: !!t.ready, bot: !!t.bot })),
      guns: GUNS, me: pid, snap: g.stage === 'play' || g.stage === 'count' ? snap({ ...g, ev: [] }) : null,
      ranking: g.ranking || null, coins: g.coins?.[pid] || null, t0: g.t0 || 0 };
  }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, input, stop: stopLoop, GUNS };
};
