// PlayZup — PRIMO ! (jeu de cartes de défausse, 2 à 8 joueurs, robots possibles)
// Règles classiques : même couleur, même chiffre ou même symbole ; Passe, Inversion, +2, Joker, Joker +4.
// Il reste 1 carte ? Crie « PRIMO ! » avant qu'un autre ne t'attrape (+2 cartes). Premier sans carte = gagnant.
// Mode 🤪 Pagaille : des cartes spéciales bien vicieuses s'ajoutent au paquet (échange de mains, tornade, bombe, sniper, gel…).
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'primo';
  const MIN = 2, MAX = 8;
  const COLORS = ['R', 'Y', 'G', 'B'];
  const CNAME = { R: 'rouge', Y: 'jaune', G: 'vert', B: 'bleu' };
  const BOT_NAMES = ['Robo Rita', 'Capitaine Carte', 'Mamie Joker', 'Kevin +4', 'La Machine', 'Docteur Pioche', 'Tonton Passe'];
  // cartes spéciales du mode Pagaille (toutes de couleur, sauf le +6 qui est un joker)
  const SPECIALS = {
    swap: { n: 'Échange', e: '🔄', d: 'Échange ta main avec un joueur au choix', target: true },
    tornado: { n: 'Tornade', e: '🌪️', d: 'Toutes les mains tournent d\'un cran' },
    gift: { n: 'Cadeau piégé', e: '🎁', d: 'Refile 2 de tes cartes à un joueur au choix', target: true },
    bomb: { n: 'Bombe', e: '💣', d: 'Tous les autres piochent 2' },
    sniper: { n: 'Sniper', e: '🎯', d: 'Un joueur au choix pioche 3', target: true },
    freeze: { n: 'Congélo', e: '🧊', d: 'Un joueur au choix saute ses 2 prochains tours', target: true },
    mirror: { n: 'Miroir', e: '🪞', d: 'Renvoie une attaque de pioche à l\'envoyeur' },
    clover: { n: 'Trèfle', e: '🍀', d: 'Défausse 2 cartes au hasard de ta main' },
    dyn: { n: 'Dynamite', e: '🧨', d: 'Un joueur au hasard (peut-être toi !) pioche 4' },
    clean: { n: 'Grand ménage', e: '🧹', d: 'Défausse toutes tes cartes de cette couleur' },
    roulette: { n: 'Roulette', e: '🎰', d: 'Chacun pioche entre 0 et 2 cartes' },
    spy: { n: 'Espion', e: '👁️', d: 'Regarde la main d\'un joueur', target: true },
    charity: { n: 'Charité', e: '🤲', d: 'Chacun donne une carte au hasard à son voisin' },
    again: { n: 'Encore !', e: '👑', d: 'Tu rejoues tout de suite' },
    thief: { n: 'Pickpocket', e: '🧤', d: 'Vole 1 carte… puis donnes-en 2 au hasard à la victime', target: true },
  };
  const DRAW = { p2: 2, p4: 4, p6: 6 };
  const defaults = () => ({ mode: 'classic', bots: 0, stack: true, time: 25 });

  function applySettings(room, p) {
    const s = room.gs.primo;
    if (['classic', 'chaos'].includes(p.mode)) s.mode = p.mode;
    if ([0, 1, 2, 3, 5, 7].includes(+p.bots)) s.bots = +p.bots;
    if (p.stack !== undefined) s.stack = p.stack === true;
    if ([15, 25, 40].includes(+p.time)) s.time = +p.time;
  }

  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const isBot = (room, s) => s.bot || !room.players.get(s.pid)?.online;
  const log = (g, t) => { g.log.unshift(t); g.log = g.log.slice(0, 10); };
  const ev = (g, e) => { g.evn++; g.events.push({ ...e, id: g.evn }); g.events = g.events.slice(-12); };
  const nm = (g, k) => g.seats[k].name;

  function buildDeck(chaos) {
    const d = []; let n = 0;
    const add = (c, v) => d.push({ id: n++, c, v });
    for (const c of COLORS) {
      add(c, '0');
      for (let i = 1; i <= 9; i++) { add(c, String(i)); add(c, String(i)); }
      for (const v of ['skip', 'rev', 'p2']) { add(c, v); add(c, v); }
    }
    for (let i = 0; i < 4; i++) { add('W', 'wild'); add('W', 'p4'); }
    if (chaos) {
      const keys = Object.keys(SPECIALS);
      keys.forEach((k, i) => { add(COLORS[i % 4], k); add(COLORS[(i + 2) % 4], k); });
      ['swap', 'bomb', 'sniper', 'mirror', 'tornado', 'freeze'].forEach((k, i) => add(COLORS[(i + 1) % 4], k));
      add('W', 'p6'); add('W', 'p6');
    }
    return shuffle(d);
  }

  function start(room) {
    const s = room.gs.primo;
    const humans = [...room.players.values()].filter(p => p.online);
    if (humans.length > MAX) throw new Error(`${MAX} joueurs maximum à PRIMO`);
    const nb = Math.min(s.bots, MAX - humans.length);
    if (humans.length + nb < MIN) throw new Error('Il faut au moins 2 joueurs : invite un pote ou ajoute un robot 🤖');
    const seats = shuffle([
      ...humans.map(p => ({ pid: p.id, name: p.name, bot: false })),
      ...shuffle([...BOT_NAMES]).slice(0, nb).map(n => ({ pid: null, name: '🤖 ' + n, bot: true })),
    ]).map(x => ({ ...x, hand: [], primo: false, frozen: 0, played: 0 }));
    const chaos = s.mode === 'chaos';
    const g = room.g = {
      game: id, stage: 'play', seats, deck: buildDeck(chaos), discard: [], color: null, dir: 1, turn: 0, pending: null,
      phase: 'deal', chaos, stack: s.stack, time: s.time * 1000, log: [], events: [], evn: 0, timer: null, deadline: 0,
      gameKey: Date.now().toString(36), drawn: null, watch: null, spy: null, finished: [],
    };
    room.phase = 'game';
    for (let r = 0; r < 7; r++) seats.forEach(st => st.hand.push(g.deck.pop()));
    // première carte : un chiffre
    let i = g.deck.findIndex(c => /^\d$/.test(c.v));
    const first = g.deck.splice(i, 1)[0];
    g.discard.push(first); g.color = first.c;
    g.turn = Math.floor(Math.random() * seats.length);
    ev(g, { type: 'deal', first });
    log(g, `🃏 Distribution ! Première carte : ${label(first)}`);
    sysMsg(room, `🃏 PRIMO ! — ${seats.length} joueurs${nb ? ` (dont ${nb} robot${nb > 1 ? 's' : ''})` : ''}${chaos ? ' · 🤪 mode Pagaille' : ''}${s.stack ? ' · cumul des +2/+4' : ''}`);
    pushState(room);
    later(room, 2600, () => beginTurn(room));
    broadcast(room);
  }

  const top = (g) => g.discard[g.discard.length - 1];
  const label = (c) => c.v in SPECIALS ? `${SPECIALS[c.v].e} ${SPECIALS[c.v].n}${c.c !== 'W' ? ' ' + CNAME[c.c] : ''}`
    : c.v === 'wild' ? '🌈 Joker' : c.v === 'p4' ? '🌈 +4' : c.v === 'p6' ? '🔥 +6' : c.v === 'p2' ? `+2 ${CNAME[c.c]}` : c.v === 'skip' ? `⛔ Passe ${CNAME[c.c]}` : c.v === 'rev' ? `🔁 Inversion ${CNAME[c.c]}` : `${c.v} ${CNAME[c.c]}`;

  function canPlay(g, c) {
    if (g.pending) return (g.stack && c.v in DRAW) || c.v === 'mirror';
    if (c.c === 'W') return true;
    return c.c === g.color || c.v === top(g).v;
  }
  function drawCards(g, k, n) {
    const got = [];
    for (let i = 0; i < n; i++) {
      if (!g.deck.length) {
        if (g.discard.length <= 1) break;
        const t = g.discard.pop();
        g.deck = shuffle(g.discard); g.discard = [t];
        ev(g, { type: 'reshuffle' });
      }
      const c = g.deck.pop(); g.seats[k].hand.push(c); got.push(c);
    }
    if (g.seats[k].hand.length > 1) g.seats[k].primo = false;
    return got;
  }
  const next = (g, k, step = 1) => (k + g.dir * step + g.seats.length * 8) % g.seats.length;

  function beginTurn(room) {
    const g = room.g; if (g.stage !== 'play') return;
    const s = g.seats[g.turn];
    if (s.frozen > 0) {
      s.frozen--;
      ev(g, { type: 'frozen', seat: g.turn, left: s.frozen });
      log(g, `🧊 ${s.name} est congelé·e et passe son tour`);
      g.phase = 'anim'; pushState(room);
      return later(room, 1400, () => { g.turn = next(g, g.turn); beginTurn(room); });
    }
    g.phase = 'turn'; g.drawn = null;
    if (isBot(room, s)) later(room, 1100 + Math.random() * 1300, () => botAct(room));
    else later(room, g.time, () => botAct(room));
    pushState(room);
  }

  // ── jouer une carte ──
  function play(room, k, cid, color, target) {
    const g = room.g, s = g.seats[k];
    const c = s.hand.find(x => x.id === cid);
    if (!c || !canPlay(g, c)) return { error: 'Tu ne peux pas jouer cette carte' };
    if (g.drawn && g.drawn !== cid) return { error: 'Tu ne peux jouer que la carte piochée' };
    const sp = SPECIALS[c.v];
    if (sp?.target && !(Number.isInteger(target) && target >= 0 && target < g.seats.length && target !== k)) target = pickTarget(g, k, c.v);
    if (c.c === 'W' && !COLORS.includes(color)) color = bestColor(s.hand.filter(x => x !== c));
    clear(g);
    s.hand = s.hand.filter(x => x !== c); s.played++;
    g.discard.push(c);
    g.color = c.c === 'W' ? color : c.c;
    g.drawn = null;
    ev(g, { type: 'play', seat: k, card: c, color: g.color, target: sp?.target ? target : undefined });
    log(g, `${s.name} pose ${label(c)}${c.c === 'W' ? ` → ${CNAME[g.color]}` : ''}`);
    if (s.hand.length === 1 && !s.primo) g.watch = { seat: k, until: Date.now() + 4500 };
    if (s.hand.length !== 1) { s.primo = false; if (g.watch?.seat === k) g.watch = null; }
    let wait = 750, nextTurn = next(g, k), again = false;
    if (!s.hand.length) { // dernière carte posée : victoire, on ne joue pas l'effet
      if (sp) ev(g, { type: 'special', kind: c.v, seat: k, target, final: true });
      g.phase = 'anim'; pushState(room); later(room, 1500, () => finish(room, k)); return { ok: true };
    }
    // effets
    const v = c.v;
    if (v === 'skip') { const vic = next(g, k); ev(g, { type: 'skip', seat: vic }); log(g, `⛔ ${nm(g, vic)} passe son tour`); nextTurn = next(g, k, 2); wait = 1300; }
    else if (v === 'rev') {
      g.dir *= -1; ev(g, { type: 'rev', dir: g.dir }); log(g, '🔁 Le sens du jeu change !');
      nextTurn = g.seats.length === 2 ? k : next(g, k); wait = 1200;
    }
    else if (v in DRAW) {
      const n = DRAW[v];
      if (g.stack) { g.pending = { n: (g.pending?.n || 0) + n, from: k }; ev(g, { type: 'stack', n: g.pending.n, seat: k }); wait = 1100; }
      else {
        const vic = next(g, k); drawCards(g, vic, n);
        ev(g, { type: 'draw', seat: vic, n, reason: v }); log(g, `😱 ${nm(g, vic)} pioche ${n} et passe son tour`);
        nextTurn = next(g, k, 2); wait = 1500;
      }
    }
    else if (sp) {
      const r = special(g, k, v, target);
      wait = r.wait; if (r.nextTurn !== undefined) nextTurn = r.nextTurn; again = !!r.again;
    }
    if (again) nextTurn = k;
    // fin ?
    const winner = s.hand.length === 0 ? k : g.seats.findIndex(x => x.hand.length === 0);
    if (winner >= 0) { g.phase = 'anim'; pushState(room); return later(room, wait + 600, () => finish(room, winner)); }
    g.turn = nextTurn;
    g.phase = 'anim';
    pushState(room);
    later(room, wait, () => beginTurn(room));
    return { ok: true };
  }

  function special(g, k, v, target) {
    const s = g.seats[k], sp = SPECIALS[v], others = g.seats.map((x, i) => i).filter(i => i !== k);
    const e = { type: 'special', kind: v, seat: k, target };
    let wait = 2300, out = {};
    const T = Number.isInteger(target) ? g.seats[target] : null;
    switch (v) {
      case 'swap': { const h = s.hand; s.hand = T.hand; T.hand = h; s.primo = T.primo = false; log(g, `🔄 ${s.name} échange sa main avec ${T.name} !`); break; }
      case 'tornado': {
        const hands = g.seats.map(x => x.hand);
        g.seats.forEach((x, i) => { x.hand = hands[(i - g.dir + g.seats.length) % g.seats.length]; x.primo = false; });
        log(g, '🌪️ TORNADE ! Toutes les mains tournent'); e.dir = g.dir; break;
      }
      case 'gift': { const give = shuffle([...s.hand]).slice(0, 2); s.hand = s.hand.filter(c => !give.includes(c)); T.hand.push(...give); T.primo = false; e.n = give.length; log(g, `🎁 ${s.name} refile ${give.length} cartes à ${T.name}`); break; }
      case 'bomb': { others.forEach(i => drawCards(g, i, 2)); e.victims = others; log(g, `💣 BOUM ! Tous les autres piochent 2`); wait = 2600; break; }
      case 'sniper': { drawCards(g, target, 3); log(g, `🎯 ${s.name} snipe ${T.name} : +3 !`); break; }
      case 'freeze': { T.frozen += 2; log(g, `🧊 ${T.name} est congelé·e pour 2 tours`); break; }
      case 'mirror': {
        if (g.pending && g.pending.from !== k) {
          const back = g.pending.from; g.pending = { n: g.pending.n, from: k };
          e.back = back; e.n = g.pending.n;
          log(g, `🪞 MIROIR ! ${s.name} renvoie +${g.pending.n} à ${nm(g, back)}`);
          out.nextTurn = back;
        } else { log(g, '🪞 Miroir… sans rien à renvoyer'); wait = 1200; }
        break;
      }
      case 'clover': { const d = shuffle([...s.hand]).slice(0, 2); s.hand = s.hand.filter(c => !d.includes(c)); g.discard.splice(g.discard.length - 1, 0, ...d); e.n = d.length; log(g, `🍀 ${s.name} se débarrasse de ${d.length} cartes`); break; }
      case 'dyn': { const vic = Math.floor(Math.random() * g.seats.length); drawCards(g, vic, 4); e.victim = vic; log(g, `🧨 La dynamite explose sur ${nm(g, vic)} : +4 !`); wait = 3000; break; }
      case 'clean': { const col = g.color; const d = s.hand.filter(c => c.c === col); s.hand = s.hand.filter(c => c.c !== col); g.discard.splice(g.discard.length - 1, 0, ...d); e.n = d.length; log(g, `🧹 Grand ménage : ${s.name} défausse ${d.length} carte${d.length > 1 ? 's' : ''} ${CNAME[col]}${d.length > 1 ? 's' : ''}`); break; }
      case 'roulette': { e.res = g.seats.map((x, i) => { const n = Math.floor(Math.random() * 3); drawCards(g, i, n); return n; }); log(g, `🎰 Roulette : ${g.seats.map((x, i) => `${x.name} +${e.res[i]}`).join(', ')}`); wait = 3000; break; }
      case 'spy': { g.spy = { by: k, target, until: Date.now() + 7000 }; log(g, `👁️ ${s.name} espionne la main de ${T.name}…`); wait = 1600; break; }
      case 'charity': {
        const gifts = g.seats.map(x => x.hand.length ? x.hand[Math.floor(Math.random() * x.hand.length)] : null);
        g.seats.forEach((x, i) => { if (gifts[i]) x.hand = x.hand.filter(c => c !== gifts[i]); });
        g.seats.forEach((x, i) => { if (gifts[i]) g.seats[next(g, i)].hand.push(gifts[i]); x.primo = false; });
        e.dir = g.dir; log(g, '🤲 Charité : chacun donne une carte à son voisin'); break;
      }
      case 'again': { out.again = true; log(g, `👑 ${s.name} rejoue !`); wait = 1300; break; }
      case 'thief': {
        if (T.hand.length) { const st = T.hand[Math.floor(Math.random() * T.hand.length)]; T.hand = T.hand.filter(c => c !== st); s.hand.push(st); }
        const give = shuffle([...s.hand]).slice(0, 2); s.hand = s.hand.filter(c => !give.includes(c)); T.hand.push(...give);
        s.primo = T.primo = false; log(g, `🧤 ${s.name} fait les poches de ${T.name} (+1, −2)`); break;
      }
    }
    if (s.hand.length === 1 && !s.primo) g.watch = { seat: k, until: Date.now() + 4500 };
    ev(g, e);
    void sp;
    return { wait, ...out };
  }

  function drawAction(room, k) {
    const g = room.g, s = g.seats[k];
    clear(g);
    if (g.pending) {
      const n = g.pending.n; g.pending = null;
      drawCards(g, k, n);
      ev(g, { type: 'draw', seat: k, n, reason: 'stack' }); log(g, `😱 ${s.name} pioche ${n} cartes !`);
      g.turn = next(g, k); g.phase = 'anim'; pushState(room);
      return later(room, 1500, () => beginTurn(room));
    }
    const [c] = drawCards(g, k, 1);
    ev(g, { type: 'draw', seat: k, n: c ? 1 : 0 });
    if (c && canPlay(g, c)) { // on peut jouer la carte piochée
      g.drawn = c.id; g.phase = 'drawn'; pushState(room);
      if (isBot(room, s)) later(room, 900, () => play(room, k, c.id, bestColor(s.hand), pickTarget(g, k, c.v)));
      else later(room, Math.min(g.time, 12000), () => pass(room, k));
      return;
    }
    log(g, `${s.name} pioche`);
    g.turn = next(g, k); g.phase = 'anim'; pushState(room);
    later(room, 700, () => beginTurn(room));
  }
  function pass(room, k) {
    const g = room.g; clear(g); g.drawn = null;
    log(g, `${g.seats[k].name} pioche et passe`);
    g.turn = next(g, k); g.phase = 'anim'; pushState(room);
    later(room, 500, () => beginTurn(room));
  }

  // ── PRIMO ! ──
  function sayPrimo(room, k) {
    const g = room.g, s = g.seats[k];
    if (s.hand.length > 2 || s.primo) return;
    s.primo = true;
    if (g.watch?.seat === k) g.watch = null;
    ev(g, { type: 'primo', seat: k }); log(g, `📣 ${s.name} : « PRIMO ! »`);
    pushState(room);
  }
  function catchPrimo(room, k, t) {
    const g = room.g, w = g.watch;
    if (!w || w.seat !== t || t === k || Date.now() > w.until || g.seats[t].hand.length !== 1 || g.seats[t].primo) return;
    g.watch = null;
    drawCards(g, t, 2);
    ev(g, { type: 'caught', seat: t, by: k }); log(g, `🚨 ${g.seats[k].name} attrape ${nm(g, t)} qui a oublié PRIMO : +2 !`);
    pushState(room);
  }

  // ── robots ──
  function bestColor(hand) {
    const n = { R: 0, Y: 0, G: 0, B: 0 }; hand.forEach(c => { if (c.c in n) n[c.c]++; });
    return Object.entries(n).sort((a, b) => b[1] - a[1] + Math.random() * .1)[0][0];
  }
  function pickTarget(g, k, v) {
    const others = g.seats.map((x, i) => i).filter(i => i !== k);
    if (v === 'swap') return others.sort((a, b) => g.seats[a].hand.length - g.seats[b].hand.length)[0];
    if (v === 'spy') return others[Math.floor(Math.random() * others.length)];
    return others.sort((a, b) => g.seats[a].hand.length - g.seats[b].hand.length)[0]; // on vise celui qui est près de gagner
  }
  function botAct(room) {
    const g = room.g; if (g.stage !== 'play' || !['turn', 'drawn'].includes(g.phase)) return;
    const k = g.turn, s = g.seats[k];
    if (g.phase === 'drawn') { const c = s.hand.find(x => x.id === g.drawn); return c ? play(room, k, c.id, bestColor(s.hand), pickTarget(g, k, c.v)) : pass(room, k); }
    const ok = s.hand.filter(c => canPlay(g, c));
    if (!ok.length) return drawAction(room, k);
    const minOther = Math.min(...g.seats.filter((x, i) => i !== k).map(x => x.hand.length));
    const score = (c) => {
      let v = Math.random();
      if (c.v === 'swap') v += s.hand.length > minOther + 1 ? 6 : -5;
      if (c.v in DRAW || ['skip', 'sniper', 'freeze', 'bomb', 'thief'].includes(c.v)) v += minOther <= 2 ? 4 : 1;
      if (c.c === 'W') v -= s.hand.length > 3 ? 2 : -1;
      if (c.v === 'clean') v += s.hand.filter(x => x.c === g.color).length;
      if (c.v === 'clover') v += 2;
      if (c.v === 'mirror' && g.pending) v += 5;
      if (/^\d$/.test(c.v)) v += 1;
      return v;
    };
    const c = ok.sort((a, b) => score(b) - score(a))[0];
    // le robot pense (parfois…) à crier PRIMO
    if (s.hand.length === 2 && Math.random() < .85) { s.primo = true; ev(g, { type: 'primo', seat: k }); log(g, `📣 ${s.name} : « PRIMO ! »`); }
    play(room, k, c.id, bestColor(s.hand.filter(x => x !== c)), pickTarget(g, k, c.v));
    // les robots attrapent les oublis des autres
    if (g.watch && g.watch.seat !== k) {
      const w = g.watch;
      setTimeout(() => { if (room.g === g && g.watch === w) { const bots = g.seats.map((x, i) => i).filter(i => i !== w.seat && isBot(room, g.seats[i])); if (bots.length && Math.random() < .6) catchPrimo(room, bots[0], w.seat); } }, 1800 + Math.random() * 1800);
    }
  }

  function finish(room, w) {
    const g = room.g; clear(g);
    g.stage = 'over'; g.phase = 'over'; g.winner = w;
    const pts = (h) => h.reduce((a, c) => a + (/^\d$/.test(c.v) ? +c.v : c.c === 'W' ? 50 : 20), 0);
    g.ranking = g.seats.map((s, k) => ({ k, left: s.hand.length, pts: pts(s.hand) })).sort((a, b) => a.left - b.left || a.pts - b.pts);
    const humans = g.seats.filter(s => !s.bot).length;
    g.coins = {};
    g.ranking.forEach((r, i) => {
      const s = g.seats[r.k]; if (s.bot) return;
      let c = 10 + 2 * Math.min(25, s.played);
      if (humans >= 2) c += [30, 15, 8][i] || 0; else if (i === 0) c += 18;
      g.coins[s.pid] = { coins: c, win: i === 0 };
    });
    ev(g, { type: 'win', seat: w });
    log(g, `🏆 ${nm(g, w)} n'a plus de cartes : PRIMO GAGNÉ !`);
    room.gscores.primo = room.gscores.primo || {};
    if (!g.seats[w].bot) room.gscores.primo[g.seats[w].pid] = (room.gscores.primo[g.seats[w].pid] || 0) + 1;
    sysMsg(room, `🏆 ${nm(g, w)} gagne la partie de PRIMO !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }

  const mySeat = (g, pid) => g.seats.findIndex(s => s.pid === pid);
  const handlers = {
    play(room, me, d) {
      const g = room.g, k = mySeat(g, me.id);
      if (g.stage !== 'play' || !['turn', 'drawn'].includes(g.phase) || k !== g.turn || !d) return;
      return play(room, k, +d.id, d.color, d.target === undefined ? undefined : +d.target);
    },
    draw(room, me) { const g = room.g, k = mySeat(g, me.id); if (g.stage === 'play' && g.phase === 'turn' && k === g.turn) drawAction(room, k); },
    pass(room, me) { const g = room.g, k = mySeat(g, me.id); if (g.stage === 'play' && g.phase === 'drawn' && k === g.turn) pass(room, k); },
    primo(room, me) { const g = room.g, k = mySeat(g, me.id); if (g.stage === 'play' && k >= 0) sayPrimo(room, k); },
    catch(room, me, t) { const g = room.g, k = mySeat(g, me.id); if (g.stage === 'play' && k >= 0) catchPrimo(room, k, +t); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g, me = mySeat(g, pid), now = Date.now();
    const myTurn = g.stage === 'play' && me === g.turn && ['turn', 'drawn'].includes(g.phase);
    const hand = me >= 0 ? g.seats[me].hand : [];
    return {
      game: id, stage: g.stage, phase: g.phase, gameKey: g.gameKey, me, turn: g.turn, dir: g.dir, color: g.color, chaos: g.chaos, stack: g.stack,
      top: top(g), under: g.discard.slice(-6, -1), deck: g.deck.length, pending: g.pending,
      seats: g.seats.map(s => ({ pid: s.pid, name: s.name, bot: s.bot, n: s.hand.length, primo: s.primo, frozen: s.frozen, online: s.bot || !!room.players.get(s.pid)?.online })),
      hand, playable: myTurn ? hand.filter(c => canPlay(g, c) && (!g.drawn || c.id === g.drawn)).map(c => c.id) : [],
      drawn: myTurn ? g.drawn : null,
      watch: g.watch && now < g.watch.until && g.seats[g.watch.seat].hand.length === 1 && !g.seats[g.watch.seat].primo ? g.watch.seat : null,
      spy: g.spy && g.spy.by === me && now < g.spy.until ? { target: g.spy.target, hand: g.seats[g.spy.target].hand, until: g.spy.until - now } : null,
      events: g.events, log: g.log, left: Math.max(0, g.deadline - now), time: g.time,
      winner: g.winner ?? null, ranking: g.ranking || null, coins: g.stage === 'over' ? g.coins?.[pid] || null : null,
      specials: g.chaos ? SPECIALS : null,
    };
  }

  function onLeave(room, me) {
    const g = room.g; if (!g || g.game !== id || g.stage !== 'play') return;
    if (g.seats[g.turn]?.pid === me.id && ['turn', 'drawn'].includes(g.phase)) later(room, 1200, () => botAct(room));
  }

  return { id, min: 1, max: MAX, defaults, applySettings, start, handlers, view, onLeave, SPECIALS };
};
