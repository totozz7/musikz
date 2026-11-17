// PlayZup — Undercover (3 à 12 joueurs)
// Les civils ont tous le même mot, l'undercover un mot proche, Mr. White n'a rien.
// Chacun donne un indice à tour de rôle, puis tout le monde vote pour éliminer un suspect.
const THEMES = require('./data-undercover');
const { match } = require('./matching');

module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'undercover';
  const MIN = 3, MAX = 12;
  const POINTS = { civil: 2, undercover: 10, white: 6 };

  const defaults = () => ({ theme: 'anime', undercovers: 1, mrWhite: true, mode: 'written', clueRounds: 1, clueTime: 40 });

  function applySettings(room, p) {
    const s = room.gs.undercover;
    if (p.theme === 'all' || THEMES.some(t => t.id === p.theme)) s.theme = p.theme;
    if ([1, 2, 3].includes(+p.undercovers)) s.undercovers = +p.undercovers;
    if (typeof p.mrWhite === 'boolean') s.mrWhite = p.mrWhite;
    if (['written', 'oral'].includes(p.mode)) s.mode = p.mode;
    if ([1, 2].includes(+p.clueRounds)) s.clueRounds = +p.clueRounds;
    if ([20, 30, 40, 60].includes(+p.clueTime)) s.clueTime = +p.clueTime;
  }

  const maxUndercovers = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
  const name = (room, pid) => room.players.get(pid)?.name || '?';
  const online = (room, pid) => !!room.players.get(pid)?.online;
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }

  function start(room) {
    const s = room.gs.undercover;
    const players = [...room.players.values()].filter(p => p.online).map(p => p.id);
    const n = players.length;
    if (n < MIN) throw new Error(`Il faut au moins ${MIN} joueurs pour l'Undercover`);
    if (n > MAX) throw new Error(`${MAX} joueurs maximum pour l'Undercover`);
    const nUC = Math.min(s.undercovers, maxUndercovers(n));
    const nWhite = s.mrWhite && n >= 4 ? 1 : 0;

    // choix du thème et de la paire (en évitant celles déjà jouées dans ce salon)
    const pool = s.theme === 'all' ? THEMES : THEMES.filter(t => t.id === s.theme);
    room.ucUsed = room.ucUsed || new Set();
    let all = pool.flatMap(t => t.pairs.map(pair => ({ t, pair })));
    let fresh = all.filter(x => !room.ucUsed.has(x.pair.join('|')));
    if (!fresh.length) { room.ucUsed.clear(); fresh = all; }
    const { t, pair } = fresh[Math.floor(Math.random() * fresh.length)];
    room.ucUsed.add(pair.join('|'));
    const [civil, uc] = Math.random() < 0.5 ? pair : [pair[1], pair[0]];

    const roles = new Map();
    const shuffled = shuffle([...players]);
    shuffled.forEach((pid, i) => roles.set(pid, i < nUC ? 'undercover' : i < nUC + nWhite ? 'white' : 'civil'));
    let order = shuffle([...players]);
    if (roles.get(order[0]) === 'white') order.push(order.shift()); // Mr. White ne commence jamais

    room.g = {
      game: id, stage: 'cards', themeName: `${t.emoji} ${t.name}`, words: { civil, undercover: uc },
      roles, alive: new Set(players), order, turn: 0, tour: 1, round: 1, clues: [],
      votes: new Map(), ready: new Set(), eliminated: [], last: null, winner: null, whiteGuess: null,
      counts: { undercover: nUC, white: nWhite, civil: n - nUC - nWhite }, timer: null, deadline: 0,
    };
    room.phase = 'game';
    sysMsg(room, `🕵️ Undercover — thème ${t.emoji} ${t.name} · ${nUC} undercover${nUC > 1 ? 's' : ''}${nWhite ? ' + 1 Mr. White' : ''}`);
    later(room, 30000, () => startClues(room));
    broadcast(room); pushState(room);
  }

  // ── Phase indices ──
  const aliveOrder = (g) => g.order.filter(pid => g.alive.has(pid));
  function startClues(room) {
    const g = room.g; if (!g) return;
    g.stage = 'clues'; g.turn = 0;
    nextTurn(room, true);
  }
  function nextTurn(room, first = false) {
    const g = room.g;
    if (!first) g.turn++;
    const order = aliveOrder(g);
    // on saute les joueurs déconnectés
    while (g.turn < order.length && !online(room, order[g.turn])) {
      g.clues.push({ pid: order[g.turn], text: '(absent)', round: g.round, tour: g.tour, skipped: true });
      g.turn++;
    }
    if (g.turn >= order.length) {
      if (g.tour < room.gs.undercover.clueRounds) { g.tour++; g.turn = 0; return nextTurn(room, true); }
      return startVote(room);
    }
    const s = room.gs.undercover;
    later(room, (s.mode === 'oral' ? Math.max(s.clueTime, 40) : s.clueTime) * 1000, () => {
      g.clues.push({ pid: aliveOrder(g)[g.turn], text: '⌛ (trop tard)', round: g.round, tour: g.tour, skipped: true });
      nextTurn(room); pushState(room);
    });
    pushState(room);
  }

  // ── Phase vote ──
  function startVote(room) {
    const g = room.g;
    g.stage = 'vote'; g.votes = new Map();
    later(room, 75000, () => resolveVote(room));
    pushState(room);
  }
  function allVoted(room) {
    const g = room.g;
    return [...g.alive].filter(pid => online(room, pid)).every(pid => g.votes.has(pid));
  }
  function resolveVote(room) {
    const g = room.g; if (!g || g.stage !== 'vote') return;
    clear(g);
    const tally = new Map();
    for (const [, t] of g.votes) tally.set(t, (tally.get(t) || 0) + 1);
    const max = Math.max(0, ...tally.values());
    const top = [...tally.entries()].filter(([, v]) => v === max).map(([k]) => k);
    g.lastTally = Object.fromEntries(tally);
    if (!max || top.length > 1) {
      g.last = { tie: true, names: top.map(pid => name(room, pid)) };
      g.stage = 'result';
      sysMsg(room, max ? `⚖️ Égalité entre ${g.last.names.join(' et ')} : personne n'est éliminé` : '🤷 Personne n\'a voté');
      later(room, 6000, () => newRound(room));
      return pushState(room);
    }
    eliminate(room, top[0], max);
  }
  function eliminate(room, pid, votes) {
    const g = room.g;
    g.alive.delete(pid);
    const role = g.roles.get(pid);
    g.last = { pid, name: name(room, pid), role, votes };
    g.eliminated.push({ pid, role, round: g.round });
    const label = { civil: 'un CIVIL 😇', undercover: 'un UNDERCOVER 🕵️', white: 'MR. WHITE 👻' }[role];
    sysMsg(room, `☠️ ${name(room, pid)} est éliminé… c'était ${label}`);
    if (role === 'white') {
      g.stage = 'white';
      later(room, 35000, () => { g.whiteGuess = { text: '(pas de réponse)', ok: false }; afterElimination(room); });
      return pushState(room);
    }
    afterElimination(room);
  }
  function afterElimination(room) {
    const g = room.g;
    if (g.whiteGuess?.ok) return finish(room, 'white');
    const alive = [...g.alive];
    const civils = alive.filter(p => g.roles.get(p) === 'civil').length;
    const infiltrators = alive.length - civils;
    if (!infiltrators) return finish(room, 'civil');
    if (civils <= 1) return finish(room, alive.some(p => g.roles.get(p) === 'undercover') ? 'undercover' : 'white');
    g.stage = 'result';
    later(room, 7000, () => newRound(room));
    pushState(room);
  }
  function newRound(room) {
    const g = room.g; if (!g) return;
    g.round++; g.tour = 1;
    startClues(room);
  }

  function finish(room, winner) {
    const g = room.g;
    clear(g);
    g.stage = 'over'; g.winner = winner;
    room.gscores.undercover = room.gscores.undercover || {};
    const S = room.gscores.undercover;
    const coins = {};
    for (const [pid, role] of g.roles) {
      let win = false;
      if (winner === 'civil') win = role === 'civil';
      else if (winner === 'undercover') win = role === 'undercover' || (role === 'white' && g.alive.has(pid));
      else if (winner === 'white') win = role === 'white';
      const pts = win ? POINTS[role] : 0;
      S[pid] = (S[pid] || 0) + pts;
      coins[pid] = { coins: 10 + (win ? 15 : 0), good: win ? 1 : 0, win };
    }
    g.coins = coins;
    const msg = { civil: '😇 Les CIVILS gagnent !', undercover: '🕵️ Les UNDERCOVERS gagnent !', white: '👻 MR. WHITE gagne !' }[winner];
    sysMsg(room, `🏁 ${msg} Le mot des civils était « ${g.words.civil} », celui de l'undercover « ${g.words.undercover} ».`);
    reward(room, coins);
    broadcast(room); pushState(room);
  }

  function checkReady(room) {
    const g = room.g;
    const need = [...g.roles.keys()].filter(pid => online(room, pid));
    if (need.every(pid => g.ready.has(pid))) { clear(g); startClues(room); } else pushState(room);
  }

  // ── Actions des joueurs ──
  const handlers = {
    ready(room, me) {
      const g = room.g; if (g.stage !== 'cards' || !g.roles.has(me.id)) return;
      g.ready.add(me.id);
      checkReady(room);
    },
    clue(room, me, text) {
      const g = room.g; if (g.stage !== 'clues') return;
      if (aliveOrder(g)[g.turn] !== me.id) return;
      const oral = room.gs.undercover.mode === 'oral';
      text = String(text || '').trim().slice(0, 40);
      if (!oral && !text) return;
      // interdit de donner directement son mot
      const myWord = g.roles.get(me.id) === 'white' ? null : g.words[g.roles.get(me.id)];
      if (myWord && match(text, myWord) === 'ok') return { error: 'Tu ne peux pas donner ton mot directement 😏' };
      g.clues.push({ pid: me.id, text: oral ? '🎙️ (à l\'oral)' : text, round: g.round, tour: g.tour });
      nextTurn(room);
    },
    vote(room, me, target) {
      const g = room.g; if (g.stage !== 'vote' || !g.alive.has(me.id)) return;
      if (!g.alive.has(target) || target === me.id) return { error: 'Vote invalide' };
      g.votes.set(me.id, target);
      if (allVoted(room)) setTimeout(() => resolveVote(room), 800);
      pushState(room);
    },
    guess(room, me, text) {
      const g = room.g; if (g.stage !== 'white' || g.last?.pid !== me.id) return;
      clear(g);
      const ok = match(String(text || ''), g.words.civil) === 'ok';
      g.whiteGuess = { text: String(text || '').slice(0, 40), ok };
      sysMsg(room, ok ? `👻 Mr. White a deviné « ${g.words.civil} » !!!` : `👻 Mr. White a proposé « ${g.whiteGuess.text} »… raté !`);
      afterElimination(room);
    },
    skip(room, me) { // hôte : faire avancer la partie
      const g = room.g; if (room.hostId !== me.id) return;
      if (g.stage === 'cards') { clear(g); startClues(room); }
      else if (g.stage === 'clues') { g.clues.push({ pid: aliveOrder(g)[g.turn], text: '⏭️ (passé)', round: g.round, tour: g.tour, skipped: true }); nextTurn(room); }
      else if (g.stage === 'vote') resolveVote(room);
      else if (g.stage === 'result') { clear(g); newRound(room); }
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  // Ce que voit chaque joueur (le mot des autres reste secret)
  function view(room, pid) {
    const g = room.g;
    const role = g.roles.get(pid);
    const over = g.stage === 'over';
    const order = aliveOrder(g);
    return {
      game: id, stage: g.stage, themeName: g.themeName, mode: room.gs.undercover.mode,
      inGame: !!role, isWhite: role === 'white',
      myWord: role && role !== 'white' ? g.words[role] : null,
      order: g.order.map(p => ({ pid: p, alive: g.alive.has(p), role: over || !g.alive.has(p) ? g.roles.get(p) : null })),
      current: g.stage === 'clues' ? order[g.turn] : null,
      round: g.round, tour: g.tour, clueRounds: room.gs.undercover.clueRounds,
      clues: g.clues,
      voted: [...g.votes.keys()], myVote: g.votes.get(pid) || null,
      tally: g.stage === 'vote' ? null : g.lastTally || null,
      votes: over || g.stage !== 'vote' ? Object.fromEntries(g.votes) : null,
      ready: [...g.ready], counts: g.counts,
      last: g.last, whiteGuess: g.whiteGuess, winner: g.winner,
      words: over ? g.words : null,
      left: Math.max(0, (g.deadline || 0) - Date.now()),
      coins: over ? g.coins?.[pid] || null : null,
    };
  }

  function onLeave(room, me) {
    const g = room.g; if (!g || g.game !== id) return;
    if (g.stage === 'clues' && aliveOrder(g)[g.turn] === me.id) { g.clues.push({ pid: me.id, text: '(parti)', round: g.round, tour: g.tour, skipped: true }); nextTurn(room); }
    else if (g.stage === 'vote' && allVoted(room)) resolveVote(room);
    else if (g.stage === 'cards') checkReady(room);
  }

  const themes = () => THEMES.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, count: t.pairs.length }));
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, themes };
};
