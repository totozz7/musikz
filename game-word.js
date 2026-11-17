// PlayZup — Speed Word : mots fléchés en solo ou en course (1 à 12 joueurs)
// Tout le monde a la MÊME grille. En multi, le premier qui la termine gagne.
const DICT = require('./data-words');
const { generateGrid } = require('./wordgrid');

module.exports = ({ sysMsg, broadcast, pushState, reward, emit }) => {
  const id = 'word';
  const MIN = 1, MAX = 12;
  const LEVELS = {
    1: { name: 'Facile', emoji: '🟢', W: 9, H: 9, maxLen: 6, clue: 'easy', coins: 15 },
    2: { name: 'Moyen', emoji: '🟡', W: 11, H: 11, maxLen: 7, clue: 'easy', coins: 25 },
    3: { name: 'Difficile', emoji: '🟠', W: 12, H: 12, maxLen: 8, clue: 'hard', coins: 35 },
    4: { name: 'Expert', emoji: '🔴', W: 14, H: 14, maxLen: 9, clue: 'hard', coins: 50 },
  };
  const HINTS = 3;           // lettres révélables par joueur (mode avec indices)
  const HINT_COST = 2;       // pièces retirées par lettre révélée

  const defaults = () => ({ level: 2, hints: true });
  function applySettings(room, p) {
    const s = room.gs.word;
    if (LEVELS[+p.level]) s.level = +p.level;
    if (typeof p.hints === 'boolean') s.hints = p.hints;
  }

  const letterCells = (g) => Object.keys(g.sol).map(Number);
  function pl(room, pid) {
    const g = room.g;
    if (!g.players.has(pid)) g.players.set(pid, { letters: {}, hintsLeft: g.hints ? HINTS : 0, hintsUsed: 0, hinted: [], done: false });
    return g.players.get(pid);
  }
  const correctCount = (g, p) => letterCells(g).filter(i => p.letters[i] === g.sol[i]).length;
  const filledCount = (g, p) => letterCells(g).filter(i => p.letters[i]).length;
  const solvedWords = (g, p) => g.words.map((w, k) => w.cells.every(i => p.letters[i] === g.sol[i]) ? k : -1).filter(k => k >= 0);

  function progress(room) {
    const g = room.g, total = letterCells(g).length;
    return [...g.players.entries()].filter(([pid]) => room.players.get(pid)).map(([pid, p]) => ({
      pid, filled: Math.round(100 * filledCount(g, p) / total), done: p.done,
    }));
  }
  let progTimer = new Map();
  function sendProgress(room) {
    if (progTimer.get(room.code)) return;
    progTimer.set(room.code, setTimeout(() => {
      progTimer.delete(room.code);
      if (room.g?.game === id) emit(room, 'w:prog', progress(room));
    }, 400));
  }

  function start(room) {
    const s = room.gs.word, L = LEVELS[s.level];
    const players = [...room.players.values()].filter(p => p.online).map(p => p.id);
    if (players.length < MIN) throw new Error('Il faut au moins 1 joueur');
    if (players.length > MAX) throw new Error(`${MAX} joueurs maximum pour Speed Word`);
    const grid = generateGrid(L.W, L.H, DICT, { maxLen: L.maxLen, clue: L.clue, tries: s.level >= 3 ? 14 : 22 });
    room.g = {
      game: id, stage: 'play', level: s.level, hints: s.hints, ...grid,
      players: new Map(), startAt: Date.now() + 3000, ranking: null, winner: null, multi: players.length > 1,
    };
    players.forEach(pid => pl(room, pid));
    room.phase = 'game';
    sysMsg(room, `🔤 Speed Word — grille ${L.emoji} ${L.name} (${grid.words.length} mots)${s.hints ? '' : ' · sans indices'}${players.length > 1 ? ' · le premier qui finit gagne !' : ''}`);
    broadcast(room); pushState(room);
  }

  function finish(room, winnerPid, reason = 'done') {
    const g = room.g; if (g.stage === 'over') return;
    g.stage = 'over'; g.winner = winnerPid; g.endAt = Date.now();
    const total = letterCells(g).length, L = LEVELS[g.level];
    const rows = [...g.players.entries()].filter(([pid]) => room.players.get(pid)).map(([pid, p]) => ({
      pid, ratio: correctCount(g, p) / total, hintsUsed: p.hintsUsed, done: p.done, time: p.doneAt ? p.doneAt - g.startAt : null,
    }));
    rows.sort((a, b) => (b.pid === winnerPid) - (a.pid === winnerPid) || b.ratio - a.ratio);
    const coins = {};
    rows.forEach((r, i) => {
      let c;
      if (r.done) c = L.coins + (g.multi && i === 0 ? 25 : 0);
      else c = Math.round(L.coins * r.ratio * (g.multi ? 0.7 : 0.5));
      c = Math.max(r.done ? 5 : 3, c - HINT_COST * r.hintsUsed);
      coins[r.pid] = { coins: c, good: Math.round(r.ratio * 10), win: r.done && i === 0 };
    });
    g.ranking = rows; g.coins = coins;
    room.gscores.word = room.gscores.word || {};
    if (winnerPid) room.gscores.word[winnerPid] = (room.gscores.word[winnerPid] || 0) + 1;
    const w = room.players.get(winnerPid);
    const secs = Math.round((g.endAt - g.startAt) / 1000);
    if (reason === 'done' && w) sysMsg(room, g.multi ? `🏁 ${w.name} a terminé la grille en ${Math.floor(secs / 60)} min ${secs % 60} s et gagne !` : `🏁 Grille terminée en ${Math.floor(secs / 60)} min ${secs % 60} s !`);
    else sysMsg(room, '🏳️ Partie terminée');
    reward(room, coins);
    broadcast(room); pushState(room);
  }

  const handlers = {
    cell(room, me, { i, ch } = {}) {
      const g = room.g; if (g.stage !== 'play' || Date.now() < g.startAt - 300) return;
      i = +i; if (!(i in g.sol)) return;
      const p = pl(room, me.id); if (p.done) return;
      if (p.hinted.includes(i)) return { ok: true, locked: true }; // lettre révélée : bloquée
      // mot déjà trouvé (en vert) : ses lettres ne peuvent plus être modifiées
      if (g.hints && g.words.some(w => w.cells.includes(i) && w.cells.every(k => p.letters[k] === g.sol[k]))) return { ok: true, locked: true, solved: solvedWords(g, p) };
      ch = String(ch || '').toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '').slice(0, 1);
      if (ch) p.letters[i] = ch; else delete p.letters[i];
      sendProgress(room);
      const allOk = letterCells(g).every(k => p.letters[k] === g.sol[k]);
      if (allOk) { p.done = true; p.doneAt = Date.now(); finish(room, me.id); return { done: true }; }
      const full = filledCount(g, p) === letterCells(g).length;
      return { ok: true, solved: g.hints ? solvedWords(g, p) : null, full };
    },
    hint(room, me, { i } = {}) {
      const g = room.g; if (g.stage !== 'play' || !g.hints) return;
      const p = pl(room, me.id); if (p.done) return;
      if (p.hintsLeft <= 0) return { error: 'Plus de lettres à révéler !' };
      i = +i;
      if (!(i in g.sol) || p.letters[i] === g.sol[i]) {
        const wrong = letterCells(g).filter(k => p.letters[k] !== g.sol[k]);
        if (!wrong.length) return;
        i = wrong[Math.floor(Math.random() * wrong.length)];
      }
      p.letters[i] = g.sol[i]; p.hinted.push(i); p.hintsLeft--; p.hintsUsed++;
      sendProgress(room);
      const allOk = letterCells(g).every(k => p.letters[k] === g.sol[k]);
      if (allOk) { p.done = true; p.doneAt = Date.now(); finish(room, me.id); return { done: true, i, ch: g.sol[i] }; }
      return { i, ch: g.sol[i], hintsLeft: p.hintsLeft, solved: solvedWords(g, p) };
    },
    giveup(room, me) {
      const g = room.g; if (g.stage !== 'play') return;
      if (g.multi && room.hostId !== me.id) return { error: "Seul l'hôte peut arrêter la course" };
      finish(room, null, 'giveup');
    },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  function view(room, pid) {
    const g = room.g, p = pl(room, pid), L = LEVELS[g.level];
    const over = g.stage === 'over';
    return {
      game: id, stage: g.stage, level: g.level, levelName: `${L.emoji} ${L.name}`, hints: g.hints, multi: g.multi,
      W: g.W, H: g.H, cells: g.cells, words: g.words.map(w => ({ dir: w.dir, cells: w.cells, clue: w.clue, text: w.text, len: w.len })),
      gridId: g.startAt, startIn: g.startAt - Date.now(), elapsed: Date.now() - g.startAt,
      my: { letters: p.letters, hintsLeft: p.hintsLeft, hinted: p.hinted, solved: g.hints ? solvedWords(g, p) : [], done: p.done },
      progress: progress(room),
      sol: over ? g.sol : null, ranking: over ? g.ranking : null, winner: g.winner,
      duration: over ? g.endAt - g.startAt : null, coins: over ? g.coins?.[pid] || null : null,
    };
  }

  function onLeave(room) { if (room.g?.game === id) sendProgress(room); }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, LEVELS };
};
