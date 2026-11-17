// PlayZup — DRAW TIME : un joueur dessine, les autres devinent (2 à 12 joueurs).
// Chacun dessine une fois par manche. Le dessinateur choisit parmi 3 mots, des lettres se dévoilent avec le temps.
// Les traits sont relayés en direct (événement socket « gdraw », hors du flux g:state pour rester fluide).
const WORDS = require('./data-draw');
const { match } = require('./matching');

module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'draw';
  const MIN = 2, MAX = 12;
  const defaults = () => ({ rounds: 3, time: 80, words: 'mix', hints: 2 });
  function applySettings(room, p) {
    const s = room.gs.draw;
    if ([2, 3, 4, 5].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([60, 80, 100, 120].includes(+p.time)) s.time = +p.time;
    if (['classic', 'fun', 'spicy', 'mix'].includes(p.words)) s.words = p.words;
    if ([0, 1, 2, 3].includes(+p.hints)) s.hints = +p.hints;
  }
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; (g.hintTimers || []).forEach(clearTimeout); g.hintTimers = []; };
  function later(room, ms, fn) { const g = room.g; clearTimeout(g.timer); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function pool(kind) {
    if (kind === 'mix') return [...WORDS.classic.map(w => [w, 'classic']), ...WORDS.fun.map(w => [w, 'fun']), ...WORDS.spicy.map(w => [w, 'spicy'])];
    return WORDS[kind].map(w => [w, kind]);
  }

  function start(room) {
    const s = room.gs.draw;
    const players = [...room.players.values()].filter(p => p.online);
    if (players.length < MIN) throw new Error('Il faut au moins 2 joueurs pour Draw Time : un qui dessine, un qui devine 🎨');
    room.g = {
      game: id, stage: 'choose', gameKey: Date.now().toString(36), rounds: s.rounds, time: s.time * 1000, hints: s.hints,
      order: shuffle(players.map(p => p.id)), round: 1, turnIdx: -1, drawer: null, choices: [], word: null, kind: null,
      revealed: [], found: {}, scores: Object.fromEntries(players.map(p => [p.id, 0])), gains: {}, chat: [], strokes: [],
      used: new Set(), deck: shuffle(pool(s.words)), timer: null, hintTimer: null, deadline: 0, startAt: 0, last: null, guessedCount: {},
    };
    room.phase = 'game';
    sysMsg(room, `🎨 DRAW TIME — ${s.rounds} manches · ${s.time} s par dessin · mots ${{ classic: 'classiques', fun: 'marrants', spicy: 'pimentés 🌶️', mix: 'tout mélangé' }[s.words]}`);
    broadcast(room);
    nextTurn(room);
  }

  function online(room, pid) { return !!room.players.get(pid)?.online; }
  function nextTurn(room) {
    const g = room.g; clear(g);
    // prochain dessinateur encore là
    let guard = 0;
    do {
      g.turnIdx++;
      if (g.turnIdx >= g.order.length) { g.turnIdx = 0; g.round++; }
      if (g.round > g.rounds) return finish(room);
    } while (!online(room, g.order[g.turnIdx]) && guard++ < 50);
    // les nouveaux venus entrent dans l'ordre
    for (const p of room.players.values()) if (p.online && !g.order.includes(p.id)) { g.order.push(p.id); g.scores[p.id] = g.scores[p.id] || 0; }
    g.drawer = g.order[g.turnIdx];
    g.stage = 'choose'; g.word = null; g.found = {}; g.gains = {}; g.strokes = []; g.revealed = [];
    g.choices = [];
    while (g.choices.length < 3) {
      if (!g.deck.length) g.deck = shuffle(pool(room.gs.draw.words));
      const w = g.deck.pop(); if (!g.used.has(w[0]) && !g.choices.some(c => c[0] === w[0])) g.choices.push(w);
    }
    g.chat.push({ sys: true, txt: `✏️ ${room.players.get(g.drawer)?.name} choisit un mot…` }); trim(g);
    pushState(room);
    later(room, 15000, () => choose(room, g.drawer, 0));
  }
  const trim = (g) => { g.chat = g.chat.slice(-40); };

  function choose(room, pid, i) {
    const g = room.g; if (g.stage !== 'choose' || pid !== g.drawer) return;
    const [w, kind] = g.choices[Math.max(0, Math.min(2, +i || 0))];
    g.word = w; g.kind = kind; g.used.add(w);
    g.stage = 'draw'; g.startAt = Date.now();
    g.chat.push({ sys: true, txt: `🎨 ${room.players.get(g.drawer)?.name} dessine !` }); trim(g);
    later(room, g.time, () => endTurn(room, 'time'));
    scheduleHints(room);
    pushState(room);
  }
  // lettres dévoilées au fil du temps (jamais plus de la moitié du mot)
  function scheduleHints(room) {
    const g = room.g;
    const letters = [...g.word].map((c, i) => /[a-zA-ZÀ-ÿ0-9]/.test(c) ? i : -1).filter(i => i >= 0);
    const max = Math.min(g.hints, Math.floor(letters.length / 2));
    if (!max) return;
    const order = shuffle([...letters]).slice(0, max);
    order.forEach((idx, k) => {
      const at = g.time * (0.4 + 0.45 * k / max);
      g.hintTimers = g.hintTimers || [];
      g.hintTimers.push(setTimeout(() => { if (room.g === g && g.stage === 'draw' && g.word && !g.revealed.includes(idx)) { g.revealed.push(idx); pushState(room); } }, at));
    });
  }

  function guessers(room) { const g = room.g; return [...room.players.values()].filter(p => p.online && p.id !== g.drawer); }

  function endTurn(room, why) {
    const g = room.g; if (g.stage !== 'draw') return;
    clear(g);
    // le dessinateur gagne selon le nombre de devineurs
    const n = Object.keys(g.found).length, total = guessers(room).length;
    const dg = n ? Math.round(40 + 160 * n / Math.max(1, total)) : 0;
    if (n) { g.drewCount = g.drewCount || {}; g.drewCount[g.drawer] = (g.drewCount[g.drawer] || 0) + 1; }
    if (dg) { g.scores[g.drawer] = (g.scores[g.drawer] || 0) + dg; g.gains[g.drawer] = dg; }
    g.stage = 'reveal';
    g.last = { word: g.word, drawer: g.drawer, why, gains: { ...g.gains }, n, total };
    g.chat.push({ sys: true, txt: `💡 Le mot était : ${g.word.toUpperCase()}`, good: true }); trim(g);
    pushState(room);
    later(room, 5500, () => nextTurn(room));
  }

  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rank.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rank.forEach(([pid], i) => {
      const good = g.guessedCount[pid] || 0;
      g.coins[pid] = { coins: 10 + 4 * good + 3 * (g.drewCount?.[pid] || 0) + ([30, 15, 8][i] || 0), good, win: i === 0 };
    });
    room.gscores.draw = room.gscores.draw || {};
    if (rank[0]) room.gscores.draw[rank[0][0]] = (room.gscores.draw[rank[0][0]] || 0) + 1;
    sysMsg(room, `🏆 Draw Time : ${room.players.get(rank[0]?.[0])?.name || '?'} gagne avec ${rank[0]?.[1] || 0} pts !`);
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }

  const handlers = {
    choose(room, me, i) { choose(room, me.id, i); },
    guess(room, me, text) {
      const g = room.g;
      text = String(text || '').trim().slice(0, 80);
      if (!text) return;
      const p = room.players.get(me.id);
      const msg = { pid: me.id, name: p?.name, txt: text };
      if (g.stage !== 'draw' || me.id === g.drawer || g.found[me.id]) {
        // le dessinateur et ceux qui ont trouvé parlent entre eux (les autres ne voient pas)
        if (g.stage === 'draw' && (me.id === g.drawer || g.found[me.id])) { if (norm(text).includes(norm(g.word))) return { verdict: 'leak' }; msg.secret = true; }
        g.chat.push(msg); trim(g); pushState(room); return { verdict: 'chat' };
      }
      const m = match(text, g.word);
      if (m === 'ok') {
        const left = Math.max(0, g.startAt + g.time - Date.now()) / g.time;
        const order = Object.keys(g.found).length;
        const pts = Math.round(80 + 220 * left) + (order === 0 ? 40 : order === 1 ? 20 : 0);
        g.found[me.id] = pts; g.gains[me.id] = pts;
        g.scores[me.id] = (g.scores[me.id] || 0) + pts;
        g.guessedCount[me.id] = (g.guessedCount[me.id] || 0) + 1;
        g.chat.push({ sys: true, good: true, pid: me.id, txt: `✅ ${p?.name} a trouvé le mot !` }); trim(g);
        if (guessers(room).every(x => g.found[x.id])) setTimeout(() => endTurn(room, 'all'), 600);
        pushState(room);
        return { verdict: 'ok', pts, first: order === 0 };
      }
      g.chat.push(msg); trim(g); pushState(room);
      return { verdict: m === 'close' ? 'close' : 'no' };
    },
    strokes(room) { return { strokes: room.g.strokes }; },
    skip(room, me) { const g = room.g; if ((room.hostId === me.id || me.id === g.drawer) && g.stage === 'draw') endTurn(room, 'skip'); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };

  // trait en direct : validé ici, puis relayé aux autres par server.js
  function onDraw(room, me, d) {
    const g = room.g;
    if (!g || g.stage !== 'draw' || me.id !== g.drawer || !d || typeof d !== 'object') return null;
    const n = (v) => Math.max(0, Math.min(1000, Math.round(+v || 0)));
    const col = /^#[0-9a-f]{6}$/i.test(d.c) ? d.c : '#000000';
    if (d.op === 'begin') { const s = { id: +d.id || 0, c: col, w: Math.max(1, Math.min(60, +d.w || 6)), p: [n(d.x), n(d.y)] }; g.strokes.push(s); if (g.strokes.length > 4000) g.strokes.shift(); return { op: 'begin', id: s.id, c: s.c, w: s.w, x: s.p[0], y: s.p[1] }; }
    if (d.op === 'move' && Array.isArray(d.pts)) {
      const s = [...g.strokes].reverse().find(x => x.id === +d.id && x.p); if (!s) return null;
      const pts = d.pts.slice(0, 400).map(n); if (s.p.length < 20000) s.p.push(...pts);
      return { op: 'move', id: s.id, pts };
    }
    if (d.op === 'fill') { const s = { fill: true, c: col, x: n(d.x), y: n(d.y) }; g.strokes.push(s); return { op: 'fill', ...s }; }
    if (d.op === 'undo') { g.strokes.pop(); return { op: 'undo' }; }
    if (d.op === 'clear') { g.strokes = []; return { op: 'clear' }; }
    return null;
  }

  function view(room, pid) {
    const g = room.g;
    const isDrawer = pid === g.drawer, found = !!g.found[pid];
    const showWord = g.word && (isDrawer || found || g.stage === 'reveal' || g.stage === 'over');
    const mask = g.word ? [...g.word].map((c, i) => /[a-zA-ZÀ-ÿ0-9]/.test(c) ? (g.revealed.includes(i) ? c : '_') : c).join('') : '';
    return {
      game: id, stage: g.stage, gameKey: g.gameKey, round: g.round, rounds: g.rounds, time: g.time, drawer: g.drawer, me: pid,
      left: Math.max(0, g.deadline - Date.now()), startAt: g.startAt, now: Date.now(),
      choices: isDrawer && g.stage === 'choose' ? g.choices.map(c => ({ w: c[0], k: c[1] })) : null,
      word: showWord ? g.word : null, mask, kind: g.kind, found: Object.keys(g.found), scores: g.scores, gains: g.gains,
      order: g.order.filter(p => room.players.has(p)),
      chat: g.chat.filter(m => !m.secret || isDrawer || found || g.stage !== 'draw').slice(-30),
      last: g.stage === 'reveal' ? g.last : null, ranking: g.ranking || null, coins: g.stage === 'over' ? g.coins?.[pid] || null : null,
    };
  }

  function onLeave(room, me) {
    const g = room.g; if (!g || g.game !== id) return;
    if (me.id === g.drawer && ['choose', 'draw'].includes(g.stage)) { g.chat.push({ sys: true, txt: '🚪 Le dessinateur est parti…' }); if (g.stage === 'draw') endTurn(room, 'left'); else nextTurn(room); }
    else if (g.stage === 'draw' && guessers(room).length && guessers(room).every(x => g.found[x.id])) endTurn(room, 'all');
    else if (guessers(room).length === 0 && g.stage !== 'over') finish(room);
  }

  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, onDraw };
};
