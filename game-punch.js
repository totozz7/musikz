// PlayZup — PUNCHLINE (3 à 10 joueurs). Chacun reçoit 2 sujets, écrit la réponse la plus drôle ;
// sur chaque sujet, deux joueurs s'affrontent et les autres votent. 100 % des votes = PUNCHLINE ! (bonus)
// Dernière manche : « Le mot de la fin », tout le monde répond au même sujet. Points ×1, ×2, puis ×3.
const PROMPTS = require('./data-punch');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'punch';
  const MIN = 3, MAX = 10;
  const defaults = () => ({ rounds: 2, time: 75 });
  function applySettings(room, p) {
    const s = room.gs.punch;
    if ([1, 2, 3].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([45, 75, 100].includes(+p.time)) s.time = +p.time;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const players = (room) => [...room.players.values()].filter(p => p.online);

  function start(room) {
    const s = room.gs.punch;
    if (players(room).length < MIN) throw new Error('Il faut au moins 3 joueurs pour Punchline (2 qui s\'affrontent + 1 qui vote) 🎤');
    room.g = { game: id, stage: 'write', gameKey: Date.now().toString(36), rounds: s.rounds + 1, time: s.time * 1000, round: 0,
      deck: shuffle([...PROMPTS]), scores: {}, duels: [], di: -1, answers: {}, votes: {}, timer: null, deadline: 0, results: [], order: [] };
    players(room).forEach(p => { room.g.scores[p.id] = 0; });
    room.phase = 'game';
    sysMsg(room, `🎤 Punchline — ${s.rounds} manche${s.rounds > 1 ? 's' : ''} + le mot de la fin · sois le plus drôle !`);
    broadcast(room);
    nextRound(room);
  }
  const final = (g) => g.round === g.rounds;
  function nextRound(room) {
    const g = room.g;
    g.round++;
    if (g.round > g.rounds) return finish(room);
    const ps = shuffle(players(room).map(p => p.id));
    g.order = ps; g.answers = {}; g.votes = {}; g.di = -1; g.results = [];
    if (!g.deck.length) g.deck = shuffle([...PROMPTS]);
    if (final(g)) g.duels = [{ prompt: g.deck.pop(), players: ps }];
    else g.duels = ps.map((p, k) => ({ prompt: g.deck.pop() || 'Une réponse drôle', players: [p, ps[(k + 1) % ps.length]] }));
    g.stage = 'write';
    later(room, g.time, () => toVote(room));
    pushState(room);
  }
  const myDuels = (g, pid) => g.duels.map((d, i) => ({ ...d, i })).filter(d => d.players.includes(pid));
  function allWritten(room) {
    const g = room.g;
    return players(room).every(p => myDuels(g, p.id).every(d => g.answers[d.i + ':' + p.id]));
  }
  function toVote(room) {
    const g = room.g; if (g.stage !== 'write') return;
    nextDuel(room);
  }
  function nextDuel(room) {
    const g = room.g;
    g.di++;
    if (g.di >= g.duels.length) { g.stage = 'scores'; pushState(room); return later(room, 6000, () => nextRound(room)); }
    g.stage = 'vote'; g.votes = {};
    later(room, final(g) ? 25000 : 18000, () => duelResult(room));
    pushState(room);
  }
  function voters(room) { const g = room.g, d = g.duels[g.di]; return players(room).filter(p => final(g) || !d.players.includes(p.id)); }
  function duelResult(room) {
    const g = room.g; if (g.stage !== 'vote') return;
    clear(g);
    const d = g.duels[g.di], mult = final(g) ? 3 : g.round;
    const count = {}; Object.values(g.votes).forEach(t => { count[t] = (count[t] || 0) + 1; });
    const nv = Object.keys(g.votes).length;
    const res = { prompt: d.prompt, entries: d.players.map(p => ({ pid: p, text: g.answers[g.di + ':' + p] || null, votes: count[p] || 0 })), gains: {}, punch: null };
    res.entries.forEach(e => {
      let pts = Math.round((nv ? e.votes / nv : 0) * 1000 * mult / 10) * 1;
      if (!e.text) pts = 0;
      if (!final(g) && nv >= 2 && e.votes === nv) { pts += 250 * mult; res.punch = e.pid; }
      if (pts) { res.gains[e.pid] = pts; g.scores[e.pid] = (g.scores[e.pid] || 0) + pts; }
    });
    g.results.push(res); g.last = res;
    g.stage = 'duel';
    later(room, final(g) ? 7000 : 5000, () => nextDuel(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 12 + Math.round(pts / 40) + ([30, 15, 8][i] || 0), win: i === 0 }; });
    room.gscores.punch = room.gscores.punch || {};
    if (rank[0]) room.gscores.punch[rank[0][0]] = (room.gscores.punch[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 Punchline : ${room.players.get(rank[0]?.[0])?.name || '?'} est le roi de la vanne (${rank[0]?.[1] || 0} pts) !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const handlers = {
    quip(room, me, d) {
      const g = room.g; if (g.stage !== 'write' || !d) return;
      const duel = g.duels[+d.i]; if (!duel || !duel.players.includes(me.id)) return;
      const t = String(d.text || '').trim().slice(0, 90); if (!t) return { error: 'Écris une réponse 😉' };
      g.answers[+d.i + ':' + me.id] = t;
      pushState(room);
      if (allWritten(room)) later(room, 800, () => toVote(room));
      return { ok: true };
    },
    vote(room, me, who) {
      const g = room.g; if (g.stage !== 'vote') return;
      const d = g.duels[g.di];
      if (!voters(room).some(p => p.id === me.id) || !d.players.includes(who) || who === me.id) return { error: 'Tu ne peux pas voter pour toi 😅' };
      g.votes[me.id] = who;
      pushState(room);
      if (voters(room).every(p => g.votes[p.id])) later(room, 600, () => duelResult(room));
      return { ok: true };
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function view(room, pid) {
    const g = room.g, d = g.duels[g.di];
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, round: g.round, rounds: g.rounds, final: final(g), me: pid, time: g.time,
      left: Math.max(0, g.deadline - Date.now()), scores: g.scores, mult: final(g) ? 3 : g.round };
    if (g.stage === 'write') {
      v.mine = myDuels(g, pid).map(x => ({ i: x.i, prompt: x.prompt, done: !!g.answers[x.i + ':' + pid], text: g.answers[x.i + ':' + pid] || '' }));
      v.done = players(room).filter(p => myDuels(g, p.id).every(x => g.answers[x.i + ':' + p.id])).map(p => p.id);
    }
    if (g.stage === 'vote' && d) {
      v.duel = { n: g.di + 1, total: g.duels.length, prompt: d.prompt, entries: shuffleStable(d.players.map(p => ({ id: p, text: g.answers[g.di + ':' + p] || '…' })), g.di), canVote: voters(room).some(p => p.id === pid), mine: d.players.includes(pid) && !final(g), myVote: g.votes[pid] || null, voted: Object.keys(g.votes).length, voters: voters(room).length };
    }
    if (g.stage === 'duel' || g.stage === 'scores' || g.stage === 'over') v.last = g.last;
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  // ordre d'affichage stable (mais pas toujours le même joueur à gauche)
  function shuffleStable(a, seed) { return seed % 2 ? [...a].reverse() : a; }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view };
};
