// PlayZup — POKER Texas Hold'em No Limit (2 à 8 joueurs). Modes : Classique, Turbo (blinds qui doublent vite), Tapis ! (tapis ou couché).
// Pots secondaires, évaluateur 7 cartes, pendule par action. Les jetons sont fictifs : seules les pièces de fin de partie comptent.
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'poker';
  const MODES = {
    classic: { name: '♠️ Classique', stack: 1000, sb: 10, every: 8, mult: 1.5 },
    turbo: { name: '⚡ Turbo', stack: 600, sb: 10, every: 4, mult: 2 },
    push: { name: '💥 Tapis !', stack: 500, sb: 10, every: 5, mult: 2, push: true },
  };
  const defaults = () => ({ mode: 'classic', hands: 30, time: 30 });
  function applySettings(room, p) {
    const s = room.gs.poker;
    if (MODES[p.mode]) s.mode = p.mode;
    if ([15, 30, 0].includes(+p.hands)) s.hands = +p.hands;
    if ([20, 30, 60].includes(+p.time)) s.time = +p.time;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const P = (room, pid) => room.players.get(pid);

  // ───────── cartes & évaluation ─────────
  const RANKS = '23456789TJQKA', SUITS = 'shdc';
  const deck = () => shuffle(RANKS.split('').flatMap(r => SUITS.split('').map(s => r + s)));
  const rv = (c) => RANKS.indexOf(c[0]) + 2;
  const HN = ['Carte haute', 'Paire', 'Double paire', 'Brelan', 'Quinte', 'Couleur', 'Full', 'Carré', 'Quinte flush', 'Quinte flush royale'];
  function eval5(cs) {
    const v = cs.map(rv).sort((a, b) => b - a), flush = cs.every(c => c[1] === cs[0][1]);
    let uniq = [...new Set(v)], straight = 0;
    if (uniq.length === 5) { if (v[0] - v[4] === 4) straight = v[0]; else if (v[0] === 14 && v[1] === 5) straight = 5; }
    const cnt = {}; v.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
    const groups = Object.entries(cnt).map(([x, n]) => [n, +x]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    const kick = groups.map(g => g[1]);
    if (straight && flush) return [straight === 14 ? 9 : 8, straight];
    if (groups[0][0] === 4) return [7, ...kick];
    if (groups[0][0] === 3 && groups[1][0] === 2) return [6, ...kick];
    if (flush) return [5, ...v];
    if (straight) return [4, straight];
    if (groups[0][0] === 3) return [3, ...kick];
    if (groups[0][0] === 2 && groups[1][0] === 2) return [2, ...kick];
    if (groups[0][0] === 2) return [1, ...kick];
    return [0, ...v];
  }
  const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; };
  function best7(cards) {
    let best = null, bc = null;
    const k = Math.min(5, cards.length), pick = [];
    const rec = (i) => {
      if (pick.length === k) { const five = pick.map(j => cards[j]); const sc = k === 5 ? eval5(five) : evalSmall(five); if (!best || cmp(sc, best) > 0) { best = sc; bc = five; } return; }
      for (let j = i; j < cards.length; j++) { pick.push(j); rec(j + 1); pick.pop(); }
    };
    rec(0);
    return { score: best, cards: bc, name: HN[best[0]] };
  }
  function evalSmall(cs) { // moins de 5 cartes (pendant le pré-flop on ne l'appelle pas) : paires / brelan / carré
    const v = cs.map(rv).sort((a, b) => b - a), cnt = {}; v.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
    const g = Object.entries(cnt).map(([x, n]) => [n, +x]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    const r = g[0][0] === 4 ? 7 : g[0][0] === 3 ? 3 : g[0][0] === 2 && g[1]?.[0] === 2 ? 2 : g[0][0] === 2 ? 1 : 0;
    return [r, ...g.map(x => x[1])];
  }
  // ───────── partie ─────────
  function start(room) {
    const s = room.gs.poker, pl = online(room);
    if (pl.length < 2) throw new Error('Il faut au moins 2 joueurs');
    if (pl.length > 8) throw new Error('8 joueurs maximum à la table');
    const M = MODES[s.mode];
    room.g = { game: id, stage: 'hand', gameKey: Date.now().toString(36), mode: s.mode, maxHands: s.hands, time: s.time,
      seats: shuffle(pl.map(p => p.id)), chips: Object.fromEntries(pl.map(p => [p.id, M.stack])), out: [], handNo: 0, dealer: -1,
      sb: M.sb, timer: null, deadline: 0, log: [], fx: null };
    room.phase = 'game';
    sysMsg(room, `🃏 POKER — ${M.name} · ${M.stack} jetons chacun · blinds ${M.sb}/${M.sb * 2}${s.hands ? ` · ${s.hands} mains max` : ''}`);
    broadcast(room);
    newHand(room);
  }
  const alive = (g) => g.seats.filter(p => g.chips[p] > 0);
  function newHand(room) {
    const g = room.g; clear(g);
    const live = alive(g);
    if (live.length < 2 || (g.maxHands && g.handNo >= g.maxHands)) return over(room);
    g.handNo++;
    const M = MODES[g.mode];
    if (g.handNo > 1 && (g.handNo - 1) % M.every === 0) { g.sb = Math.round(g.sb * M.mult / 5) * 5 || g.sb * 2; sysMsg(room, `⏫ Les blinds montent : ${g.sb}/${g.sb * 2}`); }
    // bouton du donneur : prochain joueur vivant
    let d = g.dealer; do { d = (d + 1) % g.seats.length; } while (g.chips[g.seats[d]] <= 0);
    g.dealer = d;
    const order = []; for (let i = 1; i <= g.seats.length; i++) { const p = g.seats[(d + i) % g.seats.length]; if (g.chips[p] > 0) order.push(p); }
    // order[0] = petite blind (sauf en tête-à-tête : le donneur est petite blind)
    const dealerId = g.seats[d];
    const ring = live.length === 2 ? [dealerId, order.find(x => x !== dealerId)] : order.slice(0, -1).length ? [...order] : order;
    g.deck = deck();
    g.hand = {
      ring, board: [], street: 'preflop', pot: 0, cur: -1, high: 0, minRaise: g.sb * 2, lastAgg: null,
      p: Object.fromEntries(ring.map(pid => [pid, { hole: [g.deck.pop(), g.deck.pop()], bet: 0, total: 0, folded: false, allin: false, acted: false, last: '' }])),
      winners: null, shown: {}, reveal: false,
    };
    const H = g.hand;
    const sbP = ring[0], bbP = ring[1];
    post(g, sbP, g.sb, 'Petite blind'); post(g, bbP, g.sb * 2, 'Grosse blind');
    H.high = Math.max(H.p[sbP].bet, H.p[bbP].bet); H.minRaise = g.sb * 2;
    H.cur = ring.length === 2 ? 0 : 2 % ring.length;
    g.stage = 'hand';
    sysMsg(room, `🂠 Main n°${g.handNo} — ${P(room, dealerId)?.name} donne`);
    nextActor(room, true);
  }
  function post(g, pid, amt, label) {
    const s = g.hand.p[pid], a = Math.min(amt, g.chips[pid]);
    g.chips[pid] -= a; s.bet += a; s.total += a; g.hand.pot += a; s.last = label;
    if (!g.chips[pid]) s.allin = true;
  }
  const canAct = (g, pid) => { const s = g.hand.p[pid]; return !s.folded && !s.allin; };
  function roundDone(g) {
    const H = g.hand, act = H.ring.filter(p => canAct(g, p));
    return act.every(p => H.p[p].acted && H.p[p].bet === H.high) || (act.length <= 1 && act.every(p => H.p[p].bet >= H.high));
  }
  function nextActor(room, first) {
    const g = room.g, H = g.hand;
    const inHand = H.ring.filter(p => !H.p[p].folded);
    if (inHand.length === 1) return award(room, [[inHand[0], H.pot]], true);
    if (roundDone(g)) return nextStreet(room);
    // cherche le prochain joueur qui peut agir
    for (let k = first ? 0 : 1; k <= H.ring.length; k++) {
      const i = (H.cur + k) % H.ring.length, p = H.ring[i];
      if (canAct(g, p) && !(H.p[p].acted && H.p[p].bet === H.high)) { H.cur = i; break; }
    }
    H.turnAt = Date.now();
    const pidNow = H.ring[H.cur];
    if (!room.players.get(pidNow)?.online) { act(room, pidNow, { a: H.p[pidNow].bet === H.high ? 'check' : 'fold' }, true); return; }
    later(room, g.time * 1000, () => act(room, pidNow, { a: H.p[pidNow].bet >= H.high ? 'check' : 'fold' }, true));
    pushState(room);
  }
  function nextStreet(room) {
    const g = room.g, H = g.hand;
    H.ring.forEach(p => { H.p[p].bet = 0; H.p[p].acted = false; if (!H.p[p].folded && !H.p[p].allin) H.p[p].last = ''; });
    H.high = 0; H.minRaise = g.sb * 2;
    const ableToAct = H.ring.filter(p => canAct(g, p)).length;
    const deal = (n) => { g.deck.pop(); for (let i = 0; i < n; i++) H.board.push(g.deck.pop()); };
    if (H.street === 'preflop') { H.street = 'flop'; deal(3); }
    else if (H.street === 'flop') { H.street = 'turn'; deal(1); }
    else if (H.street === 'turn') { H.street = 'river'; deal(1); }
    else return showdown(room);
    if (ableToAct <= 1) {
      // plus personne ne peut miser : on dévoile et on déroule
      H.reveal = true; pushState(room);
      return later(room, 1600, () => nextStreet(room));
    }
    // premier à parler : premier joueur actif après le bouton
    const dealerId = g.seats[g.dealer];
    let start = H.ring.indexOf(dealerId); if (start < 0) start = H.ring.length - 1;
    if (H.ring.length === 2) start = H.ring.indexOf(dealerId); // en tête-à-tête, la grosse blind parle d'abord après le flop
    H.cur = start;
    pushState(room);
    later(room, 900, () => nextActor(room, false));
  }
  function showdown(room) {
    const g = room.g, H = g.hand;
    H.street = 'showdown'; H.reveal = true;
    const live = H.ring.filter(p => !H.p[p].folded);
    const res = Object.fromEntries(live.map(p => [p, best7([...H.p[p].hole, ...H.board])]));
    H.hands = Object.fromEntries(Object.entries(res).map(([p, r]) => [p, { name: r.name, cards: r.cards }]));
    // pots secondaires
    const levels = [...new Set(H.ring.map(p => H.p[p].total).filter(x => x > 0))].sort((a, b) => a - b);
    let prev = 0; const pays = {};
    for (const L of levels) {
      const amount = H.ring.reduce((a, p) => a + Math.min(H.p[p].total, L) - Math.min(H.p[p].total, prev), 0);
      prev = L;
      let elig = live.filter(p => H.p[p].total >= L);
      if (!amount) continue;
      if (!elig.length) elig = live.filter(p => H.p[p].total === Math.max(...live.map(q => H.p[q].total))); // argent des couchés au-dessus du plus gros tapis
      let best = null, win = [];
      for (const p of elig) { const c = best ? cmp(res[p].score, best) : 1; if (c > 0) { best = res[p].score; win = [p]; } else if (c === 0) win.push(p); }
      const share = Math.floor(amount / win.length);
      win.forEach((p, i) => pays[p] = (pays[p] || 0) + share + (i === 0 ? amount - share * win.length : 0));
    }
    award(room, Object.entries(pays), false);
  }
  function award(room, list, uncontested) {
    const g = room.g, H = g.hand; clear(g);
    list.forEach(([p, a]) => { g.chips[p] += a; });
    H.winners = list.map(([p, a]) => ({ pid: p, amount: a, hand: H.hands?.[p]?.name || null, cards: H.hands?.[p]?.cards || null }));
    H.uncontested = uncontested;
    H.street = uncontested ? H.street : 'showdown';
    g.stage = 'payout';
    const w = H.winners.sort((a, b) => b.amount - a.amount)[0];
    sysMsg(room, `💰 ${P(room, w.pid)?.name} remporte ${w.amount} jetons${w.hand ? ` avec ${w.hand}` : ''}`);
    // éliminations
    H.ring.forEach(p => { if (g.chips[p] <= 0 && !g.out.includes(p)) { g.out.push(p); sysMsg(room, `💀 ${P(room, p)?.name} est éliminé(e)`); } });
    pushState(room);
    later(room, uncontested ? 3500 : 6500, () => newHand(room));
  }
  function act(room, pid, { a, amount } = {}, auto) {
    const g = room.g, H = g.hand;
    if (g.stage !== 'hand' || !H || H.ring[H.cur] !== pid) return { error: "Ce n'est pas ton tour" };
    const s = H.p[pid], toCall = H.high - s.bet, M = MODES[g.mode];
    if (M.push && !auto && (a === 'raise' || a === 'call') && toCall < g.chips[pid]) a = 'allin';
    if (a === 'check' && toCall > 0) return { error: 'Tu dois suivre ou te coucher' };
    if (a === 'fold') { s.folded = true; s.last = auto ? 'Couché (temps)' : 'Couché'; }
    else if (a === 'check') { s.last = 'Parole'; }
    else if (a === 'call') { post(g, pid, toCall, ''); s.last = s.allin ? 'Tapis' : 'Suit'; }
    else if (a === 'allin' || a === 'raise') {
      let target = a === 'allin' ? s.bet + g.chips[pid] : Math.floor(+amount || 0);
      const maxT = s.bet + g.chips[pid];
      if (target >= maxT) target = maxT;
      else if (target < H.high + H.minRaise) return { error: `Relance minimum : ${H.high + H.minRaise}` };
      const raiseBy = target - H.high;
      post(g, pid, target - s.bet, '');
      if (raiseBy > 0) {
        if (raiseBy >= H.minRaise) { H.minRaise = raiseBy; H.ring.forEach(p => { if (p !== pid) H.p[p].acted = false; }); }
        else H.ring.forEach(p => { if (p !== pid && H.p[p].bet < target) H.p[p].acted = false; }); // tapis incomplet
        H.high = target; H.lastAgg = pid;
      }
      s.last = s.allin ? 'TAPIS !' : `Relance à ${target}`;
    } else return { error: 'Action ?' };
    s.acted = true;
    H.lastAct = { pid, a, k: Date.now() };
    nextActor(room, false);
    return { ok: true };
  }
  function over(room) {
    const g = room.g; clear(g); g.stage = 'over';
    // classement : jetons restants, puis ordre d'élimination (les derniers éliminés devant)
    const outOrder = g.out.slice().reverse();
    const live = g.seats.filter(p => g.chips[p] > 0).sort((a, b) => g.chips[b] - g.chips[a]);
    const rest = g.seats.filter(p => !live.includes(p) && !outOrder.includes(p));
    g.ranking = [...live, ...outOrder, ...rest].map(p => ({ pid: p, pts: g.chips[p] }));
    const N = g.ranking.length;
    g.coins = {};
    g.ranking.forEach((r, i) => { g.coins[r.pid] = { coins: Math.round(10 + (N - i) * 12 + (i === 0 ? 40 : i === 1 ? 15 : 0)), win: i === 0 }; });
    room.gscores.poker = room.gscores.poker || {};
    room.gscores.poker[g.ranking[0].pid] = (room.gscores.poker[g.ranking[0].pid] || 0) + 1;
    sysMsg(room, `🏆 ${P(room, g.ranking[0].pid)?.name} rafle la table avec ${g.chips[g.ranking[0].pid]} jetons !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    act(room, me, p) { return act(room, me.id, p || {}); },
    show(room, me) { const H = room.g.hand; if (room.g.stage === 'payout' && H?.p[me.id] && H.uncontested) { H.shown[me.id] = true; pushState(room); } },
    emote(room, me, { e } = {}) { if (['😎', '🤑', '😱', '🤡', '🙄', '🔥', '😭', '👏'].includes(e)) { room.g.fx = { e, pid: me.id, k: Date.now() }; pushState(room); } },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') over(room); },
  };
  function view(room, pid) {
    const g = room.g, H = g.hand;
    const seats = g.seats.map((p, i) => {
      const s = H?.p[p];
      const showCards = s && !s.folded && (H.reveal || H.street === 'showdown') || (s && H.shown[p]) || p === pid;
      return { pid: p, chips: g.chips[p], dealer: i === g.dealer, out: g.chips[p] <= 0 && !(s && !s.folded && g.stage === 'hand'),
        inHand: !!s, bet: s?.bet || 0, folded: !!s?.folded, allin: !!s?.allin, last: s?.last || '', cards: s ? (showCards ? s.hole : ['??', '??']) : null,
        turn: g.stage === 'hand' && H?.ring[H.cur] === p };
    });
    const me = H?.p[pid];
    let opts = null;
    if (g.stage === 'hand' && H.ring[H.cur] === pid) {
      const toCall = H.high - me.bet, stack = g.chips[pid];
      opts = { toCall: Math.min(toCall, stack), canCheck: toCall <= 0, minRaise: Math.min(H.high + H.minRaise, me.bet + stack), max: me.bet + stack, pot: H.pot, push: !!MODES[g.mode].push, bet: me.bet, high: H.high };
    }
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, mode: g.mode, modeName: MODES[g.mode].name, handNo: g.handNo, maxHands: g.maxHands, sb: g.sb,
      seats, board: H?.board || [], pot: H?.pot || 0, street: H?.street, winners: H?.winners || null, hands: H?.street === 'showdown' ? H.hands : null, uncontested: H?.uncontested,
      opts, myHand: me && H.board.length >= 3 ? best7([...me.hole, ...H.board]).name : null, left: Math.max(0, g.deadline - Date.now()), time: g.time, lastAct: H?.lastAct || null, fx: g.fx };
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  function onLeave(room) {
    const g = room.g; if (!g?.hand || g.stage !== 'hand') return;
    const p = g.hand.ring[g.hand.cur];
    if (!room.players.get(p)?.online) setTimeout(() => { if (room.g === g && g.stage === 'hand' && g.hand.ring[g.hand.cur] === p && !room.players.get(p)?.online) act(room, p, { a: 'fold' }, true); }, 3000);
  }
  return { id, min: 2, max: 8, defaults, applySettings, start, handlers, view, onLeave, _eval: { best7, eval5, cmp } };
};
