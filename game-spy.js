// PlayZup — PHOTO ESPION (3 à 12 joueurs) : un Undercover en images.
// Tout le monde voit la même image… sauf l'espion, qui n'a rien ! Chacun son tour, un joueur pose une question
// (écrite à la main) à un autre joueur, qui doit répondre. Puis on vote pour démasquer l'espion.
// L'espion démasqué peut encore gagner s'il retrouve l'image parmi 8 propositions.
const OWN = require('./data-spy');
const GUESS = require('./data-guess');
module.exports = ({ sysMsg, broadcast, pushState, shuffle, reward }) => {
  const id = 'spy';
  const MIN = 3, MAX = 12;
  const UA = 'PlayZup/1.0 (jeu privé entre amis; https://github.com)';
  const MOCK = !!process.env.MOCK;
  // thèmes : les nôtres + ceux de Guess Party (images Wikipédia / drapeaux)
  const THEMES = [
    ...OWN.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, src: 'wiki', items: t.items })),
    ...GUESS.filter(t => t.src !== 'album').map(t => ({ id: 'g-' + t.id, name: t.name, emoji: t.emoji, src: t.src, items: [...(t.items[1] || []), ...(t.items[2] || [])] })),
  ];
  const defaults = () => ({ themes: ['lieux', 'animaux', 'bouffe', 'objets', 'g-cartoons', 'g-films'], rounds: 3, qpp: 2, time: 45, hint: 1, spies: 1 });
  function applySettings(room, p) {
    const s = room.gs.spy;
    if (Array.isArray(p.themes)) { const t = p.themes.filter(x => THEMES.some(th => th.id === x)); if (t.length) s.themes = [...new Set(t)]; }
    if ([1, 3, 5].includes(+p.rounds)) s.rounds = +p.rounds;
    if ([1, 2, 3].includes(+p.qpp)) s.qpp = +p.qpp;
    if ([30, 45, 60, 90].includes(+p.time)) s.time = +p.time;
    if ([0, 1].includes(+p.hint)) s.hint = +p.hint;
    if ([1, 2].includes(+p.spies)) s.spies = +p.spies;
  }
  const parse = (th, line) => { const f = line.split('|'); return { theme: th.id, src: th.src, show: f[0], key: f[1] }; };
  // ── images (Wikipédia, mises en cache) ──
  const cache = new Map();
  async function resolveWiki(titles) {
    const todo = [...new Set(titles.filter(t => !cache.has(t)))];
    for (let i = 0; i < todo.length; i += 50) {
      const batch = todo.slice(i, i + 50);
      try {
        const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail&pithumbsize=800&pilicense=any&pilimit=50&redirects=1&titles=' + encodeURIComponent(batch.join('|')), { headers: { 'User-Agent': UA } });
        const j = await r.json(), q = j.query || {}, map = {};
        (q.normalized || []).forEach(x => { map[x.from] = x.to; }); (q.redirects || []).forEach(x => { map[x.from] = x.to; });
        const pages = Object.fromEntries((q.pages || []).map(p => [p.title, p.thumbnail?.source || null]));
        batch.forEach(t => { let k = t; for (let h = 0; h < 3 && map[k]; h++) k = map[k]; cache.set(t, pages[k] || null); });
      } catch (e) { console.log('spy wiki', e.message); }
    }
  }
  function mockImage(it, i) {
    const h = (i * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},85%,60%)"/><stop offset="1" stop-color="hsl(${h + 70},75%,35%)"/></linearGradient></defs><rect width="600" height="450" fill="url(#a)"/><circle cx="460" cy="110" r="80" fill="#fff5"/><text x="300" y="250" font-size="46" text-anchor="middle" fill="#fff" font-family="sans-serif">${it.show.replace(/[<&]/g, '')}</text></svg>`;
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }
  async function withImages(list) {
    if (MOCK) return list.map((it, i) => ({ ...it, img: mockImage(it, i) }));
    await resolveWiki(list.filter(i => i.src === 'wiki').map(i => i.key));
    return list.map(it => ({ ...it, img: it.src === 'flag' ? `https://flagcdn.com/w640/${it.key}.png` : cache.get(it.key) || null })).filter(it => it.img);
  }
  // ── déroulé ──
  const clear = (g) => { clearTimeout(g.timer); g.timer = null; };
  function later(room, ms, fn) { const g = room.g; clear(g); g.deadline = Date.now() + ms; g.timer = setTimeout(() => { if (room.g === g) fn(); }, ms); }
  const online = (room) => [...room.players.values()].filter(p => p.online);
  const isSpy = (g, pid) => g.spies.includes(pid);

  function start(room) {
    const s = room.gs.spy, ps = online(room);
    if (ps.length < MIN) throw new Error(`Il faut au moins ${MIN} joueurs`);
    room.g = { game: id, stage: 'loading', gameKey: Date.now().toString(36), round: 0, rounds: s.rounds, scores: Object.fromEntries(ps.map(p => [p.id, 0])),
      order: shuffle(ps.map(p => p.id)), time: s.time * 1000, qpp: s.qpp, hint: !!s.hint, nspies: ps.length >= 6 ? s.spies : 1, themes: s.themes, used: new Set(), history: [] };
    room.phase = 'game'; broadcast(room); pushState(room);
    sysMsg(room, `📸 PHOTO ESPION — ${s.rounds} manche${s.rounds > 1 ? 's' : ''}. Tout le monde voit la même image… sauf l'espion !`);
    nextRound(room).catch(e => console.log('spy', e));
  }
  async function nextRound(room) {
    const g = room.g; if (!g || g.game !== id) return;
    g.round++;
    if (g.round > g.rounds) return finish(room);
    g.stage = 'loading'; pushState(room);
    // une image + 7 leurres du même thème
    let pick = null, guard = 0;
    while (!pick && guard++ < 6) {
      const th = THEMES.find(t => t.id === g.themes[Math.floor(Math.random() * g.themes.length)]) || THEMES[0];
      const pool = shuffle(th.items.map(l => parse(th, l)).filter(it => !g.used.has(it.key))).slice(0, 14);
      const ok = await withImages(pool);
      if (room.g !== g) return;
      if (ok.length >= 4) { pick = { th, items: ok.slice(0, 8) }; }
    }
    if (!pick) { sysMsg(room, '⚠️ Impossible de charger les images (Wikipédia ne répond pas ?)'); return finish(room); }
    g.item = pick.items[0]; g.used.add(g.item.key);
    g.choices = shuffle(pick.items.map(i => ({ key: i.key, show: i.show, img: i.img })));
    g.theme = { id: pick.th.id, name: pick.th.name, emoji: pick.th.emoji };
    const ps = online(room).map(p => p.id).filter(p => g.scores[p] !== undefined);
    g.players = shuffle(ps);
    g.spies = shuffle(ps).slice(0, g.nspies);
    g.qa = []; g.asked = {}; g.votes = {}; g.accused = null; g.guess = null; g.result = null; g.prevAsker = null;
    g.asker = g.order.filter(p => ps.includes(p))[(g.round - 1) % ps.length] || ps[0];
    g.stage = 'deal';
    later(room, 7000, () => toAsk(room));
    pushState(room);
  }
  const quota = (g) => g.qpp * g.players.length;
  function toAsk(room) {
    const g = room.g;
    if (g.qa.length >= quota(g)) return toVote(room);
    g.stage = 'ask'; g.target = null; g.question = '';
    later(room, g.time, () => { // trop lent : on passe au suivant
      g.qa.push({ from: g.asker, to: null, q: '⏰ (pas de question à temps)', a: '' });
      g.asked[g.asker] = (g.asked[g.asker] || 0) + 1;
      g.asker = nextAsker(room, null); toAsk(room);
    });
    pushState(room);
  }
  function nextAsker(room, preferred) {
    const g = room.g, on = new Set(online(room).map(p => p.id));
    const can = (p) => on.has(p) && (g.asked[p] || 0) < g.qpp;
    if (preferred && can(preferred) && preferred !== g.prevAsker) return preferred;
    const i0 = g.players.indexOf(g.asker);
    for (let k = 1; k <= g.players.length; k++) { const p = g.players[(i0 + k) % g.players.length]; if (can(p)) return p; }
    return g.players.find(p => on.has(p)) || g.asker;
  }
  function toVote(room) {
    const g = room.g; g.stage = 'vote'; g.votes = {};
    later(room, 45000, () => countVotes(room));
    pushState(room);
  }
  function countVotes(room) {
    const g = room.g; if (g.stage !== 'vote') return;
    const tally = {}; Object.values(g.votes).forEach(v => { tally[v] = (tally[v] || 0) + 1; });
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    g.tally = tally;
    if (!top.length || (top[1] && top[1][1] === top[0][1])) { g.accused = null; return reveal(room, 'tie'); }
    g.accused = top[0][0];
    if (isSpy(g, g.accused)) { g.stage = 'guess'; g.guesser = g.accused; later(room, 25000, () => reveal(room, 'caught')); pushState(room); }
    else reveal(room, 'wrong');
  }
  function reveal(room, why) {
    const g = room.g; clear(g);
    const civ = g.players.filter(p => !isSpy(g, p));
    const right = g.guess && g.guess === g.item.key;
    let spyWin;
    if (why === 'early') spyWin = right;
    else if (why === 'caught') spyWin = right;
    else spyWin = true; // égalité ou mauvais accusé
    g.result = { why, spyWin, guess: g.guess, right: !!right };
    const add = (p, n) => { if (g.scores[p] !== undefined) g.scores[p] += n; };
    if (spyWin) g.spies.forEach(p => add(p, right ? 5 : 4));
    else civ.forEach(p => add(p, 2 + (g.votes[p] && isSpy(g, g.votes[p]) ? 1 : 0)));
    g.history.push({ round: g.round, item: g.item.show, spies: g.spies, spyWin });
    g.stage = 'reveal';
    sysMsg(room, `📸 C'était « ${g.item.show} » — ${g.spies.map(p => room.players.get(p)?.name || '?').join(' & ')} ${g.spies.length > 1 ? 'étaient les espions' : 'était l\'espion'} : ${spyWin ? 'l\'espion gagne 🕵️' : 'les joueurs gagnent 🎉'}`);
    later(room, 10000, () => nextRound(room));
    pushState(room);
  }
  function finish(room) {
    const g = room.g; clear(g);
    g.stage = 'over';
    const rk = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    g.ranking = rk.map(([pid, pts]) => ({ pid, pts }));
    g.coins = {};
    rk.forEach(([pid, pts], i) => { g.coins[pid] = { coins: 12 + pts * 5 + (i === 0 ? 25 : 0), win: i === 0 && rk.length > 1 }; });
    room.gscores.spy = room.gscores.spy || {};
    if (rk[0]) room.gscores.spy[rk[0][0]] = (room.gscores.spy[rk[0][0]] || 0) + 1;
    reward(room, g.coins);
    pushState(room); broadcast(room);
  }
  const clean = (t) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const handlers = {
    ask(room, me, d) {
      const g = room.g; if (g.stage !== 'ask' || g.asker !== me.id) return;
      const to = d?.to, q = clean(d?.q);
      if (!q) return { error: 'Écris ta question' };
      if (!to || to === me.id || !g.players.includes(to)) return { error: 'Choisis à qui poser la question' };
      g.qa.push({ from: me.id, to, q, a: null }); g.asked[me.id] = (g.asked[me.id] || 0) + 1;
      g.stage = 'answer'; g.target = to;
      later(room, g.time, () => { const last = g.qa[g.qa.length - 1]; last.a = '🤐 (pas de réponse)'; g.prevAsker = g.asker; g.asker = nextAsker(room, to); toAsk(room); });
      pushState(room);
    },
    answer(room, me, d) {
      const g = room.g; if (g.stage !== 'answer' || g.target !== me.id) return;
      const a = clean(d?.a); if (!a) return { error: 'Écris ta réponse' };
      g.qa[g.qa.length - 1].a = a;
      g.prevAsker = g.asker; g.asker = nextAsker(room, me.id);
      toAsk(room);
    },
    typing(room, me, d) { const g = room.g; if (!['ask', 'answer'].includes(g.stage)) return; g.typing = { pid: me.id, at: Date.now() }; },
    spyguess(room, me) { // l'espion tente sa chance en pleine partie
      const g = room.g; if (!['ask', 'answer', 'deal'].includes(g.stage) || !isSpy(g, me.id)) return;
      g.stage = 'guess'; g.guesser = me.id; g.early = true;
      later(room, 25000, () => reveal(room, 'early'));
      pushState(room);
    },
    pick(room, me, d) {
      const g = room.g; if (g.stage !== 'guess' || g.guesser !== me.id || !g.choices.some(c => c.key === d?.key)) return;
      g.guess = d.key; reveal(room, g.early ? 'early' : 'caught');
    },
    vote(room, me, d) {
      const g = room.g; if (g.stage !== 'vote' || !g.players.includes(me.id) || d?.pid === me.id || !g.players.includes(d?.pid)) return;
      g.votes[me.id] = d.pid;
      const on = online(room).map(p => p.id).filter(p => g.players.includes(p));
      if (on.every(p => g.votes[p])) countVotes(room); else pushState(room);
    },
    skip(room, me) { const g = room.g; if (room.hostId !== me.id) return; if (g.stage === 'deal') toAsk(room); else if (g.stage === 'reveal') nextRound(room); else if (g.stage === 'ask' || g.stage === 'answer') toVote(room); },
    end(room, me) { if (room.hostId === me.id && room.g.stage !== 'over') finish(room); },
    replay(room, me) { if (room.hostId === me.id && room.g.stage === 'over') { try { start(room); } catch (e) { return { error: e.message }; } } },
  };
  function onLeave(room, me) {
    const g = room.g; if (!g) return;
    if (g.stage === 'ask' && g.asker === me.id) { g.asker = nextAsker(room, null); toAsk(room); }
    else if (g.stage === 'answer' && g.target === me.id) { g.qa[g.qa.length - 1].a = '🚪 (parti)'; g.asker = nextAsker(room, null); toAsk(room); }
  }
  function view(room, pid) {
    const g = room.g, spy = g.spies?.includes(pid), open = ['reveal', 'over'].includes(g.stage);
    const v = { game: id, stage: g.stage, gameKey: g.gameKey, round: g.round, rounds: g.rounds, scores: g.scores, me: pid, players: g.players || [],
      left: Math.max(0, (g.deadline || 0) - Date.now()), time: g.time, qa: g.qa || [], asker: g.asker, target: g.target, quota: g.players ? quota(g) : 0,
      theme: (spy && !g.hint && !open) ? null : g.theme, spy: !!spy, nspies: g.nspies,
      card: g.item && (!spy || open) ? { show: g.item.show, img: g.item.img } : null,
      voted: g.votes?.[pid] || null, nvotes: Object.keys(g.votes || {}).length, guesser: g.guesser || null, history: g.history };
    if (g.stage === 'guess' && g.guesser === pid) v.choices = g.choices;
    if (g.stage === 'guess') v.early = !!g.early;
    if (open) { v.spies = g.spies; v.result = g.result; v.accused = g.accused; v.tally = g.tally || {}; v.choices = g.choices; v.votes = g.votes; v.answer = g.item?.key; }
    if (g.stage === 'over') { v.ranking = g.ranking; v.coins = g.coins?.[pid] || null; }
    return v;
  }
  return { id, min: MIN, max: MAX, defaults, applySettings, start, handlers, view, onLeave, THEMES };
};
