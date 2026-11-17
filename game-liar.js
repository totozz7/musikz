// PlayZup — Bar des Menteurs (2 à 6 joueurs, robots possibles), inspiré des jeux de bluff « liar's deck ».
// À chaque manche : 5 cartes chacun (Dames, Rois, As + Jokers qui valent tout) et une « carte du tour ».
// À ton tour tu poses 1 à 3 cartes face cachée en annonçant que ce sont des cartes du tour… vrai ou faux !
// Le joueur suivant peut te croire (et jouer à son tour) ou crier « MENTEUR ! ».
// On retourne : si tu as menti, c'est toi qui tires au pistolet à bouchon, sinon c'est lui.
// Chaque joueur a son barillet de 6 chambres dont une seule est chargée : plus tu tires, plus ça devient chaud.
// Dernier debout = gagnant.
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'liar';
  const MIN = 2, MAX = 6;
  const RANKS = ['Q', 'K', 'A'];
  const RNAME = { Q: 'Dame', K: 'Roi', A: 'As', J: 'Joker' };
  const PL = (r) => r === 'A' ? 'As' : RNAME[r] + 's';
  const BOT_NAMES = ['Gros Bill', 'La Fouine', 'Doc Bluff', 'Miss Poker', 'Le Baron', 'Joe Sec'];
  const defaults = () => ({ bots: 0, time: 30 });

  function applySettings(room, p) {
    const s = room.gs.liar;
    if ([0, 1, 2, 3, 4, 5].includes(+p.bots)) s.bots = +p.bots;
    if ([20, 30, 45].includes(+p.time)) s.time = +p.time;
  }

  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const isBot = (room, s) => s.bot || !room.players.get(s.pid)?.online;
  const log = (g, t) => { g.log.unshift(t); g.log = g.log.slice(0, 10); };
  const ev = (g, e) => { g.evn++; g.event = { ...e, id: g.evn }; };
  const alive = (g) => g.seats.map((s, k) => k).filter(k => g.seats[k].alive);

  function start(room) {
    const s = room.gs.liar;
    const humans = [...room.players.values()].filter(p => p.online);
    if (humans.length > MAX) throw new Error(`${MAX} joueurs maximum au Bar des Menteurs`);
    const nb = Math.min(s.bots, MAX - humans.length);
    if (humans.length + nb < MIN) throw new Error('Il faut au moins 2 joueurs : invite un pote ou ajoute un robot 🤖');
    const seats = shuffle([
      ...humans.map(p => ({ pid: p.id, name: p.name, bot: false })),
      ...shuffle([...BOT_NAMES]).slice(0, nb).map(n => ({ pid: null, name: '🤖 ' + n, bot: true })),
    ]).map(x => ({ ...x, alive: true, hand: [], shots: 0, bullet: 1 + Math.floor(Math.random() * 6), calls: 0, goodCalls: 0, bluffs: 0, rounds: 0, out: 0 }));
    room.g = {
      game: id, stage: 'play', seats, round: 0, table: null, turn: 0, last: null, pile: 0, phase: 'deal',
      log: [], evn: 0, event: null, timer: null, deadline: 0, time: s.time * 1000, deck: null, deadOrder: [],
      gameKey: Date.now().toString(36), starter: Math.floor(Math.random() * seats.length),
    };
    room.phase = 'game';
    sysMsg(room, `🃏 Bar des Menteurs — ${seats.length} joueurs${nb ? ` (dont ${nb} robot${nb > 1 ? 's' : ''})` : ''} · bluffe ou tire !`);
    newRound(room);
    broadcast(room);
  }

  function buildDeck(n) {
    const size = 5 * n, jokers = Math.max(2, Math.round(n / 2)), rest = size - jokers;
    const cards = [];
    RANKS.forEach((r, i) => { const c = Math.floor(rest / 3) + (i < rest % 3 ? 1 : 0); for (let k = 0; k < c; k++) cards.push(r); });
    for (let k = 0; k < jokers; k++) cards.push('J');
    const comp = { Q: 0, K: 0, A: 0, J: 0 }; cards.forEach(c => comp[c]++);
    return { cards: shuffle(cards).map((r, i) => ({ id: i, r })), comp };
  }

  function newRound(room) {
    const g = room.g;
    const al = alive(g);
    g.round++; g.last = null; g.pile = 0;
    const { cards, comp } = buildDeck(al.length);
    g.deck = comp;
    g.seats.forEach(s => { s.hand = []; });
    al.forEach((k, i) => { g.seats[k].hand = cards.slice(i * 5, i * 5 + 5); g.seats[k].rounds++; });
    g.table = RANKS[Math.floor(Math.random() * 3)];
    let st = g.starter; while (!g.seats[st].alive) st = (st + 1) % g.seats.length;
    g.turn = st; g.phase = 'deal';
    ev(g, { type: 'deal', round: g.round, table: g.table, starter: st });
    log(g, `🃏 Manche ${g.round} — carte du tour : ${RNAME[g.table]}`);
    pushState(room);
    later(room, 2600, () => beginTurn(room));
  }

  // qui a encore des cartes ?
  const withCards = (g) => alive(g).filter(k => g.seats[k].hand.length);
  function forcedCall(g, k) { // tous les autres sont à sec : obligé de dénoncer la dernière pose
    return !!g.last && withCards(g).every(x => x === k);
  }
  function beginTurn(room) {
    const g = room.g; if (g.stage !== 'play') return;
    const seat = g.seats[g.turn];
    g.phase = 'turn';
    if (isBot(room, seat)) later(room, 1400 + Math.random() * 1600, () => botAct(room));
    else later(room, g.time, () => botAct(room)); // trop long : on joue pour lui
    pushState(room);
  }
  function nextAlive(g, k) { let n = (k + 1) % g.seats.length; while (!g.seats[n].alive) n = (n + 1) % g.seats.length; return n; }
  // après une pose : le prochain qui a des cartes… ou, si plus personne d'autre n'en a, le suivant (obligé de dénoncer)
  function advance(room) {
    const g = room.g, P = g.last.seat;
    const others = withCards(g).filter(x => x !== P);
    let n = nextAlive(g, P);
    if (others.length) while (!others.includes(n)) n = nextAlive(g, n);
    g.turn = n;
    beginTurn(room);
  }

  function play(room, k, ids) {
    const g = room.g, seat = g.seats[k];
    const cards = ids.map(i => seat.hand.find(c => c.id === i)).filter(Boolean);
    if (!cards.length || cards.length > 3 || new Set(ids).size !== ids.length) return;
    if (forcedCall(g, k)) return;
    clear(g);
    // la pose précédente n'a pas été dénoncée : bluff réussi ?
    if (g.last && g.last.cards.some(c => c.r !== g.table && c.r !== 'J')) g.seats[g.last.seat].bluffs++;
    seat.hand = seat.hand.filter(c => !cards.includes(c));
    g.last = { seat: k, cards, n: cards.length };
    g.pile += cards.length;
    ev(g, { type: 'play', seat: k, n: cards.length });
    log(g, `${seat.name} pose ${cards.length} ${cards.length > 1 ? PL(g.table) : RNAME[g.table]}… 🤔`);
    g.phase = 'anim'; pushState(room);
    later(room, 900, () => advance(room));
  }

  function call(room, k) {
    const g = room.g; if (!g.last || g.last.seat === k) return;
    clear(g);
    const target = g.last.seat, lie = g.last.cards.some(c => c.r !== g.table && c.r !== 'J');
    g.seats[k].calls++;
    if (lie) g.seats[k].goodCalls++;
    g.phase = 'reveal';
    ev(g, { type: 'reveal', caller: k, target, cards: g.last.cards, lie });
    log(g, `🗣️ ${g.seats[k].name} : « MENTEUR ! » → ${lie ? `${g.seats[target].name} bluffait 😈` : `${g.seats[target].name} disait vrai 😇`}`);
    pushState(room);
    const shooter = lie ? target : k;
    later(room, 3200, () => shoot(room, shooter));
  }

  function shoot(room, k) {
    const g = room.g, s = g.seats[k];
    g.phase = 'shoot';
    const bang = s.shots + 1 === s.bullet;
    ev(g, { type: 'shoot', seat: k, shot: s.shots + 1, bang });
    pushState(room);
    later(room, 3600, () => {
      s.shots++;
      if (bang) {
        s.alive = false; s.hand = []; g.deadOrder.push(k); s.out = g.round;
        log(g, `💥 BANG ! ${s.name} est éliminé·e`);
      } else log(g, `😮‍💨 Clic… ${s.name} s'en sort (${s.shots}/6)`);
      g.starter = s.alive ? k : nextAlive(g, k);
      if (alive(g).length <= 1) return finish(room);
      newRound(room);
    });
  }

  // ── robots (et joueurs trop lents) ──
  function botAct(room) {
    const g = room.g; if (g.stage !== 'play' || g.phase !== 'turn') return;
    const k = g.turn, s = g.seats[k];
    if (g.last && g.last.seat !== k) {
      const forced = forcedCall(g, k) || !s.hand.length;
      const mine = s.hand.filter(c => c.r === g.table || c.r === 'J').length;
      const avail = g.deck[g.table] + g.deck.J - mine - (g.pile - g.last.n) * 0.5;
      const sus = g.last.n > avail ? 1 : (g.last.n / Math.max(1, avail)) * .7 + Math.random() * .35 + (s.hand.length ? 0 : .5);
      if (forced || sus > .62) return call(room, k);
    }
    if (!s.hand.length) return call(room, k);
    const good = s.hand.filter(c => c.r === g.table || c.r === 'J'), bad = s.hand.filter(c => !good.includes(c));
    let pick;
    if (good.length && (Math.random() < .75 || !bad.length)) {
      pick = shuffle([...good]).slice(0, 1 + Math.floor(Math.random() * Math.min(2, good.length)));
      if (bad.length && Math.random() < .2 && pick.length < 3) pick.push(bad[0]);
    } else pick = shuffle([...bad]).slice(0, 1 + (Math.random() < .3 && bad.length > 1 ? 1 : 0));
    play(room, k, pick.map(c => c.id));
  }

  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over'; g.phase = 'over';
    const winner = alive(g)[0];
    g.winner = winner;
    g.ranking = [winner, ...[...g.deadOrder].reverse()];
    const humans = g.seats.filter(s => !s.bot).length;
    g.coins = {};
    g.ranking.forEach((k, rank) => {
      const s = g.seats[k]; if (s.bot) return;
      let c = 8 + 3 * s.rounds + 4 * s.goodCalls + 3 * s.bluffs;
      if (rank === 0) c += humans >= 2 ? 25 : 15;
      else if (rank === 1) c += 8;
      g.coins[s.pid] = { coins: c, good: s.goodCalls, win: rank === 0 };
    });
    ev(g, { type: 'over', winner });
    log(g, `🏆 ${g.seats[winner].name} est le dernier debout !`);
    room.gscores.liar = room.gscores.liar || {};
    if (!g.seats[winner].bot) room.gscores.liar[g.seats[winner].pid] = (room.gscores.liar[g.seats[winner].pid] || 0) + 1;
    sysMsg(room, `🏆 ${g.seats[winner].name} est le dernier debout au Bar des Menteurs !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }

  const mySeat = (g, pid) => g.seats.findIndex(s => s.pid === pid);
  const handlers = {
    play(room, me, ids) {
      const g = room.g, k = mySeat(g, me.id);
      if (g.stage !== 'play' || g.phase !== 'turn' || k !== g.turn || !Array.isArray(ids)) return;
      play(room, k, ids.map(Number));
    },
    call(room, me) {
      const g = room.g, k = mySeat(g, me.id);
      if (g.stage !== 'play' || g.phase !== 'turn' || k !== g.turn) return;
      call(room, k);
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g, me = mySeat(g, pid), cur = g.seats[g.turn];
    const myTurn = g.stage === 'play' && g.phase === 'turn' && me === g.turn;
    return {
      game: id, stage: g.stage, phase: g.phase, round: g.round, table: g.table, turn: g.turn, me, gameKey: g.gameKey,
      seats: g.seats.map((s, k) => ({ pid: s.pid, name: s.name, bot: s.bot, alive: s.alive, cards: s.hand.length, shots: s.shots,
        online: s.bot || !!room.players.get(s.pid)?.online, calls: s.calls, goodCalls: s.goodCalls,
        bullet: g.stage === 'over' || !s.alive ? s.bullet : null })),
      hand: me >= 0 ? g.seats[me].hand : [],
      last: g.last ? { seat: g.last.seat, n: g.last.n } : null,
      pile: g.pile, deck: g.deck,
      canPlay: myTurn && g.seats[me].hand.length > 0 && !forcedCall(g, me),
      canCall: myTurn && !!g.last && g.last.seat !== me, forced: myTurn && (forcedCall(g, me) || (!!g.last && !g.seats[me].hand.length)),
      event: g.event, log: g.log, left: Math.max(0, g.deadline - Date.now()), time: g.time,
      winner: g.winner ?? null, ranking: g.ranking || null, coins: g.stage === 'over' ? g.coins?.[pid] || null : null,
      cur: cur?.name,
    };
  }

  function onLeave(room, me) {
    const g = room.g; if (!g || g.game !== id || g.stage !== 'play') return;
    if (g.seats[g.turn]?.pid === me.id && g.phase === 'turn') later(room, 1200, () => botAct(room));
  }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave };
};
