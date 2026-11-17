// PlayZup — Petits chevaux (1 à 4 joueurs, places vides complétées par des robots)
// Règles : un 6 pour sortir de l'écurie, un 6 fait rejouer, on capture en tombant sur un adversaire
// (sauf sur une case de départ, protégée), arrivée au chiffre exact. Le premier à rentrer tous ses chevaux gagne.
module.exports = ({ sysMsg, broadcast, pushState, reward, shuffle }) => {
  const id = 'horses';
  const MIN = 1, MAX = 4;
  const TRACK = 52;            // cases du grand tour
  const LAST = 50;             // dernière case du tour avant le couloir d'arrivée
  const FINISH = 56;           // 51..55 = couloir de sa couleur, 56 = arrivé au centre
  const START = [0, 13, 26, 39];
  const SAFE = new Set(START);
  const COLORS = [
    { name: 'Rouge', hex: '#ff2e4d' }, { name: 'Vert', hex: '#22c55e' },
    { name: 'Jaune', hex: '#ffc21a' }, { name: 'Bleu', hex: '#2f8bff' },
  ];
  const SEAT_ORDER = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };
  const BOT_NAMES = ['Robo-Jockey', 'Turbo Bot', 'Bip Bop', 'Cyber Poney'];

  const defaults = () => ({ mode: 'auto', horses: 4, seats: 4 });
  function applySettings(room, p) {
    const s = room.gs.horses;
    if (['auto', 'choice'].includes(p.mode)) s.mode = p.mode;
    if ([2, 3, 4].includes(+p.horses)) s.horses = +p.horses;
    if ([0, 2, 3, 4].includes(+p.seats)) s.seats = +p.seats;
  }

  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const abs = (color, rel) => (START[color] + rel) % TRACK;
  const isBot = (room, seat) => seat.bot || !room.players.get(seat.pid)?.online;

  function start(room) {
    const s = room.gs.horses;
    const humans = shuffle([...room.players.values()].filter(p => p.online));
    if (humans.length > MAX) throw new Error('4 joueurs maximum aux Petits chevaux');
    const total = Math.max(2, humans.length, s.seats || humans.length);
    const colors = SEAT_ORDER[total];
    const seats = colors.map((color, i) => {
      const p = humans[i];
      return p ? { pid: p.id, bot: false, name: p.name, avatar: p.avatar, skin: p.pawn || 'classic', color }
        : { pid: 'bot' + i, bot: true, name: BOT_NAMES[i], avatar: '🤖', skin: 'classic', color };
    });
    room.g = {
      game: id, stage: 'play', seats, nHorses: s.horses, mode: s.mode,
      horses: seats.map(() => Array(s.horses).fill(-1)),
      turn: Math.floor(Math.random() * seats.length), phase: 'roll', dice: null, legal: [], sixes: 0,
      captures: seats.map(() => 0), last: null, log: [], winner: null, timer: null, deadline: 0, rolls: 0, startKey: Date.now(),
    };
    room.phase = 'game';
    const bots = seats.filter(x => x.bot).length;
    sysMsg(room, `🐎 Petits chevaux — ${seats.length} camps, ${s.horses} chevaux chacun${bots ? ` (${bots} robot${bots > 1 ? 's' : ''})` : ''} · ${s.mode === 'auto' ? '100 % hasard' : 'tu choisis ton cheval'}`);
    broadcast(room);
    beginTurn(room);
  }

  // ── tour de jeu ──
  function beginTurn(room) {
    const g = room.g; if (g.stage !== 'play') return;
    g.phase = 'roll'; g.dice = null; g.legal = [];
    const seat = g.seats[g.turn];
    if (isBot(room, seat)) later(room, 900, () => roll(room));
    else later(room, 20000, () => roll(room)); // joueur absent : on lance pour lui
    pushState(room);
  }

  function legalMoves(g, si, d) {
    const seat = g.seats[si], mine = g.horses[si], moves = [];
    mine.forEach((pos, h) => {
      let to;
      if (pos === -1) { if (d !== 6) return; to = 0; }
      else if (pos === FINISH) return;
      else { to = pos + d; if (to > FINISH) return; }
      // pas deux chevaux du même camp sur la même case (sauf à l'arrivée)
      if (to !== FINISH && mine.some((p, k) => k !== h && p === to)) return;
      const captures = [];
      if (to <= LAST) {
        const a = abs(seat.color, to);
        for (let t = 0; t < g.seats.length; t++) {
          if (t === si) continue;
          g.horses[t].forEach((p, k) => {
            if (p >= 0 && p <= LAST && abs(g.seats[t].color, p) === a) captures.push({ seat: t, h: k, from: p });
          });
        }
        if (captures.length && SAFE.has(a)) return; // case de départ protégée : impossible d'y aller si occupée
      }
      moves.push({ h, from: pos, to, captures });
    });
    return moves;
  }

  function roll(room) {
    const g = room.g; if (g.stage !== 'play' || g.phase !== 'roll') return;
    clear(g);
    const d = 1 + Math.floor(Math.random() * 6);
    g.dice = d; g.rolls++;
    g.legal = legalMoves(g, g.turn, d);
    g.last = { type: 'roll', seat: g.turn, dice: d, n: g.rolls };
    const seat = g.seats[g.turn];
    if (!g.legal.length) {
      g.phase = 'wait';
      pushState(room);
      later(room, 1300, () => endTurn(room, d === 6));
      return;
    }
    if (g.mode === 'auto' || g.legal.length === 1 || isBot(room, seat)) {
      g.phase = 'wait';
      pushState(room);
      later(room, 900, () => move(room, g.legal[Math.floor(Math.random() * g.legal.length)]));
    } else {
      g.phase = 'move';
      later(room, 15000, () => move(room, g.legal[Math.floor(Math.random() * g.legal.length)]));
      pushState(room);
    }
  }

  function move(room, mv) {
    const g = room.g; if (g.stage !== 'play' || !mv) return;
    clear(g);
    const si = g.turn, seat = g.seats[si];
    g.horses[si][mv.h] = mv.to;
    for (const c of mv.captures) { g.horses[c.seat][c.h] = -1; g.captures[si]++; }
    g.last = { type: 'move', seat: si, h: mv.h, from: mv.from, to: mv.to, captures: mv.captures, dice: g.dice, n: g.rolls };
    if (mv.captures.length) {
      const victims = mv.captures.map(c => g.seats[c.seat].name).join(', ');
      g.log.unshift(`💥 ${seat.name} renvoie ${victims} à l'écurie !`);
    } else if (mv.from === -1) g.log.unshift(`🚪 ${seat.name} sort un cheval`);
    else if (mv.to === FINISH) g.log.unshift(`🏁 ${seat.name} rentre un cheval !`);
    g.log = g.log.slice(0, 8);
    g.phase = 'wait';
    pushState(room);
    if (g.horses[si].every(p => p === FINISH)) return later(room, 900, () => finish(room, si));
    // on laisse le temps à l'animation (un saut par case)
    const hops = mv.from === -1 ? 1 : mv.to - mv.from;
    later(room, 350 + hops * 140 + (mv.captures.length ? 500 : 0), () => endTurn(room, g.dice === 6));
  }

  function endTurn(room, again) {
    const g = room.g; if (g.stage !== 'play') return;
    if (!again) g.turn = (g.turn + 1) % g.seats.length;
    beginTurn(room);
  }

  function finish(room, si) {
    const g = room.g; clear(g);
    g.stage = 'over'; g.winner = si;
    const progress = (k) => g.horses[k].reduce((s, p) => s + (p < 0 ? 0 : p + 1), 0);
    const order = g.seats.map((_, k) => k).sort((a, b) => (b === si) - (a === si) || progress(b) - progress(a));
    g.ranking = order;
    const humans = g.seats.filter(x => !x.bot).length;
    const coins = {};
    // pièces proportionnelles à la durée de la partie (≈ 4 à 7 🪙 par minute, comme les autres jeux)
    const len = g.rolls;
    order.forEach((k, rank) => {
      const seat = g.seats[k]; if (seat.bot) return;
      const home = g.horses[k].filter(p => p === FINISH).length;
      let c = 5 + Math.round(len / 10) + 2 * home + 2 * g.captures[k];
      if (rank === 0) c += Math.round(len / (humans >= 2 ? 8 : 12));
      coins[seat.pid] = { coins: c, good: home, win: rank === 0 };
    });
    g.coins = coins;
    room.gscores.horses = room.gscores.horses || {};
    if (!g.seats[si].bot) room.gscores.horses[g.seats[si].pid] = (room.gscores.horses[g.seats[si].pid] || 0) + 1;
    sysMsg(room, `🏆 ${g.seats[si].name} (${COLORS[g.seats[si].color].name}) rentre tous ses chevaux et gagne !`);
    reward(room, coins);
    pushState(room); broadcast(room);
  }

  const mySeat = (g, pid) => g.seats.findIndex(x => x.pid === pid);
  const handlers = {
    roll(room, me) { const g = room.g; if (g.stage === 'play' && g.phase === 'roll' && mySeat(g, me.id) === g.turn) roll(room); },
    move(room, me, h) {
      const g = room.g; if (g.stage !== 'play' || g.phase !== 'move' || mySeat(g, me.id) !== g.turn) return;
      const mv = g.legal.find(m => m.h === +h);
      if (!mv) return { error: 'Ce cheval ne peut pas bouger' };
      move(room, mv);
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g;
    return {
      game: id, stage: g.stage, mode: g.mode, nHorses: g.nHorses, gameKey: g.startKey,
      seats: g.seats.map((s, k) => ({ ...s, colorName: COLORS[s.color].name, hex: COLORS[s.color].hex, home: g.horses[k].filter(p => p === FINISH).length, captures: g.captures[k], online: s.bot || !!room.players.get(s.pid)?.online })),
      horses: g.horses, turn: g.turn, phase: g.phase, dice: g.dice, legal: g.legal.map(m => m.h), last: g.last, log: g.log,
      me: mySeat(g, pid), winner: g.winner, ranking: g.ranking || null, coins: g.stage === 'over' ? g.coins?.[pid] || null : null,
      left: Math.max(0, (g.deadline || 0) - Date.now()),
    };
  }

  function onLeave(room) { const g = room.g; if (g?.game === id && g.stage === 'play' && g.phase === 'roll' && isBot(room, g.seats[g.turn])) later(room, 900, () => roll(room)); }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave };
};
