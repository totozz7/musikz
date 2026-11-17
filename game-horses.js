// PlayZup — Petits chevaux (1 à 4 joueurs, places vides complétées par des robots)
// Règles : un 6 pour sortir de l'écurie, un 6 fait rejouer, on capture en tombant sur un adversaire
// (sauf sur une case de départ, protégée), arrivée au chiffre exact. Le premier à rentrer tous ses chevaux gagne.
// Option « échelle » : on s'arrête pile au pied de son escalier, puis il faut faire 1, 2, 3, 4, 5, 6 pour monter
// chaque marche, et encore un 6 pour rentrer au centre.
module.exports = ({ sysMsg, broadcast, pushState, reward, shuffle }) => {
  const id = 'horses';
  const MIN = 1, MAX = 4;
  const TRACK = 52;            // cases du grand tour
  const LAST = 50;             // dernière case du tour avant le couloir d'arrivée
  // normal : 51..55 = couloir de sa couleur, 56 = arrivé au centre
  // échelle : 51..56 = marches 1 à 6, 57 = arrivé au centre
  const finishOf = (g) => g.ladder ? 57 : 56;
  const START = [0, 13, 26, 39];
  const SAFE = new Set(START);
  const COLORS = [
    { name: 'Rouge', hex: '#ff2e4d' }, { name: 'Vert', hex: '#22c55e' },
    { name: 'Jaune', hex: '#ffc21a' }, { name: 'Bleu', hex: '#2f8bff' },
  ];
  // 🌶️ cases spéciales (option) : posées au hasard sur le grand tour à chaque partie
  const SPECIALS = ['turbo', 'turbo', 'banana', 'banana', 'portal', 'portal', 'shield', 'shield', 'replay', 'trap', 'star', 'star'];
  const GATES = new Set(START.map(x => (x + 50) % 52));
  function placeSpecials() {
    const free = shuffle([...Array(TRACK).keys()].filter(a => !SAFE.has(a) && !GATES.has(a) && !SAFE.has((a + 51) % 52)));
    const map = {};
    SPECIALS.forEach((t, i) => { map[free[i]] = t; });
    return map;
  }
  const SEAT_ORDER = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };
  const BOT_NAMES = ['Robo-Jockey', 'Turbo Bot', 'Bip Bop', 'Cyber Poney'];

  const defaults = () => ({ mode: 'choice', horses: 4, seats: 4, ladder: false, specials: false, exit: 6, rerolls: 0, capReplay: false });
  function applySettings(room, p) {
    const s = room.gs.horses;
    if (['auto', 'choice'].includes(p.mode)) s.mode = p.mode;
    if ([2, 3, 4].includes(+p.horses)) s.horses = +p.horses;
    if ([0, 2, 3, 4].includes(+p.seats)) s.seats = +p.seats;
    if (p.ladder !== undefined) s.ladder = p.ladder === true;
    if (p.specials !== undefined) s.specials = p.specials === true;
    if (p.capReplay !== undefined) s.capReplay = p.capReplay === true;
    if ([6, 16].includes(+p.exit)) s.exit = +p.exit;
    if ([0, 1, 3].includes(+p.rerolls)) s.rerolls = +p.rerolls;
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
      return p ? { pid: p.id, bot: false, name: p.name, avatar: p.avatar, skin: p.pawn || 'classic', fx: p.pcfx || 'basic', color }
        : { pid: 'bot' + i, bot: true, name: BOT_NAMES[i], avatar: '🤖', skin: 'classic', fx: 'basic', color };
    });
    room.g = {
      game: id, stage: 'play', seats, nHorses: s.horses, mode: s.mode, ladder: !!s.ladder,
      horses: seats.map(() => Array(s.horses).fill(-1)),
      turn: Math.floor(Math.random() * seats.length), phase: 'roll', dice: null, legal: [], sixes: 0,
      captures: seats.map(() => 0), last: null,
      specials: s.specials ? placeSpecials() : null, exit16: s.exit === 16, capReplay: !!s.capReplay,
      rerolls: seats.map(() => s.rerolls || 0), shield: seats.map(() => Array(s.horses).fill(false)), bonus: seats.map(() => 0), extra: false, log: [], winner: null, timer: null, deadline: 0, rolls: 0, startKey: Date.now(),
    };
    room.phase = 'game';
    const bots = seats.filter(x => x.bot).length;
    sysMsg(room, `🐎 Petits chevaux — ${seats.length} camps, ${s.horses} chevaux chacun${bots ? ` (${bots} robot${bots > 1 ? 's' : ''})` : ''} · ${s.mode === 'auto' ? '100 % hasard' : 'tu choisis ton cheval'}${s.ladder ? ' · 🪜 échelle 1→6' : ''}${s.specials ? ' · 🌶️ cases spéciales' : ''}${s.exit === 16 ? ' · sortie sur 1 ou 6' : ''}${s.rerolls ? ` · 🔁 ${s.rerolls} relance${s.rerolls > 1 ? 's' : ''}` : ''}${s.capReplay ? ' · 💥 manger = rejouer' : ''}`);
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
    const seat = g.seats[si], mine = g.horses[si], moves = [], FINISH = finishOf(g);
    mine.forEach((pos, h) => {
      let to;
      if (pos === -1) { if (d !== 6 && !(g.exit16 && d === 1)) return; to = 0; }
      else if (pos === FINISH) return;
      else if (g.ladder) {
        if (pos < LAST) { to = pos + d; if (to > LAST) return; }       // il faut tomber pile au pied de l'escalier
        else if (pos < 56) { if (d !== pos - LAST + 1) return; to = pos + 1; } // marche n → il faut faire n+1
        else { if (d !== 6) return; to = FINISH; }                    // marche 6 → un 6 pour rentrer
      }
      else { to = pos + d; if (to > FINISH) return; }
      // pas deux chevaux du même camp sur la même case (sauf à l'arrivée)
      if (to !== FINISH && mine.some((p, k) => k !== h && p === to)) return;
      const { captures, shieldHits } = hitsAt(g, si, to);
      if (captures.length && SAFE.has(abs(seat.color, to))) return; // case de départ protégée : impossible d'y aller si occupée
      moves.push({ h, from: pos, to, captures, shieldHits });
    });
    return moves;
  }
  // adversaires sur la case (rel du camp si) : capturés, sauf ceux qui ont un bouclier 🛡️
  function hitsAt(g, si, rel) {
    const captures = [], shieldHits = [];
    if (rel < 0 || rel > LAST) return { captures, shieldHits };
    const a = abs(g.seats[si].color, rel);
    for (let t = 0; t < g.seats.length; t++) {
      if (t === si) continue;
      g.horses[t].forEach((p, k) => {
        if (p >= 0 && p <= LAST && abs(g.seats[t].color, p) === a) (g.shield[t][k] ? shieldHits : captures).push({ seat: t, h: k, from: p });
      });
    }
    return { captures, shieldHits };
  }
  const NAMES = { turbo: '🚀 Turbo : +3 cases', banana: '🍌 Peau de banane : −3 cases', portal: '🌀 Portail', shield: '🛡️ Bouclier', replay: '🎲 Rejoue', trap: '🕳️ Trou : retour à l\'écurie', star: '⭐ +5 🪙' };
  function applySpecial(g, si, h, at) {
    const seat = g.seats[si], type = g.specials[abs(seat.color, at)];
    const ef = { type, from: at, to: at, captures: [], shieldHits: [], blocked: false };
    let to = at;
    if (type === 'turbo') to = Math.min(at + 3, LAST);
    else if (type === 'banana') to = Math.max(0, at - 3);
    else if (type === 'portal') {
      const other = +Object.keys(g.specials).find(a => g.specials[a] === 'portal' && +a !== abs(seat.color, at));
      const rel = (other - START[seat.color] + TRACK) % TRACK;
      to = rel <= LAST ? rel : at;
    } else if (type === 'trap') to = -1;
    else if (type === 'shield') g.shield[si][h] = true;
    else if (type === 'replay') g.extra = true;
    else if (type === 'star') g.bonus[si] += 5;
    if (to !== at) {
      if (to >= 0 && g.horses[si].some((p, k) => k !== h && p === to)) { ef.blocked = true; to = at; }
      else {
        const hit = hitsAt(g, si, to);
        if (!(hit.captures.length && SAFE.has(abs(seat.color, to)))) Object.assign(ef, hit); // sur une case ★ : on cohabite
        g.horses[si][h] = to;
        if (to === -1) g.shield[si][h] = false;
      }
    }
    ef.to = to;
    return ef;
  }
  function doCaptures(g, si, list, shieldHits) {
    for (const c of list) { g.horses[c.seat][c.h] = -1; g.shield[c.seat][c.h] = false; g.captures[si]++; }
    for (const c of shieldHits) g.shield[c.seat][c.h] = false;
  }

  function roll(room) {
    const g = room.g; if (g.stage !== 'play' || g.phase !== 'roll') return;
    clear(g);
    const d = 1 + Math.floor(Math.random() * 6);
    g.dice = d; g.rolls++;
    g.legal = legalMoves(g, g.turn, d);
    g.last = { type: 'roll', seat: g.turn, dice: d, n: g.rolls };
    const seat = g.seats[g.turn], human = !isBot(room, seat);
    if (!g.legal.length && g.rerolls[g.turn] > 0) {
      if (human) { g.phase = 'stuck'; pushState(room); later(room, 9000, () => endTurn(room, d === 6)); return; }
      if (seat.bot) { // un robot bloqué utilise ses relances
        g.phase = 'wait'; pushState(room);
        later(room, 1000, () => { g.rerolls[g.turn]--; g.log.unshift(`🔁 ${seat.name} relance le dé`); g.phase = 'roll'; roll(room); });
        return;
      }
    }
    if (human && g.rerolls[g.turn] > 0) { // on laisse le choix : jouer ou relancer
      g.phase = 'move';
      later(room, 15000, () => move(room, g.legal[Math.floor(Math.random() * g.legal.length)]));
      pushState(room);
      return;
    }
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
    const si = g.turn, seat = g.seats[si], FINISH = finishOf(g);
    g.horses[si][mv.h] = mv.to;
    doCaptures(g, si, mv.captures, mv.shieldHits || []);
    let effect = null;
    if (g.specials && mv.to >= 0 && mv.to <= LAST && g.specials[abs(seat.color, mv.to)]) {
      effect = applySpecial(g, si, mv.h, mv.to);
      doCaptures(g, si, effect.captures, effect.shieldHits);
    }
    g.last = { type: 'move', seat: si, h: mv.h, from: mv.from, to: mv.to, captures: mv.captures, shieldHits: mv.shieldHits || [], effect, dice: g.dice, n: g.rolls };
    if (mv.captures.length) {
      const victims = mv.captures.map(c => g.seats[c.seat].name).join(', ');
      g.log.unshift(`💥 ${seat.name} renvoie ${victims} à l'écurie !`);
    } else if (mv.from === -1) g.log.unshift(`🚪 ${seat.name} sort un cheval`);
    else if (mv.to === FINISH) g.log.unshift(`🏁 ${seat.name} rentre un cheval !`);
    else if (g.ladder && mv.to > LAST) g.log.unshift(`🪜 ${seat.name} monte sur la marche ${mv.to - LAST}`);
    if ((mv.shieldHits || []).length) g.log.unshift(`🛡️ Le bouclier de ${mv.shieldHits.map(c => g.seats[c.seat].name).join(', ')} encaisse le choc !`);
    if (effect) {
      g.log.unshift(`${NAMES[effect.type]}${effect.blocked ? ' (bloqué)' : ''} pour ${seat.name}`);
      if (effect.captures.length) g.log.unshift(`💥 ${seat.name} renvoie ${effect.captures.map(c => g.seats[c.seat].name).join(', ')} à l'écurie !`);
    }
    g.log = g.log.slice(0, 8);
    g.phase = 'wait';
    pushState(room);
    if (g.horses[si].every(p => p === FINISH)) return later(room, 1800, () => finish(room, si));
    // on laisse le temps à l'animation (un saut par case)
    const hops = mv.from === -1 ? 1 : mv.to - mv.from;
    const capt = mv.captures.length || (effect && effect.captures.length);
    const efMs = effect ? 1300 + (effect.to >= 0 ? Math.abs(effect.to - effect.from) * 130 : 600) + (effect.captures.length ? 1500 : 0) : 0;
    const again = g.dice === 6 || (g.capReplay && capt) || g.extra;
    later(room, 350 + hops * 175 + (mv.captures.length ? 1500 : 0) + (mv.to === FINISH ? 1200 : 0) + efMs, () => endTurn(room, again));
  }

  function endTurn(room, again) {
    const g = room.g; if (g.stage !== 'play') return;
    g.extra = false;
    if (!again) g.turn = (g.turn + 1) % g.seats.length;
    beginTurn(room);
  }

  function finish(room, si) {
    const g = room.g; clear(g);
    g.stage = 'over'; g.winner = si; const FINISH = finishOf(g);
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
      let c = 5 + Math.round(len / 10) + 2 * home + 2 * g.captures[k] + g.bonus[k];
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
      const mv = +h === -1 ? g.legal[Math.floor(Math.random() * g.legal.length)] : g.legal.find(m => m.h === +h);
      if (!mv) return { error: 'Ce cheval ne peut pas bouger' };
      move(room, mv);
    },
    reroll(room, me) {
      const g = room.g; const si = mySeat(g, me.id);
      if (g.stage !== 'play' || si !== g.turn || !['move', 'stuck'].includes(g.phase) || g.rerolls[si] <= 0) return;
      g.rerolls[si]--; g.log.unshift(`🔁 ${g.seats[si].name} relance le dé`); g.log = g.log.slice(0, 8);
      g.phase = 'roll'; roll(room);
    },
    pass(room, me) { const g = room.g; if (g.stage === 'play' && g.phase === 'stuck' && mySeat(g, me.id) === g.turn) { clear(g); endTurn(room, g.dice === 6); } },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g;
    return {
      game: id, stage: g.stage, mode: g.mode, nHorses: g.nHorses, gameKey: g.startKey,
      ladder: g.ladder, finish: finishOf(g), specials: g.specials, shield: g.shield, rerolls: g.rerolls, exit16: g.exit16, capReplay: g.capReplay,
      seats: g.seats.map((s, k) => ({ ...s, colorName: COLORS[s.color].name, hex: COLORS[s.color].hex, home: g.horses[k].filter(p => p === finishOf(g)).length, captures: g.captures[k], online: s.bot || !!room.players.get(s.pid)?.online })),
      horses: g.horses, turn: g.turn, phase: g.phase, dice: g.dice, legal: g.legal.map(m => m.h), last: g.last, log: g.log,
      me: mySeat(g, pid), winner: g.winner, ranking: g.ranking || null, coins: g.stage === 'over' ? g.coins?.[pid] || null : null,
      left: Math.max(0, (g.deadline || 0) - Date.now()),
    };
  }

  function onLeave(room) { const g = room.g; if (g?.game === id && g.stage === 'play' && g.phase === 'roll' && isBot(room, g.seats[g.turn])) later(room, 900, () => roll(room)); }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave };
};
