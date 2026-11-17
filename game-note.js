// PlayZup — Jeu de la Note (2 à 10 joueurs)
// À chaque manche : un RÉPONDEUR reçoit une note secrète de 1 à 10.
// Un QUESTIONNEUR lui envoie 3 thèmes. Le répondeur répond à chaque thème par quelque chose
// qui « vaut » sa note. Les autres (dont le questionneur) devinent la note. Les rôles tournent.
const THEMES = require('./data-note');

module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'note';
  const MIN = 2, MAX = 10;
  const defaults = () => ({ tours: 1, answerTime: 120 });

  function applySettings(room, p) {
    const s = room.gs.note;
    if ([1, 2, 3].includes(+p.tours)) s.tours = +p.tours;
    if ([60, 90, 120, 180].includes(+p.answerTime)) s.answerTime = +p.answerTime;
  }

  const name = (room, pid) => room.players.get(pid)?.name || '?';
  const online = (room, pid) => !!room.players.get(pid)?.online;
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const offer = (n = 12, not = []) => shuffle(THEMES.filter(t => !not.includes(t.id))).slice(0, n);

  function start(room) {
    const players = [...room.players.values()].filter(p => p.online).map(p => p.id);
    if (players.length < MIN) throw new Error(`Il faut au moins ${MIN} joueurs pour le Jeu de la Note`);
    if (players.length > MAX) throw new Error(`${MAX} joueurs maximum pour le Jeu de la Note`);
    const seq = shuffle([...players]);
    room.g = {
      game: id, seq, idx: -1, total: seq.length * room.gs.note.tours, scores: Object.fromEntries(seq.map(p => [p, 0])),
      stage: 'pick', history: [], timer: null, deadline: 0,
    };
    room.phase = 'game';
    sysMsg(room, `🔢 Jeu de la Note — ${room.g.total} manche${room.g.total > 1 ? 's' : ''}, chacun sera noté ${room.gs.note.tours} fois`);
    nextRound(room);
    broadcast(room);
  }

  function nextRound(room) {
    const g = room.g;
    g.idx++;
    if (g.idx >= g.total) return finish(room);
    const n = g.seq.length;
    // on saute les joueurs partis
    let tries = 0;
    while (!online(room, g.seq[g.idx % n]) && tries++ < n) { g.idx++; if (g.idx >= g.total) return finish(room); }
    g.answerer = g.seq[g.idx % n];
    let k = 1; g.asker = g.seq[(g.idx + k) % n];
    while ((g.asker === g.answerer || !online(room, g.asker)) && k < n) g.asker = g.seq[(g.idx + ++k) % n];
    g.note = 1 + Math.floor(Math.random() * 10);
    g.offered = offer(); g.rerolls = 2;
    g.themes = null; g.answers = null; g.guesses = new Map(); g.result = null;
    g.stage = 'pick';
    later(room, 45000, () => pick(room, shuffle([...g.offered]).slice(0, 3).map(t => t.id)));
    pushState(room);
  }

  function pick(room, ids) {
    const g = room.g; if (g.stage !== 'pick') return;
    const chosen = ids.map(i => g.offered.find(t => t.id === i)).filter(Boolean);
    if (chosen.length !== 3) return { error: 'Choisis exactement 3 thèmes' };
    g.themes = chosen;
    g.stage = 'answer';
    later(room, room.gs.note.answerTime * 1000, () => answer(room, g.answerDraft || ['', '', '']));
    pushState(room);
  }

  function answer(room, list) {
    const g = room.g; if (g.stage !== 'answer') return;
    g.answers = [0, 1, 2].map(i => String(list?.[i] || '').trim().slice(0, 80) || '🤐 (pas de réponse)');
    g.stage = 'guess';
    later(room, 60000, () => reveal(room));
    pushState(room);
  }

  const guessers = (room) => { const g = room.g; return [...room.players.values()].filter(p => p.online && p.id !== g.answerer).map(p => p.id); };

  function reveal(room) {
    const g = room.g; if (g.stage !== 'guess') return;
    clear(g);
    const rows = [];
    let clear1 = 0;
    for (const [pid, n] of g.guesses) {
      const diff = Math.abs(n - g.note);
      const pts = diff === 0 ? 3 : diff === 1 ? 2 : diff === 2 ? 1 : 0;
      if (diff <= 1) clear1++;
      g.scores[pid] = (g.scores[pid] || 0) + pts;
      rows.push({ pid, guess: n, pts, diff });
    }
    // le répondeur marque 1 point par joueur qui a vu juste à 1 près (récompense les réponses claires)
    g.scores[g.answerer] = (g.scores[g.answerer] || 0) + clear1;
    g.result = { rows: rows.sort((a, b) => a.diff - b.diff), answererPts: clear1 };
    g.history.push({ answerer: g.answerer, note: g.note, themes: g.themes.map(t => t.name), answers: g.answers });
    g.stage = 'reveal';
    sysMsg(room, `🔢 La note de ${name(room, g.answerer)} était ${g.note}/10 !`);
    later(room, 9000, () => nextRound(room));
    pushState(room); broadcast(room);
  }

  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    room.gscores.note = room.gscores.note || {};
    const ranking = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    const coins = {};
    ranking.forEach(([pid, sc], i) => {
      room.gscores.note[pid] = (room.gscores.note[pid] || 0) + sc;
      coins[pid] = { coins: Math.min(60, 10 + 2 * sc + ([15, 8, 4][i] || 0)), good: sc, win: i === 0 && ranking.length > 1 };
    });
    g.coins = coins; g.ranking = ranking.map(([pid, sc]) => ({ pid, score: sc }));
    const top = ranking[0];
    if (top) sysMsg(room, `🏆 ${name(room, top[0])} remporte le Jeu de la Note avec ${top[1]} points !`);
    reward(room, coins);
    pushState(room); broadcast(room);
  }

  const handlers = {
    reroll(room, me) {
      const g = room.g; if (g.stage !== 'pick' || me.id !== g.asker || g.rerolls <= 0) return;
      g.rerolls--; g.offered = offer(12, g.offered.map(t => t.id));
      pushState(room);
    },
    pick(room, me, ids) { const g = room.g; if (me.id !== g.asker || !Array.isArray(ids)) return; return pick(room, ids.slice(0, 3)); },
    draft(room, me, list) { const g = room.g; if (g.stage === 'answer' && me.id === g.answerer && Array.isArray(list)) g.answerDraft = list.slice(0, 3).map(x => String(x || '').slice(0, 80)); },
    answer(room, me, list) {
      const g = room.g; if (g.stage !== 'answer' || me.id !== g.answerer || !Array.isArray(list)) return;
      if (list.slice(0, 3).filter(x => String(x || '').trim()).length < 3) return { error: 'Réponds aux 3 thèmes' };
      answer(room, list);
    },
    guess(room, me, n) {
      const g = room.g; if (g.stage !== 'guess' || me.id === g.answerer) return;
      n = Math.round(+n); if (!(n >= 1 && n <= 10)) return;
      g.guesses.set(me.id, n);
      if (guessers(room).every(p => g.guesses.has(p))) setTimeout(() => reveal(room), 700);
      pushState(room);
    },
    skip(room, me) {
      const g = room.g; if (room.hostId !== me.id) return;
      if (g.stage === 'pick') pick(room, shuffle([...g.offered]).slice(0, 3).map(t => t.id));
      else if (g.stage === 'answer') answer(room, g.answerDraft || ['', '', '']);
      else if (g.stage === 'guess') reveal(room);
      else if (g.stage === 'reveal') { clear(g); nextRound(room); }
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g;
    const me = pid === g.answerer ? 'answerer' : pid === g.asker ? 'asker' : 'guesser';
    const showNote = me === 'answerer' || ['reveal', 'over'].includes(g.stage);
    return {
      game: id, stage: g.stage, role: me, round: Math.min(g.idx + 1, g.total), total: g.total,
      answerer: g.answerer, asker: g.asker,
      note: showNote ? g.note : null,
      offered: g.stage === 'pick' && me === 'asker' ? g.offered : null, rerolls: g.rerolls,
      themes: g.themes, answers: g.answers,
      guessed: g.guesses ? [...g.guesses.keys()] : [], myGuess: g.guesses?.get(pid) || null,
      guessers: g.stage === 'guess' ? guessers(room) : [],
      result: g.stage === 'reveal' || g.stage === 'over' ? g.result : null,
      scores: g.scores, ranking: g.ranking || null,
      left: Math.max(0, (g.deadline || 0) - Date.now()),
      coins: g.stage === 'over' ? g.coins?.[pid] || null : null,
    };
  }

  function onLeave(room, me) {
    const g = room.g; if (!g || g.game !== id) return;
    if (g.stage === 'guess' && guessers(room).every(p => g.guesses.has(p))) reveal(room);
    else if ((g.stage === 'pick' && me.id === g.asker) || (g.stage === 'answer' && me.id === g.answerer)) handlers.skip(room, { id: room.hostId });
  }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave };
};
