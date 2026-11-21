const QZ_THEMES = [
  {"id": "culture", "name": "Culture G", "emoji": "🧠", "n": 102, "cat": "gen"},
  {"id": "sport", "name": "Sport", "emoji": "🏅", "n": 101, "cat": "gen"},
  {"id": "manga", "name": "Manga & anime", "emoji": "🍥", "n": 100, "cat": "gen"},
  {"id": "cine", "name": "Cinéma & séries", "emoji": "🎬", "n": 99, "cat": "gen"},
  {"id": "musique", "name": "Musique", "emoji": "🎵", "n": 98, "cat": "gen"},
  {"id": "geo", "name": "Géographie", "emoji": "🌍", "n": 100, "cat": "gen"},
  {"id": "histoire", "name": "Histoire", "emoji": "🏰", "n": 99, "cat": "gen"},
  {"id": "sciences", "name": "Sciences", "emoji": "🔬", "n": 99, "cat": "gen"},
  {"id": "jv", "name": "Jeux vidéo", "emoji": "🎮", "n": 99, "cat": "gen"},
  {"id": "nature", "name": "Animaux & nature", "emoji": "🦁", "n": 99, "cat": "gen"},
  {"id": "starwars", "name": "Star Wars", "emoji": "⚔️", "n": 96, "cat": "sub"},
  {"id": "hp", "name": "Harry Potter", "emoji": "🪄", "n": 98, "cat": "sub"},
  {"id": "marvel", "name": "Marvel", "emoji": "🦸", "n": 96, "cat": "sub"},
  {"id": "disney", "name": "Disney & Pixar", "emoji": "✨", "n": 96, "cat": "sub"},
  {"id": "onepiece", "name": "One Piece", "emoji": "🏴‍☠️", "n": 94, "cat": "sub"},
  {"id": "naruto", "name": "Naruto", "emoji": "🍜", "n": 95, "cat": "sub"},
  {"id": "dbz", "name": "Dragon Ball", "emoji": "🐉", "n": 94, "cat": "sub"},
  {"id": "pokemon", "name": "Pokémon", "emoji": "⚡", "n": 93, "cat": "sub"},
  {"id": "nintendo", "name": "Mario & Nintendo", "emoji": "🍄", "n": 96, "cat": "sub"},
  {"id": "minecraft", "name": "Minecraft", "emoji": "⛏️", "n": 90, "cat": "sub"},
  {"id": "gta", "name": "GTA", "emoji": "🚓", "n": 97, "cat": "sub"},
  {"id": "foot", "name": "Football", "emoji": "🥅", "n": 95, "cat": "sub"},
  {"id": "f1", "name": "Formule 1", "emoji": "🏎️", "n": 92, "cat": "sub"},
  {"id": "nba", "name": "Basket & NBA", "emoji": "🏀", "n": 94, "cat": "sub"},
  {"id": "tennis", "name": "Tennis", "emoji": "🎾", "n": 91, "cat": "sub"},
  {"id": "jo", "name": "Jeux olympiques", "emoji": "🥇", "n": 89, "cat": "sub"},
  {"id": "france", "name": "La France", "emoji": "🥖", "n": 96, "cat": "sub"},
  {"id": "capitales", "name": "Capitales du monde", "emoji": "🏙️", "n": 93, "cat": "sub"},
  {"id": "series", "name": "Séries TV", "emoji": "📺", "n": 96, "cat": "sub"},
  {"id": "cinefr", "name": "Cinéma français", "emoji": "🎞️", "n": 95, "cat": "sub"},
  {"id": "dessins", "name": "Dessins animés", "emoji": "🧸", "n": 95, "cat": "sub"},
  {"id": "rapfr", "name": "Rap français", "emoji": "🎤", "n": 94, "cat": "sub"},
  {"id": "annees80", "name": "Tubes 80-90", "emoji": "📼", "n": 95, "cat": "sub"},
  {"id": "espace", "name": "Espace", "emoji": "🚀", "n": 92, "cat": "sub"},
  {"id": "corps", "name": "Corps humain", "emoji": "🫀", "n": 93, "cat": "sub"},
  {"id": "mytho", "name": "Mythologie", "emoji": "🔱", "n": 96, "cat": "sub"},
  {"id": "langue", "name": "Langue française", "emoji": "📝", "n": 93, "cat": "sub"},
  {"id": "cuisine", "name": "Cuisine du monde", "emoji": "🍳", "n": 90, "cat": "sub"},
  {"id": "internet", "name": "Internet & réseaux", "emoji": "📱", "n": 96, "cat": "sub"},
  {"id": "sda", "name": "Seigneur des anneaux", "emoji": "💍", "n": 95, "cat": "sub"}
];
// PLAYZUP — client (accueil, boutique, salon, Blind test). Undercover et Note : client-undercover.js / client-note.js
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

const REACTS = ['🔥', '😂', '😱', '👏', '💀', '🎉', '😭', '🤯', '❤️', '🐐'];
const COLORS = SHOP.colors.filter(c => !c.price).map(c => c.id);
// Icône avec son cadre, et pseudo avec son effet (utilisés partout : joueurs, podium, chat…)
const colClass = (c) => String(c || '').startsWith('anim:') ? 'col-' + String(c).slice(5) : '';
const avatarHTML = (p, size = 36) => `<span class="avf fr-${esc(p.frame || 'none')} ${colClass(p.color)}" style="--s:${size}px;--c:${esc(SHOP.colorBase(p.color))}"><span class="avi ${SHOP.iconAnim(p.avatar) ? 'ia-' + SHOP.iconAnim(p.avatar) : ''}">${esc(p.avatar || '🙂')}</span></span>`;
const nameHTML = (p, extra = '') => `<span class="pname nfx-${esc(p.nameFx || 'none')} ${colClass(p.color)}" style="--c:${esc(SHOP.colorBase(p.color))}" data-t="${esc(p.name)}">${esc(p.name)}</span>${extra}`;

// ───────────── Sauvegarde (dans le navigateur) ─────────────
// Le serveur gratuit oublie tout quand il s'endort, donc la progression vit dans le navigateur de chaque joueur.
const SAVE_KEY = 'mz_save';
function defaultSave() {
  return { v: 1, coins: SHOP.startCoins, owned: [], games: 0, wins: 0, good: 0, lastGame: '',
    look: { avatar: store.get('mz_avatar', SHOP.icons[Math.floor(Math.random() * 20)].id), color: store.get('mz_color', COLORS[Math.floor(Math.random() * 8)]),
      frame: 'classic', nameFx: 'none', title: 'debutant', winFx: 'party', pawn: 'classic', board: 'bois', pcfx: 'basic', cardback: 'classic', chessb: 'tournoi', chesspc: 'classic' } };
}
let save;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY)) || defaultSave(); } catch { save = defaultSave(); }
save = { ...defaultSave(), ...save, look: { ...defaultSave().look, ...(save.look || {}) } };
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };
const owns = (kind, id) => { const it = SHOP[kind].find(x => x.id === id); return !!it && (!it.price || save.owned.includes(kind + ':' + id)); };
// un cosmétique équipé mais pas possédé (ancienne version) revient au gratuit
for (const [k, d] of [['icons', null], ['colors', '#ffc21a'], ['frames', 'classic'], ['nameFx', 'none'], ['titles', 'debutant'], ['winFx', 'party'], ['pawns', 'classic'], ['boards', 'bois'], ['pcfx', 'basic'], ['cardbacks', 'classic'], ['chessb', 'tournoi'], ['chesspc', 'classic']]) {
  const key = k === 'icons' ? 'avatar' : k === 'colors' ? 'color' : k === 'frames' ? 'frame' : k === 'titles' ? 'title' : k === 'pawns' ? 'pawn' : k === 'boards' ? 'board' : k === 'cardbacks' ? 'cardback' : k;
  if (!owns(k, save.look[key])) save.look[key] = d || SHOP.icons[0].id;
}
persist();
function applyCardback() { document.body.className = document.body.className.replace(/\bcb-\S+/g, '').trim(); document.body.classList.add('cb-' + (save.look.cardback || 'classic')); }
applyCardback();
const me = () => ({ ...save.look, name: ($('#name')?.value || '').trim() || 'Zuppy', titleName: SHOP.titles.find(t => t.id === save.look.title && t.id !== 'none')?.name || '' });

let pid = store.get('mz_pid');
if (!pid) { pid = Math.random().toString(36).slice(2) + Date.now().toString(36); store.set('mz_pid', pid); }

const socket = io();
const audio = new Audio();
audio.preload = 'auto';
let baseVolume = +store.get('mz_vol', 80) / 100;
audio.volume = baseVolume;

let state = null;       // état du salon
let categories = [];
let round = null;       // manche en cours
let tick = null;


// ───────────── Accueil ─────────────
$('#name').value = store.get('mz_name', '') || 'Zuppy';
function renderProfile() {
  const m = me();
  for (const [av, nm, tt] of [['#pv-avatar', '#pv-name', '#pv-title'], ['#sp-avatar', '#sp-name', '#sp-title']]) {
    $(av).innerHTML = avatarHTML(m, 76);
    $(nm).innerHTML = nameHTML(m);
    $(tt).textContent = m.titleName ? '« ' + m.titleName + ' »' : '';
  }
  $$('.coins-n').forEach(e => e.textContent = save.coins);
}
renderProfile();
$('#name').addEventListener('input', renderProfile);

// ───────────── Boutique ─────────────
let shopTab = 'icons';
const openShop = () => { $('#shop').classList.remove('hidden'); renderProfile(); renderShop(); };
[$('#btn-shop'), $('#btn-shop2'), ...$$('.open-shop')].forEach(b => b.onclick = openShop);
$('#shop-close').onclick = () => $('#shop').classList.add('hidden');
$('#shop').onclick = (e) => { if (e.target.id === 'shop') $('#shop').classList.add('hidden'); };
$$('#shop-tabs button').forEach(b => b.onclick = () => { shopTab = b.dataset.tab; shopSel = null; renderShop(); });

const LOOK_KEY = { icons: 'avatar', colors: 'color', frames: 'frame', nameFx: 'nameFx', titles: 'title', winFx: 'winFx', pawns: 'pawn', boards: 'board', pcfx: 'pcfx', cardbacks: 'cardback', chessb: 'chessb', chesspc: 'chesspc' };
const RARITY_LABEL = { common: 'Commun', rare: '◆ Rare', epic: '✦ Épique', legendary: '★ Légendaire', divine: '✹ DIVIN' };
function itemPreview(kind, it, m, big = false) {
  const s = big ? 84 : 52;
  if (kind === 'icons') return avatarHTML({ ...m, avatar: it.id }, s);
  if (kind === 'colors') return `<div class="nprev">${nameHTML({ ...m, nameFx: 'none', color: it.id })}</div>`;
  if (kind === 'frames') return avatarHTML({ ...m, frame: it.id }, s);
  if (kind === 'nameFx') return `<div class="nprev">${nameHTML({ ...m, nameFx: it.id })}</div>`;
  if (kind === 'titles') return `<div class="tprev">${it.id === 'none' ? '—' : '« ' + esc(it.name) + ' »'}</div>`;
  if (kind === 'pawns') { const k = big ? 70 : 50; return `<span class="pc-tok pc-preview sk-${it.id} ${it.fx ? 'fx-' + it.fx : ''} ${it.anim ? 'an-' + it.anim : ''}" style="--k:${SHOP.colorBase(m.color)};width:${k}px;height:${k}px"><span>${it.emoji}</span></span>`; }
  if (kind === 'boards') return `<div class="bd-prev pc-board bd-${it.id} ${big ? 'big' : ''}"><s class="q0"></s><s class="q1"></s><s class="q2"></s><s class="q3"></s><b></b><em></em><span>${it.emoji}</span></div>`;
  if (kind === 'pcfx') return `<div class="pf-prev ${it.special ? 'sp' : ''}" style="--fc:${it.color}"><span>${it.emoji}</span><u></u><small>${esc(it.text)}</small></div>`;
  if (kind === 'cardbacks') return `<div class="cb-prev cb-${it.id} ${big ? 'big' : ''}"><div class="pm-card back"><span class="pm-logo">PRIMO<b>!</b></span></div><div class="lb-card back"><span>PZ</span></div></div>`;
  if (kind === 'chessb') return `<div class="chb-prev chb-${it.id} ${big ? 'big' : ''}">${Array.from({ length: 16 }, (_, k) => `<b class="${((k >> 2) + k) % 2 ? 'd' : 'l'}"></b>`).join('')}</div>`;
  if (kind === 'chesspc') return `<div class="chp-prev ${big ? 'big' : ''}">${window.CHESS ? CHESS.pieceHTML({ t: 'N', c: 'w' }, it.id) + CHESS.pieceHTML({ t: 'Q', c: 'b' }, it.id) : it.emoji}</div>`;
  if (kind === 'winFx') return `<div class="wprev">${it.emojis}${it.kind ? '<small class="anim-tag">✨ animée</small>' : ''}</div>`;
  return '';
}
function renderShop() {
  $$('#shop-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === shopTab));
  const body = $('#shop-body'); const m = me();
  if (shopTab === 'wheel') {
    body.innerHTML = `<div class="wheel-promo"><div class="wp-ico">🎡</div><h3>Roue de la chance</h3>
      <p>Un tour = <b>🪙 ${SHOP.wheel.cost}</b>. Gagne des pièces (jusqu'à 500 !) ou un <b>objet surprise</b> de la boutique que tu n'as pas encore — commun, rare, et, avec beaucoup de chance, épique ou légendaire.</p>
      <button class="btn btn-primary" id="wp-open">🎡 Ouvrir la roue</button></div>`;
    $('#wp-open').onclick = () => { $('#shop').classList.add('hidden'); window.WHEEL.open(); };
    return;
  }
  if (shopTab === 'save') {
    body.innerHTML = `
      <div class="stats"><div><b>${save.games}</b><small>parties</small></div><div><b>${save.wins}</b><small>victoires</small></div>
      <div><b>${save.good}</b><small>bonnes réponses</small></div><div><b>${save.owned.length}</b><small>objets</small></div></div>
      <p>Ta progression est enregistrée <b>dans ce navigateur</b>. Pour la garder sur un autre appareil (ou si tu vides ton historique),
      copie ton code de sauvegarde et colle-le de l'autre côté.</p>
      <p class="muted small">Gains par partie : ${SHOP.earn.base} 🪙 + ${SHOP.earn.perGood} 🪙 par bonne réponse + podium ${SHOP.earn.podium.join(' / ')} 🪙.</p>
      <button id="sv-copy" class="btn btn-yellow">📋 Copier mon code de sauvegarde</button>
      <textarea id="sv-code" class="input" rows="3" placeholder="Colle ici un code de sauvegarde…"></textarea>
      <button id="sv-load" class="btn btn-ghost">♻️ Restaurer ce code</button>`;
    $('#sv-copy').onclick = async () => {
      const code = 'MZ1.' + btoa(unescape(encodeURIComponent(JSON.stringify(save))));
      try { await navigator.clipboard.writeText(code); toast('📋 Code copié ! Garde-le précieusement'); } catch { $('#sv-code').value = code; $('#sv-code').select(); toast('Copie le code dans la case'); }
    };
    $('#sv-load').onclick = () => {
      try {
        const raw = $('#sv-code').value.trim().replace(/^MZ1\./, '');
        const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
        if (typeof data.coins !== 'number' || !Array.isArray(data.owned)) throw 0;
        save = { ...defaultSave(), ...data, look: { ...defaultSave().look, ...data.look } }; persist(); renderProfile(); renderShop(); pushLook();
        toast('♻️ Sauvegarde restaurée !');
      } catch { toast('Code invalide 😕', 'error'); }
    };
    return;
  }
  const RANK = { free: 0, common: 1, rare: 2, epic: 3, legendary: 4, divine: 5 };
  const kind = shopTab, lookKey = LOOK_KEY[kind];
  const items = SHOP[kind].map((it, n) => ({ it, n })).sort((a, b) =>
    RANK[a.it.price ? SHOP.rarity(a.it.price) : 'free'] - RANK[b.it.price ? SHOP.rarity(b.it.price) : 'free'] || (a.it.price || 0) - (b.it.price || 0) || a.n - b.n).map(x => x.it);
  // ⭐ À la une : l'objet légendaire le plus cher pas encore possédé
  const star = [...items].filter(it => it.price && !owns(kind, it.id)).sort((a, b) => b.price - a.price)[0];
  const feat = star ? `<div class="featured r-${SHOP.rarity(star.price)}">
      <div class="f-prev">${itemPreview(kind, star, m, true)}</div>
      <div class="f-txt"><span class="f-tag">⭐ À LA UNE · ${RARITY_LABEL[SHOP.rarity(star.price)]}</span><b>${esc(star.name || star.id)}</b>
      <span class="f-price">🪙 ${star.price}</span>${save.coins < star.price ? `<small>Encore ${star.price - save.coins} 🪙 à gagner</small>` : '<small>Tu peux te l\'offrir !</small>'}</div></div>` : '';
  const sel = shopSel?.kind === kind ? items.find(x => x.id === shopSel.id && !owns(kind, x.id)) : null;
  const animated = kind === 'winFx' || kind === 'pcfx';
  const pane = sel ? `<div class="pv-pane r-${SHOP.rarity(sel.price)}">
      <button class="pv-x" id="pv-close" title="Fermer">✕</button>
      <div class="pv-prev ${kind}">${itemPreview(kind, sel, m, true).replace('bd-prev', 'bd-prev huge')}</div>
      <div class="pv-txt"><span class="f-tag">👁️ APERÇU · ${RARITY_LABEL[SHOP.rarity(sel.price)]}</span><b>${esc(sel.name || sel.id)}</b>
        <small>${animated ? "L'animation se joue à l'écran — regarde bien !" : kind === 'boards' ? 'Voilà ton futur plateau de Petits chevaux.' : 'Voilà à quoi ça ressemble sur toi.'}</small>
        <div class="pv-btns">${animated ? '<button class="btn btn-ghost" id="pv-again">▶ Revoir</button>' : ''}<button class="btn btn-primary ${save.coins < sel.price ? 'poor' : ''}" id="pv-buy">Acheter · 🪙 ${sel.price}</button></div>
        ${save.coins < sel.price ? `<small class="pv-miss">Il te manque ${sel.price - save.coins} 🪙</small>` : ''}</div></div>` : '';
  body.innerHTML = (pane || feat) + `<div class="shop-grid ${kind}">${items.map(it => {
    const own = owns(kind, it.id), eq = save.look[lookKey] === it.id, rar = it.price ? SHOP.rarity(it.price) : 'free';
    const label = kind === 'icons' && !it.name ? '' : `<small>${esc(it.name || '')}</small>`;
    const btn = eq ? '<span class="state eq">✔ Équipé</span>' : own ? '<span class="state">Équiper</span>' : `<span class="state price ${save.coins >= it.price ? '' : 'poor'}">🪙 ${it.price}</span>`;
    return `<button class="item r-${rar} ${eq ? 'eq' : ''} ${own ? '' : 'locked'} ${sel && sel.id === it.id ? 'pv-on' : ''}" data-id="${esc(it.id)}">${rar !== 'free' && rar !== 'common' ? `<span class="rtag">${RARITY_LABEL[rar]}</span>` : ''}${itemPreview(kind, it, m)}${label}${btn}</button>`;
  }).join('')}</div>`;
  const equip = (it) => {
    save.look[lookKey] = it.id; persist(); renderProfile(); renderShop(); pushLook(); applyCardback(); window.CHESS?.refresh?.();
    if (kind === 'winFx') burst(it.id);
    if (kind === 'pcfx') window.HORSES?.demo(it.id);
    if (kind === 'boards') window.HORSES?.skinBoard();
  };
  const buy = (it, el) => {
    if (save.coins < it.price) { el?.classList.add('shake'); setTimeout(() => el?.classList.remove('shake'), 300); return toast(`Il te manque ${it.price - save.coins} 🪙`, 'error'); }
    save.coins -= it.price; save.owned.push(kind + ':' + it.id);
    const rar = SHOP.rarity(it.price);
    toast(`🛍️ ${rar === 'divine' ? '✹ DIVIN ✹ ' : rar === 'legendary' ? '★ LÉGENDAIRE ★ ' : ''}Acheté ! (-${it.price} 🪙)`);
    sfx('legend'); if (rar === 'legendary' || rar === 'epic' || rar === 'divine') setTimeout(() => sfx('legend'), 300);
    if (rar === 'divine') divineFlash();
    burst(rar === 'divine' ? (kind === 'winFx' ? it.id : 'supernova') : rar === 'legendary' ? 'galaxy' : rar === 'epic' ? 'money' : 'party', rar === 'legendary' || rar === 'divine' ? 40 : 18);
    shopSel = null; equip(it);
  };
  $$('#shop-body .item, #shop-body .featured').forEach(b => b.onclick = () => {
    const it = b.classList.contains('featured') ? star : items.find(x => x.id === b.dataset.id);
    if (owns(kind, it.id)) { shopSel = null; return equip(it); }
    // pas encore à toi : 1er clic = aperçu, l'achat se fait depuis le panneau d'aperçu
    shopSel = { kind, id: it.id }; renderShop(); previewItem(kind, it);
    $('#shop-body').scrollTo?.({ top: 0, behavior: 'smooth' }); $('.modal-box')?.scrollTo?.({ top: 0, behavior: 'smooth' });
  });
  if (sel) {
    $('#pv-buy').onclick = (e) => buy(sel, e.currentTarget);
    $('#pv-again')?.addEventListener('click', () => previewItem(kind, sel));
    $('#pv-close').onclick = () => { shopSel = null; renderShop(); };
  }
}
let shopSel = null;
// aperçu sans acheter : animations jouées, plateau en grand…
function previewItem(kind, it) {
  if (kind === 'winFx') burst(it.id, 30);
  if (kind === 'pcfx') window.HORSES?.demo(it.id);
  sfx('pop', .5);
}
// déjà dans un salon : on met à jour son look pour les autres, sans recharger la partie
function pushLook() { if (joinedCode) socket.emit('look', save.look); }

const urlCode = (location.pathname.match(/^\/r\/([A-Za-z0-9]{5})/) || [])[1] || new URLSearchParams(location.search).get('room');
if (urlCode) { $('#code').value = urlCode.toUpperCase(); $('#btn-join').textContent = 'Rejoindre ' + urlCode.toUpperCase(); }

function identity() {
  const name = $('#name').value.trim();
  if (!name) { $('#home-err').textContent = 'Choisis un pseudo d\'abord 😉'; $('#name').focus(); return null; }
  store.set('mz_name', name);
  unlockAudio();
  return { name, pid, ...save.look };
}
function unlockAudio() {
  // les navigateurs exigent un clic avant de jouer du son : on "débloque" l'élément audio ici
  audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  audio.play().catch(() => {});
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {}
}
let actx = null;
// ───────────── Choix du jeu ─────────────
const GAME_META = {
  blindtest: { emoji: '🎵', name: 'Blind test', desc: "Devine l'artiste, le titre, le dessin animé… 42 catégories, mode Zizanie avec bonus et malus.", cls: 'g-blind', lobby: 'Préparez vos oreilles 🎧' },
  undercover: { emoji: '🕵️', name: 'Undercover', desc: 'Un mot secret, un imposteur parmi vous. Donnez des indices, démasquez-le… sans vous faire avoir.', cls: 'g-uc', lobby: 'Qui est l\'undercover ? 🕵️' },
  word: { emoji: '🔤', name: 'Speed Word', desc: 'Des mots fléchés inédits à chaque partie, 4 niveaux. Seul contre la montre ou en course : le premier qui finit la grille gagne !', cls: 'g-word', lobby: 'À vos crayons… prêts ? ✏️' },
  sem: { emoji: '🌡️', name: 'Ça chauffe !', desc: 'Trouve le mot secret : chaque essai te dit si tu chauffes ou si tu gèles (°C). Le premier qui trouve gagne… et on enchaîne !', cls: 'g-sem', lobby: 'Prêts à chauffer ? 🔥' },
  bac: { emoji: '📋', name: 'Petit Bac', desc: 'Une lettre, des catégories classiques ou complètement fun… Remplis tout et crie STOP ! Puis on démonte les réponses des autres.', cls: 'g-bac', lobby: 'Tous à vos stylos ! ✍️' },
  bluff: { emoji: '🎭', name: 'Le Bluff', desc: 'Une anecdote vraie à trou : invente une fausse réponse crédible pour piéger tes potes… et retrouve la vraie !', cls: 'g-bluff', lobby: 'Que le meilleur menteur gagne 😏' },
  quiz: { emoji: '❓', name: 'Quiz', desc: 'Culture G, sport, manga, ciné… 4 choix, réponds vite ! Et des manches « La moins répondue » où il faut la bonne réponse que personne d\'autre n\'a donnée.', cls: 'g-quiz', lobby: 'Buzzers prêts ! ❓' },
  c4: { emoji: '🔴', name: 'Puissance 4', desc: 'Aligne 4 jetons avant ton adversaire ! Jetons qui tombent et rebondissent, mode Géant (aligne 5) et mode Bombes 💣.', cls: 'g-c4', lobby: 'Qui alignera ses jetons en premier ? 🔴🟡' },
  poker: { emoji: '🃏', name: 'Poker', desc: "Texas Hold'em entre potes : jetons, relances, tapis et bluff. 3 modes : Classique, Turbo et Tapis !", cls: 'g-poker', lobby: 'Faites vos jeux… et votre meilleur visage de bluffeur 😎' },
  golf: { emoji: '⛳', name: 'Mini-golf', desc: 'Mini-golf vu de dessus : moulins, eau, sable, vent, glace, bumpers et portails. Tout le monde joue en même temps !', cls: 'g-golf', lobby: 'Sortez les clubs, attention à la mare 🏌️' },
  chess: { emoji: '♟️', name: 'Échecs', desc: 'Le vrai jeu d\'échecs, en beau : pendules, 5 modes (Chess960, Roi de la colline, 3 échecs, Brouillard…), le gagnant reste à la table et les spectateurs parient !', cls: 'g-chess', lobby: 'Que le meilleur stratège gagne ♟️' },
  n25: { emoji: '🎯', name: '25 Pile', desc: '25 questions dans le désordre, et les réponses sont tous les nombres de 1 à 25, chacun une seule fois. Place les boules, déduis, et vise le 25/25 !', cls: 'g-n25', lobby: 'Boules chargées ! 🎯' },
  top7: { emoji: '7️⃣', name: 'Top 7', desc: 'Les 7 réponses préférées des gens sur un thème. Chacun son tour : plus ta réponse est rare dans le top, plus elle rapporte (n°7 = 7 pts) !', cls: 'g-top7', lobby: 'Plateau prêt ! 7️⃣' },
  punch: { emoji: '🎤', name: 'Punchline', desc: 'Réponds aux sujets de la façon la plus drôle possible. Duel de vannes, les autres votent. 100 % des votes = PUNCHLINE !', cls: 'g-punch', lobby: 'Micro ouvert ! 🎤' },
  draw: { emoji: '🎨', name: 'Draw Time', desc: "Un joueur dessine, les autres devinent ! Des mots classiques, marrants… ou un peu pimentés 🌶️", cls: 'g-draw', lobby: 'Sortez les crayons ! ✏️' },
  primo: { emoji: '🎴', name: 'PRIMO !', desc: 'Même couleur ou même chiffre, +2, +4, inversions… et un mode Pagaille plein de cartes vicieuses. Crie PRIMO à ta dernière carte !', cls: 'g-primo', lobby: 'Battez les cartes ! 🃏' },
  guess: { emoji: '🖼️', name: 'Guess Party', desc: 'Une image floutée, pixelisée ou zoomée : dessins animés, films, pochettes de rap… Trouve-la avant les autres !', cls: 'g-guess', lobby: 'Ouvrez grand les yeux ! 👀' },
  liar: { emoji: '🃏', name: 'Bar des Menteurs', desc: 'Pose tes cartes face cachée et bluffe… ou crie MENTEUR ! Le perdant tente sa chance au pistolet à bouchon.', cls: 'g-liar', lobby: 'Tout le monde au comptoir ! 🥃' },
  horses: { emoji: '🐎', name: 'Petits chevaux', desc: 'Le grand classique : lance le dé, sors tes chevaux, renvoie les autres à l\'écurie ! Choisis le skin de tes pions.', cls: 'g-horses', lobby: 'Tous en selle ! 🐎' },
  note: { emoji: '🔢', name: 'Jeu de la Note', desc: "Une note secrète sur 10, trois thèmes : réponds avec quelque chose qui « vaut » ta note. Les autres devinent !", cls: 'g-note', lobby: 'Sur une échelle de 1 à 10… 🔢' },
};
let GAME_INFO = { blindtest: { min: 1, max: 12 }, undercover: { min: 3, max: 12 }, word: { min: 1, max: 12 }, horses: { min: 1, max: 4 }, liar: { min: 1, max: 6 }, guess: { min: 1, max: 12 }, primo: { min: 1, max: 8 }, draw: { min: 2, max: 12 }, bac: { min: 1, max: 12 }, bluff: { min: 2, max: 10 }, punch: { min: 3, max: 10 }, sem: { min: 1, max: 12 }, top7: { min: 1, max: 10 }, quiz: { min: 1, max: 12 }, n25: { min: 1, max: 12 }, chess: { min: 2, max: 12 }, c4: { min: 2, max: 12 }, poker: { min: 2, max: 8 }, golf: { min: 1, max: 8 }, note: { min: 2, max: 10 } }, UC_THEMES = [], GP_THEMES = [];
fetch('/api/guess-themes').then(r => r.json()).then(t => { GP_THEMES = t; if (state?.game === 'guess') renderGameLobby?.(); }).catch(() => {});
const GAME_TAGS = { blindtest: 'musique chanson son audio', undercover: 'mots espion bluff mot secret', word: 'mots lettres rapidité clavier wordle', horses: 'plateau dés course chevaux', liar: 'cartes bluff menteur', guess: 'images photo deviner flou', primo: 'cartes uno', draw: 'dessin dessiner pictionary', bac: 'mots lettres petit bac', bluff: 'questions mensonge bluff', punch: 'humour phrases blague', sem: 'mots proximité sens cemantix', top7: 'classement listes réponses', quiz: 'questions culture qcm', n25: 'nombres chiffres questions', chess: 'plateau stratégie échecs 2 joueurs', note: 'note avis', c4: 'plateau jetons aligner 2 joueurs puissance', poker: 'cartes jetons argent casino bluff', golf: 'sport balle adresse minigolf mini-golf' };
const normq = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function gameMatch(id, q) {
  if (!q) return true;
  const m = GAME_META[id], i = GAME_INFO[id] || {};
  const hay = normq(`${m.name} ${m.desc} ${GAME_TAGS[id] || ''} ${id}`);
  return normq(q).split(/\s+/).filter(Boolean).every(w => /^\d+$/.test(w) ? (+w >= (i.min || 1) && +w <= (i.max || 99)) : hay.includes(w));
}
function filterGames(sel, q, none) {
  let n = 0; $$(sel).forEach(b => { const ok = gameMatch(b.dataset.game || b.dataset.g, q); b.classList.toggle('hidden', !ok); n += ok; });
  if (none) $(none).classList.toggle('hidden', n > 0);
}
$('#g-q').addEventListener('input', () => { filterGames('#games .game-card', $('#g-q').value, '#g-none'); $('#g-q-x').classList.toggle('hidden', !$('#g-q').value); });
$('#g-q-x').onclick = () => { $('#g-q').value = ''; $('#g-q').dispatchEvent(new Event('input')); $('#g-q').focus(); };
$('#gs-q').addEventListener('input', () => filterGames('#game-switch .gs', $('#gs-q').value));
const playersLabel = (g) => { const i = GAME_INFO[g]; return i.min === i.max ? `${i.min} joueurs` : `${i.min} à ${i.max} joueurs`; };
function renderGames() {
  $('#games').innerHTML = Object.entries(GAME_META).map(([id, m], i) => `
    <button class="game-card ${m.cls}" data-game="${id}" style="--i:${i}">
      <span class="g-bg"></span><span class="g-spark"></span>
      <span class="g-top"><span class="g-emoji">${m.emoji}</span><span class="g-players">👥 ${playersLabel(id)}</span></span>
      <span class="g-info"><b>${m.name}</b><small>${m.desc}</small></span>
      <span class="g-go">Jouer ▶</span>
    </button>`).join('');
  filterGames('#games .game-card', $('#g-q')?.value || '', '#g-none');
  $$('#games .game-card').forEach(b => b.onclick = () => {
    const id = identity(); if (!id) return;
    socket.emit('create', { ...id, game: b.dataset.game }, onJoined);
  });
}
renderGames();
fetch('/api/games').then(r => r.json()).then(j => { GAME_INFO = j.info; UC_THEMES = j.ucThemes; renderGames(); if (state) renderSettings(); }).catch(() => {});
$('#btn-join').onclick = () => {
  const id = identity(); if (!id) return;
  const code = $('#code').value.trim().toUpperCase();
  if (code.length !== 5) { $('#home-err').textContent = 'Le code fait 5 caractères.'; return; }
  socket.emit('join', { ...id, code }, onJoined);
};
$('#code').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-join').click(); });
$('#name').addEventListener('keydown', e => { if (e.key === 'Enter' && urlCode) $('#btn-join').click(); });

let joinedCode = null;
function onJoined(res) {
  if (res.error) { $('#home-err').textContent = res.error; return; }
  joinedCode = res.code;
  history.replaceState(null, '', '/r/' + res.code);
  $('#home').classList.remove('active'); $('#room').classList.add('active');
  $('#room-code').textContent = res.code;
  $('#chat').innerHTML = ''; (res.chat || []).forEach(addChat);
}
// reconnexion automatique (ex. téléphone en veille)
socket.on('connect', () => {
  if (joinedCode) socket.emit('join', { code: joinedCode, name: store.get('mz_name'), pid, ...save.look }, (r) => {
    if (r.error) { toast(r.error, 'error'); leave(); } else { $('#chat').innerHTML = ''; r.chat.forEach(addChat); }
  });
});

function leave() { location.href = '/'; }
$('#btn-leave').onclick = leave;
socket.on('kicked', () => { alert('Tu as été exclu du salon.'); leave(); });

$('#room-code-box').onclick = async () => {
  const link = location.origin + '/r/' + joinedCode;
  try { await navigator.clipboard.writeText(link); toast('🔗 Lien copié ! Envoie-le à tes potes'); }
  catch { prompt('Copie ce lien :', link); }
};
$('#volume').value = Math.round(audio.volume * 100);
$('#volume').oninput = (e) => { baseVolume = e.target.value / 100; if (!yoyoTimer) audio.volume = baseVolume; store.set('mz_vol', e.target.value); };
$('#btn-chat-toggle').onclick = () => $('#chat-panel').classList.toggle('open');

// ───────────── Catégories ─────────────
fetch('/api/categories').then(r => r.json()).then(c => { categories = c; if (state) renderSettings(); });

const isHost = () => state && state.hostId === pid;
const setSetting = (patch) => socket.emit('settings', patch);

function renderCats() {
  const s = state.settings;
  const groups = {};
  categories.forEach(c => (groups[c.group] ||= []).push(c));
  $('#cats').innerHTML = Object.entries(groups).map(([g, list]) => `
    <div class="cat-group"><div class="g">${esc(g)}</div><div class="cat-list">
      ${list.map(c => `<button class="cat ${s.categories.includes(c.id) ? 'on' : ''} ${c.star ? 'star' : ''}" data-id="${c.id}">${c.emoji} ${esc(c.name)}</button>`).join('')}
    </div></div>`).join('');
  $$('#cats .cat').forEach(b => b.onclick = () => {
    const set = new Set(state.settings.categories);
    set.has(b.dataset.id) ? set.delete(b.dataset.id) : set.add(b.dataset.id);
    setSetting({ categories: [...set] });
  });
  const n = s.categories.length;
  $('#cat-count').textContent = n ? `(${n} sélectionnée${n > 1 ? 's' : ''})` : '';
}
$$('[data-catsel]').forEach(b => b.onclick = () => {
  const v = b.dataset.catsel;
  if (v === 'all') setSetting({ categories: categories.map(c => c.id) });
  if (v === 'none') setSetting({ categories: [] });
  if (v === 'random') setSetting({ categories: [...categories].sort(() => Math.random() - .5).slice(0, 4).map(c => c.id) });
});

function renderSettings() {
  if (!state) return;
  const s = state.settings;
  renderCats();
  renderGameLobby();
  $$('#settings .seg').forEach(seg => {
    const k = seg.dataset.key;
    seg.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', String(s[k]) === b.dataset.v);
      b.onclick = () => setSetting({ [k]: isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v });
    });
  });
  $('#answer-block').style.display = s.mode === 'qcm' ? 'none' : '';
  $$('#settings .tog input').forEach(i => { i.checked = !!s[i.dataset.key]; i.onchange = () => setSetting({ [i.dataset.key]: i.checked }); });
  if (document.activeElement !== $('#custom-link')) $('#custom-link').value = s.customLink || '';
  $('#pl-status').textContent = s.customLink ? `✅ ${s.customSource ? s.customSource + ' · ' : ''}${s.customTitle || 'Playlist perso ajoutée à la partie'}` : '';
  $('#custom-only-row').classList.toggle('hidden', !s.customLink);
  $('#settings').classList.toggle('readonly', !isHost());
  $('#btn-start').style.display = isHost() ? '' : 'none';
  $('#wait-host').style.display = isHost() ? 'none' : '';
  $('#lobby-sub').textContent = isHost() ? 'Invite tes potes avec le lien en haut, règle la partie et lance-la.' : 'L\'hôte prépare la partie. Tu vois les réglages en direct.';
}

// Salon : choix du jeu (hôte), nombre de joueurs, réglages Undercover / Note
function renderGameLobby() {
  const g = state.game || 'blindtest', m = GAME_META[g], info = GAME_INFO[g];
  const n = state.players.filter(p => p.online).length;
  $('#game-badge').innerHTML = `${m.emoji} ${m.name}`;
  $('#game-switch').innerHTML = Object.entries(GAME_META).map(([id, x]) => `<button class="gs ${x.cls} ${id === g ? 'on' : ''}" data-g="${id}" ${isHost() ? '' : 'disabled'}>
    <span>${x.emoji}</span><b>${x.name}</b><small>👥 ${playersLabel(id)}</small></button>`).join('');
  $$('#game-switch .gs').forEach(b => b.onclick = () => { if (isHost() && b.dataset.g !== g) socket.emit('setGame', b.dataset.g); });
  filterGames('#game-switch .gs', $('#gs-q')?.value || '');
  $('#lobby-title').textContent = m.lobby;
  const ok = n >= info.min && n <= info.max;
  $('#lobby-count').className = 'lobby-count ' + (ok ? 'ok' : 'ko');
  $('#lobby-count').textContent = ok ? `👥 ${n} joueur${n > 1 ? 's' : ''} — c'est bon (${playersLabel(g)})`
    : n < info.min ? `👥 ${n} joueur${n > 1 ? 's' : ''} — il en faut au moins ${info.min} pour ce jeu. Invite tes potes avec le lien en haut !` : `👥 ${n} joueurs — ${info.max} maximum pour ce jeu`;
  $('#settings').classList.toggle('hidden', g !== 'blindtest');
  $('#set-undercover').classList.toggle('hidden', g !== 'undercover');
  $('#set-note').classList.toggle('hidden', g !== 'note');
  $('#set-word').classList.toggle('hidden', g !== 'word');
  $('#set-horses').classList.toggle('hidden', g !== 'horses');
  $('#set-liar').classList.toggle('hidden', g !== 'liar');
  $('#set-guess').classList.toggle('hidden', g !== 'guess');
  $('#set-primo').classList.toggle('hidden', g !== 'primo');
  $('#set-draw').classList.toggle('hidden', g !== 'draw');
  ['bac', 'bluff', 'punch', 'sem', 'top7', 'quiz', 'n25', 'chess', 'c4', 'poker', 'golf'].forEach(k => $('#set-' + k).classList.toggle('hidden', g !== k));
  $('#btn-start').textContent = `▶ Lancer ${{ note: 'le Jeu de la Note', blindtest: 'le Blind test', undercover: "l'Undercover", word: 'Speed Word', horses: 'les Petits chevaux', liar: 'le Bar des Menteurs', guess: 'la Guess Party', primo: 'PRIMO', draw: 'Draw Time', bac: 'le Petit Bac', bluff: 'le Bluff', punch: 'Punchline', sem: 'Ça chauffe', top7: 'le Top 7', quiz: 'le Quiz', n25: '25 Pile', chess: 'les Échecs', c4: 'le Puissance 4', poker: 'le Poker', golf: 'le Mini-golf' }[g]}`;
  $('#btn-start').disabled = !ok;
  if (g === 'blindtest') return;
  const box = $('#set-' + g), gs = state.gs?.[g] || {};
  box.classList.toggle('readonly', !isHost());
  if (g === 'undercover') {
    $('#uc-themes').innerHTML = [{ id: 'all', emoji: '🎲', name: 'Tout mélangé' }, ...UC_THEMES].map(t =>
      `<button class="cat ${gs.theme === t.id ? 'on' : ''} ${t.id === 'anime' ? 'star' : ''}" data-t="${t.id}">${t.emoji} ${esc(t.name)}</button>`).join('');
    $$('#uc-themes .cat').forEach(b => b.onclick = () => socket.emit('gsettings', { theme: b.dataset.t }));
  }
  if (g === 'chess' && window.CHESS) $('#ch-modehelp').textContent = CHESS.MODE_HELP[gs.mode] || '';
  if (g === 'quiz') {
    const keyOn = (t) => !!gs['t_' + t.id];
    ['gen', 'sub'].forEach(c => {
      $('#qz-' + c).innerHTML = QZ_THEMES.filter(t => t.cat === c).map(t => `<button class="cat ${keyOn(t) ? 'on' : ''}" data-t="${t.id}">${t.emoji} ${esc(t.name)}</button>`).join('');
    });
    const nOn = QZ_THEMES.filter(keyOn);
    $('#qz-count').textContent = `— ${nOn.length} coché${nOn.length > 1 ? 's' : ''} · ${nOn.reduce((a, t) => a + t.n, 0)} questions`;
    $$('#set-quiz .qz-cats .cat').forEach(b => b.onclick = () => socket.emit('gsettings', { ['t_' + b.dataset.t]: !gs['t_' + b.dataset.t] }));
    $$('#set-quiz .qz-bulk').forEach(b => b.onclick = () => socket.emit('gsettings', Object.fromEntries(QZ_THEMES.filter(t => t.cat === b.dataset.grp).map(t => ['t_' + t.id, b.dataset.on === '1']))));
  }
  if (g === 'guess') {
    const on = gs.themes || [];
    $('#gp-themes').innerHTML = GP_THEMES.map(t => `<button class="cat ${on.includes(t.id) ? 'on' : ''}" data-t="${t.id}">${t.emoji} ${esc(t.name)} <small>${t.n}</small></button>`).join('')
      + `<button class="cat" data-t="__all">🎲 Tout cocher</button>`;
    $$('#gp-themes .cat').forEach(b => b.onclick = () => {
      if (b.dataset.t === '__all') return socket.emit('gsettings', { themes: GP_THEMES.map(t => t.id) });
      const nx = on.includes(b.dataset.t) ? on.filter(x => x !== b.dataset.t) : [...on, b.dataset.t];
      if (!nx.length) return toast('Garde au moins un thème 😉', 'error');
      socket.emit('gsettings', { themes: nx });
    });
  }
  box.querySelectorAll('.gseg').forEach(seg => seg.querySelectorAll('button').forEach(b => {
    b.classList.toggle('on', String(gs[seg.dataset.key]) === b.dataset.v);
    b.onclick = () => socket.emit('gsettings', { [seg.dataset.key]: b.dataset.v === 'true' ? true : b.dataset.v === 'false' ? false : isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v });
  }));
  box.querySelectorAll('.gtog').forEach(i => { i.checked = !!gs[i.dataset.key]; i.onchange = () => socket.emit('gsettings', { [i.dataset.key]: i.checked }); });
}
$('#btn-check-pl').onclick = () => {
  const link = $('#custom-link').value.trim();
  if (!link) { setSetting({ customLink: '' }); return; }
  $('#pl-status').textContent = '⏳ Vérification…';
  socket.emit('checkPlaylist', link, (r) => {
    if (r.error) { $('#pl-status').textContent = '❌ ' + r.error; return; }
    setSetting({ customLink: link, customTitle: r.title, customSource: r.source });
    setTimeout(() => $('#pl-status').textContent = `✅ ${r.source} · « ${r.title} » — ${r.count} morceaux ajoutés`, 100);
  });
};
$('#btn-start').onclick = () => socket.emit('start');
$('#btn-replay').onclick = () => socket.emit('start');
$('#btn-lobby').onclick = () => socket.emit('backToLobby');
$('#btn-skip').onclick = () => socket.emit('skip');
$('#btn-skip-pw').onclick = () => socket.emit('skip');
$('#btn-ban').onclick = () => { socket.emit('ban'); $('#btn-ban').disabled = true; $('#btn-ban').textContent = '🚫 Signalé'; };
$('#btn-next').onclick = () => { $('#btn-next').classList.add('hidden'); socket.emit('next'); };
$('#btn-stop').onclick = () => socket.emit('stop');

// ───────────── État du salon ─────────────
function showView(id) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === id));
}
socket.on('room', (r) => {
  const prevPhase = state?.phase;
  state = r;
  setTimeout(tickRewards, 0);
  renderPlayers();
  $$('.host-only').forEach(e => e.style.display = isHost() ? '' : 'none');
  $$('.guest-only').forEach(e => e.style.display = isHost() ? 'none' : '');
  if (r.phase === 'lobby') { showView('v-lobby'); renderSettings(); stopAudio(); resetEffects(); }
  else $('#game-badge').innerHTML = `${GAME_META[r.game || 'blindtest'].emoji} ${GAME_META[r.game || 'blindtest'].name}`;
  if (r.phase === 'powers') renderPowerStatus();
  if (r.phase === 'loading') showView('v-loading');
  if (r.phase === 'end' && prevPhase !== 'end') renderEnd();
});

function renderPlayers() {
  const ps = [...state.players].sort((a, b) => b.score - a.score);
  $('#player-count').textContent = ps.filter(p => p.online).length;
  const inGame = ['playing', 'reveal'].includes(state.phase);
  $('#players').innerHTML = ps.map((p, i) => {
    const marks = state.phase === 'playing'
      ? (state.settings.mode === 'qcm' ? (p.answered ? '✅' : '') : `${p.foundArtist ? '🎤' : ''}${p.foundTitle ? '🎵' : ''}`)
      : state.phase === 'powers' ? (p.powered ? '🃏' : '⏳') : '';
    const done = state.phase === 'playing' && (state.settings.mode === 'qcm' ? p.answered : (p.foundArtist || p.foundTitle));
    return `<li style="--c:${p.color}" class="${p.online ? '' : 'off'} ${done ? 'done' : ''}">
      ${inGame || state.phase === 'end' ? `<span class="rank">${i + 1}</span>` : ''}
      ${avatarHTML(p, 38)}
      <span class="nm">${nameHTML(p)}${p.host ? ' 👑' : ''}${p.title ? `<small class="ptitle">« ${esc(p.title)} »</small>` : p.id === pid ? ' <small>(toi)</small>' : ''}${p.streak >= 3 ? ` <small>🔥 série de ${p.streak}</small>` : ''}</span>
      <span class="marks">${marks}</span>
      <span class="sc">${p.score}</span>
      ${p.id !== pid && p.online ? `<button class="trade-btn" data-trade="${p.id}" title="Proposer un échange">🔄</button>` : ''}
      ${isHost() && p.id !== pid && state.phase === 'lobby' ? `<button class="kick" data-kick="${p.id}" title="Exclure">✕</button>` : ''}
    </li>`;
  }).join('');
  $$('[data-kick]').forEach(b => b.onclick = () => socket.emit('kick', b.dataset.kick));
}

// ───────────── Manche ─────────────
function stopAudio() { clearInterval(tick); try { audio.pause(); } catch {} }

socket.on('round', (r) => {
  round = { ...r, startAt: Date.now() + r.startIn, myArtist: false, myTitle: false };
  showView('v-play');
  const cat = categories.find(c => c.id === r.cat);
  $('#round-num').textContent = `${r.index + 1} / ${r.total}`;
  $('#round-cat').textContent = cat ? `${cat.emoji} ${cat.name}` : (r.cat === 'perso' ? '🎵 Playlist perso' : '');
  $('#guess').value = ''; $('#guess-feedback').textContent = ''; $('#guess-feedback').className = 'feedback';
  $('#btn-unmute').classList.add('hidden');
  const text = r.mode === 'text';
  $('#text-answer').style.display = text ? '' : 'none';
  $('#qcm-answer').style.display = text ? 'none' : '';
  $('#b-artist').style.display = r.work || r.answer === 'title' ? 'none' : '';
  $('#b-title').style.display = !r.work && r.answer === 'artist' ? 'none' : '';
  $('#b-title').textContent = r.work ? '📺 ' + (r.label || 'Nom de l\'œuvre') : '🎵 Titre';
  $('#b-artist').classList.remove('ok'); $('#b-title').classList.remove('ok');
  round.answer = r.work ? 'title' : r.answer;
  $('#guess').placeholder = r.work ? `${r.label || 'Nom de l\'œuvre'}… (Entrée pour valider)` : r.answer === 'both' ? 'Artiste ou titre… (Entrée pour valider)' : r.answer === 'title' ? 'Le titre… (Entrée pour valider)' : 'L\'artiste… (Entrée pour valider)';
  $('#guess').disabled = false;
  $('#qcm-answer').className = 'qcm';
  $('#qcm-answer').innerHTML = (r.choices || []).map(c => `<button data-id="${esc(c.id)}" class="${c.artist ? '' : 'work'}"><b>${esc(c.title)}</b>${c.artist ? `<span>${esc(c.artist)}</span>` : ''}</button>`).join('');
  $$('#qcm-answer button').forEach(b => b.onclick = () => {
    if ($('#qcm-answer').classList.contains('locked') || Date.now() < round.startAt || Date.now() < frozenUntil) return;
    b.classList.add('picked'); $('#qcm-answer').classList.add('locked');
    socket.emit('choose', b.dataset.id);
  });

  // audio
  stopAudio();
  if (r.preview) { audio.src = r.preview; audio.load(); }
  $('#eq').classList.add('paused');
  resetEffects();
  applyEffects(r.effects);
  let started = false;
  tick = setInterval(() => {
    const now = Date.now();
    const toStart = round.startAt - now;
    if (toStart > 0) {
      $('#countdown').textContent = Math.ceil(toStart / 1000);
      $('#timer-bar').style.transform = 'scaleX(1)';
      $('#time-left').textContent = '';
      return;
    }
    $('#countdown').textContent = '';
    if (!started) {
      started = true;
      if (text) setTimeout(() => $('#guess').focus(), 50);
      if (r.preview) {
        if (!round.early) try { audio.currentTime = Math.min(25, Math.max(0, -toStart / 1000)); } catch {}
        audio.play().then(() => $('#eq').classList.remove('paused')).catch(() => $('#btn-unmute').classList.remove('hidden'));
      }
    }
    const elapsed = (now - round.startAt) / 1000;
    const left = Math.max(0, r.duration - elapsed);
    $('#timer-bar').style.transform = `scaleX(${left / r.duration})`;
    $('#time-left').textContent = Math.ceil(left) + ' s';
    if (left <= 0) { audio.pause(); $('#eq').classList.add('paused'); }
  }, 100);
});
$('#btn-unmute').onclick = () => {
  const elapsed = (Date.now() - round.startAt) / 1000;
  try { audio.currentTime = Math.max(0, elapsed); } catch {}
  audio.play().then(() => { $('#btn-unmute').classList.add('hidden'); $('#eq').classList.remove('paused'); }).catch(() => toast('Impossible de lire le son 😕', 'error'));
};

$('#guess-form').onsubmit = (e) => {
  e.preventDefault();
  const v = $('#guess').value.trim();
  if (!v || !round || Date.now() < round.startAt) return;
  socket.emit('guess', v, (res) => {
    const fb = $('#guess-feedback');
    if (res.artist) $('#b-artist').classList.add('ok');
    if (res.title) $('#b-title').classList.add('ok');
    if (res.gained.length) {
      const pts = res.gained.reduce((s, g) => s + (g.pts || 0), 0);
      const parts = [];
      if (res.gained.some(g => g.type === 'artist')) parts.push('Artiste trouvé');
      if (res.gained.some(g => g.type === 'title')) parts.push(round.work ? 'Trouvé' : 'Titre trouvé');
      if (res.gained.some(g => g.type === 'first')) parts.push('🥇 premier');
      if (res.gained.some(g => g.type === 'combo')) parts.push('🎯 combo');
      fb.textContent = `✅ ${parts.join(' · ')} ! +${pts}`; fb.className = 'feedback good';
      $('#guess').value = '';
      if (res.done) { $('#guess').disabled = true; $('#guess').placeholder = '🎉 Bravo, tout trouvé ! Attends les autres…'; }
    } else if (res.close) {
      fb.textContent = '🔥 Tu chauffes ! Presque…'; fb.className = 'feedback close';
      $('#guess').classList.add('shake'); setTimeout(() => $('#guess').classList.remove('shake'), 300);
    } else {
      fb.textContent = '❌ Raté, essaie encore'; fb.className = 'feedback bad';
      $('#guess').classList.add('shake'); setTimeout(() => $('#guess').classList.remove('shake'), 300);
      $('#guess').value = '';
    }
  });
};

socket.on('found', (f) => {
  addChat({ found: true, text: `${f.avatar} ${f.name} a trouvé ${f.what} !` });
  burst(f.winFx, f.id === pid ? 22 : 9);
});

// ───────────── Révélation ─────────────
socket.on('reveal', (rv) => {
  clearInterval(tick);
  resetEffects();
  if (round?.imposteur) {
    round.imposteur = false;
    toast("🎭 SURPRISE : tu écoutais un IMPOSTEUR ! Ce n'était pas la bonne chanson 😂", 'error');
    if (rv.track && round.preview) { try { audio.src = round.preview; audio.load(); audio.play().catch(() => {}); } catch {} }
  }
  showView('v-reveal');
  // on laisse la musique continuer quelques secondes pendant la révélation
  if (audio.paused && audio.src && round?.preview) audio.play().catch(() => {});
  $('#rv-cover').src = rv.track.cover || '';
  $('#rv-cover').style.display = rv.track.cover ? '' : 'none';
  $('#rv-title').textContent = rv.track.title;
  $('#rv-artist').textContent = rv.track.artist;
  $('#rv-artist').style.display = rv.track.artist ? '' : 'none';
  $('#rv-sub').textContent = rv.track.sub ? '🎵 ' + rv.track.sub : '';
  $('#rv-note').textContent = rv.track.note ? '📺 ' + rv.track.note : '';
  $('#btn-ban').disabled = false; $('#btn-ban').textContent = '🚫 Mauvaise version';
  $('#rv-link').href = rv.track.link || '#';
  $('#rv-link').style.display = rv.track.link ? '' : 'none';
  const byId = Object.fromEntries(state.players.map(p => [p.id, p]));
  const rows = rv.results.filter(r => byId[r.id]).sort((a, b) => b.gained - a.gained);
  $('#rv-results').innerHTML = rows.map(r => {
    const p = byId[r.id];
    const what = state.settings.mode === 'qcm' ? (r.correct ? '✅' : '❌') : `${r.artist ? '🎤' : ''}${r.title ? '🎵' : ''}${!r.artist && !r.title ? '❌' : ''}`;
    return `<li class="${r.gained ? 'win' : ''}">${avatarHTML(p, 26)} ${nameHTML(p)} ${what} ${r.gained ? `<b>+${r.gained}</b>` : ''}${r.time && r.gained ? ` <span class="muted small">${r.time.toFixed(1)} s</span>` : ''}</li>`;
  }).join('');
  const manual = !rv.pause;
  $('#next-wrap').classList.toggle('hidden', manual);
  $('#btn-next').classList.toggle('hidden', !(manual && isHost()));
  $('#wait-next').classList.toggle('hidden', !(manual && !isHost()));
  const bar = $('#next-bar'); bar.style.transition = 'none'; bar.style.width = '0';
  if (!manual) requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `width ${rv.pause}s linear`; bar.style.width = '100%'; }));
  // la musique continue pendant la révélation, puis s'arrête avant le morceau suivant
  clearTimeout(window._stopRv);
  window._stopRv = setTimeout(() => { if (state?.phase !== 'playing') audio.pause(); }, manual ? 15000 : Math.max(1500, rv.pause * 1000 - 400));
  if (rv.results.find(r => r.id === pid)?.gained) confetti(14);
});

// ───────────── Fin ─────────────
function grantCoins(e) {
  const mine = e.coins?.[pid];
  if (mine && save.lastGame !== e.gameId) {
    save.lastGame = e.gameId; save.coins += mine.coins; save.games++; save.good += mine.good || 0; if (mine.win) save.wins++;
    persist(); renderProfile();
    if (state?.game !== 'blindtest') toast(`🪙 +${mine.coins} pièces !`);
  }
  return mine;
}
socket.on('reward', grantCoins);
// actions des jeux Undercover / Note
const gAct = (type, data) => new Promise(r => socket.emit('g', { type, data }, (res) => { if (res?.error) toast(res.error, 'error'); r(res); }));
socket.on('g:state', (v) => {
  if (v.game === 'undercover' && window.UC) { if (!$('#v-uc').classList.contains('active')) showView('v-uc'); window.UC.render(v); }
  const MODS = { bac: 'BAC', bluff: 'BLUFF', punch: 'PUNCH', sem: 'SEM', top7: 'TOP7', quiz: 'QUIZ', n25: 'N25', chess: 'CHESS', c4: 'C4', poker: 'POKER', golf: 'GOLF' };
  if (MODS[v.game] && window[MODS[v.game]]) { if (!$('#v-' + v.game).classList.contains('active')) showView('v-' + v.game); window[MODS[v.game]].render(v); }
  if (v.game === 'draw' && window.DRAW) { if (!$('#v-draw').classList.contains('active')) showView('v-draw'); window.DRAW.render(v); }
  if (v.game === 'primo' && window.PRIMO) { if (!$('#v-primo').classList.contains('active')) showView('v-primo'); window.PRIMO.render(v); }
  if (v.game === 'guess' && window.GUESS) { if (!$('#v-guess').classList.contains('active')) showView('v-guess'); window.GUESS.render(v); }
  if (v.game === 'liar' && window.LIAR) { if (!$('#v-liar').classList.contains('active')) showView('v-liar'); window.LIAR.render(v); }
  if (v.game === 'horses' && window.HORSES) { if (!$('#v-horses').classList.contains('active')) showView('v-horses'); window.HORSES.render(v); }
  if (v.game === 'word' && window.WORD) { if (!$('#v-word').classList.contains('active')) showView('v-word'); window.WORD.render(v); }
  if (v.game === 'note' && window.NOTE) { if (!$('#v-note').classList.contains('active')) showView('v-note'); window.NOTE.render(v); }
});
socket.on('end', (e) => {
  const mine = grantCoins(e);
  if (mine) {
    $('#earned').classList.remove('hidden');
    $('#earned').innerHTML = `<span class="coin-spin">🪙</span> +${mine.coins} pièces <small>(${mine.good} bonne${mine.good > 1 ? 's' : ''} réponse${mine.good > 1 ? 's' : ''}${mine.rank <= 3 && Object.keys(e.coins).length > 1 ? ' · bonus podium' : ''})</small> · Total : <b>${save.coins} 🪙</b>`;
  }
  $('#history').innerHTML = e.history.map(h => `<li><b>${esc(h.title)}</b> — ${esc(h.artist)}</li>`).join('');
});
function renderEnd() {
  stopAudio();
  $('#earned').classList.add('hidden');
  showView('v-end');
  const ps = [...state.players].sort((a, b) => b.score - a.score);
  const order = [ps[1], ps[0], ps[2]];
  $('#podium').innerHTML = order.map((p, i) => p ? `<div class="step p${[2, 1, 3][i]}">
    ${avatarHTML(p, 70)}<span class="nm">${nameHTML(p)}</span>${p.title ? `<small class="ptitle">« ${esc(p.title)} »</small>` : ''}<span class="pts">${p.score} pts</span>
    <div class="block">${[2, 1, 3][i]}</div></div>` : '').join('');
  $('#final-list').innerHTML = ps.slice(3).map((p, i) => `<li value="${i + 4}">${avatarHTML(p, 28)} ${nameHTML(p)} — ${p.score} pts</li>`).join('');
  if (ps[0]?.id === pid) confetti(60); else confetti(20);
}

// ───────────── Chat & réactions ─────────────
function addChat(m) {
  const li = document.createElement('li');
  if (m.sys) { li.className = 'sys'; li.textContent = m.text; }
  else if (m.found) { li.className = 'found'; li.textContent = m.text; }
  else { li.style.setProperty('--c', m.color); li.innerHTML = `${avatarHTML(m, 22)} <b>${nameHTML(m)}</b> ${esc(m.text)}`; }
  const ul = $('#chat'); ul.appendChild(li);
  while (ul.children.length > 150) ul.firstChild.remove();
  ul.scrollTop = ul.scrollHeight;
}
socket.on('chat', addChat);
$('#chat-form').onsubmit = (e) => {
  e.preventDefault();
  const v = $('#chat-input').value.trim(); if (!v) return;
  $('#chat-input').value = '';
  // commande secrète : /modo <code> (jamais envoyée dans le chat)
  if (/^\/modo\b/i.test(v)) return MODO.login(v.replace(/^\/modo\s*/i, ''));
  socket.emit('chat', v);
};

// ───────────── 🛡️ Mode modérateur (réservé au détenteur du code ADMIN_KEY) ─────────────
const MODO = (() => {
  let on = false;
  const btn = () => $('#btn-modo');
  function login(key, silent) {
    if (!key) return silent || toast('Usage : /modo ton-code', 'error');
    socket.emit('modo', { key }, (r) => {
      if (r?.ok) { on = true; store.set('mz_modo', key); btn().classList.remove('hidden'); if (!silent) { toast('🛡️ Mode modo activé (visible par toi seul)'); sfx('legend'); } }
      else { if (!silent) toast(r?.error || 'Refusé', 'error'); if (silent) store.set('mz_modo', ''); }
    });
  }
  let tab = 'coins', target = '*';
  const FX = [
    ['flip', '🙃', 'Écran à l\'envers'], ['spin', '🌀', 'Toupie'], ['disco', '🪩', 'Disco arc-en-ciel'], ['wobble', '🫠', 'Écran en gelée'],
    ['tiny', '🔬', 'Écran minuscule'], ['big', '🔎', 'Zoom géant'], ['blur', '😵‍💫', 'Vision floue'], ['quake', '📳', 'Tremblement de terre'],
    ['dark', '🔦', 'Lampe torche'], ['ducks', '🦆', 'Invasion de canards'], ['clown', '🤡', 'Tout le monde en clown'], ['ghost', '👻', 'Bouh !'],
    ['horn', '📯', 'Corne de brume'], ['fakelegend', '🎰', 'Faux légendaire'], ['rain', '🌧️', 'Pluie d\'emojis'], ['msg', '📢', 'Message géant'],
  ];
  const KN = { icons: '😀 Avatars', colors: '🎨 Couleurs', frames: '🖼️ Cadres', nameFx: '✨ Effets de pseudo', titles: '🏷️ Titres', winFx: '🎉 Victoires', pawns: '♟️ Pions', boards: '🎲 Plateaux', pcfx: '💥 Anim. chevaux', cardbacks: '🃏 Dos de cartes' };
  const done = (ok) => (r) => r?.ok ? toast(ok + (r.n > 1 ? ` (${r.n} joueurs)` : '')) : toast(r?.error || 'Erreur', 'error');
  function panel() {
    let m = $('#modo-panel');
    if (!m) { m = document.createElement('div'); m.id = 'modo-panel'; m.className = 'modo-panel hidden'; document.body.appendChild(m); m.onclick = (e) => { if (e.target === m) m.classList.add('hidden'); }; }
    const others = (state?.players || []).filter(p => p.id !== pid);
    if (target !== '*' && !others.some(p => p.id === target)) target = '*';
    const tp = others.find(p => p.id === target);
    const who = `<div class="modo-who"><button class="${target === '*' ? 'on' : ''}" data-tg="*">👥 Tout le monde</button>${others.map(p => `<button class="${target === p.id ? 'on' : ''}" data-tg="${p.id}">${avatarHTML(p, 22)} ${esc(p.name)}</button>`).join('')}</div>`;
    const tabs = [['coins', '🪙 Pièces'], ['fun', '🎭 Farces'], ['items', '🎁 Objets'], ['room', '🛠️ Salon']];
    let body = '';
    if (tab === 'coins') body = `<h4>Mes pièces <b>🪙 ${save.coins.toLocaleString('fr-FR')}</b></h4>
      <div class="modo-row">${[1000, 10000, 100000].map(n => `<button class="btn btn-yellow btn-sm" data-self="${n}">+${n.toLocaleString('fr-FR')}</button>`).join('')}<button class="btn btn-ghost btn-sm" data-self="max">♾️ 999 999</button></div>
      <h4>Donner / reprendre des pièces</h4>${others.length ? `${who}<div class="modo-amt"><input class="input" id="modo-n" type="number" value="200"><button class="btn btn-primary btn-sm" id="modo-give">🎁 Donner</button><button class="btn btn-ghost btn-sm" id="modo-steal">🦹 Voler</button></div>` : '<p class="muted small">Personne d\'autre dans le salon.</p>'}`;
    if (tab === 'fun') body = others.length ? `${who}<div class="modo-fx">${FX.map(([k, e, n]) => `<button data-fx="${k}"><span>${e}</span>${n}</button>`).join('')}</div>
      <div class="modo-amt"><input class="input" id="modo-txt" maxlength="120" placeholder="Texte du message géant / emoji de la pluie (ex. 💩)"></div>
      <p class="muted small">Les effets durent quelques secondes et disparaissent tout seuls.</p>` : '<p class="muted small">Personne à embêter pour l\'instant 😇</p>';
    if (tab === 'items') body = others.length ? `${who}<div class="modo-amt"><select class="input" id="modo-kind">${Object.entries(KN).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div><div class="modo-items" id="modo-items"></div>` : '<p class="muted small">Personne d\'autre dans le salon.</p>';
    if (tab === 'room') body = `<div class="modo-row"><button class="btn btn-yellow btn-sm" data-act="host">👑 Devenir l'hôte</button><button class="btn btn-ghost btn-sm" data-act="lobby">⏹️ Stopper la partie</button></div>
      ${others.length ? `<div class="modo-list">${others.map(p => `<div class="modo-pl">${avatarHTML(p, 30)}<b>${esc(p.name)}</b>
        <button class="btn btn-sm btn-ghost" data-act="rename" data-p="${p.id}" title="Renommer">✏️</button><button class="btn btn-sm btn-ghost" data-act="mute" data-p="${p.id}" title="Couper son chat 2 min">🤐</button><button class="btn btn-sm btn-ghost" data-act="kick" data-p="${p.id}" title="Exclure">🚪</button></div>`).join('')}</div>` : ''}`;
    m.innerHTML = `<div class="modo-box"><button class="modo-x">✕</button>
      <h3>🛡️ Mode modo</h3><p class="muted small">Visible par toi seul.</p>
      <div class="modo-tabs">${tabs.map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
      <div class="modo-body">${body}</div>
      <button class="btn btn-ghost btn-sm modo-off">Désactiver sur cet appareil</button></div>`;
    m.querySelector('.modo-x').onclick = () => m.classList.add('hidden');
    m.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; panel(); });
    m.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => { target = b.dataset.tg; panel(); });
    m.querySelectorAll('[data-self]').forEach(b => b.onclick = () => {
      if (b.dataset.self === 'max') save.coins = 999999; else save.coins += +b.dataset.self;
      persist(); renderProfile(); coinFountain(20); sfx('legend'); panel();
    });
    const amt = () => Math.round(+$('#modo-n')?.value || 0);
    if ($('#modo-give')) $('#modo-give').onclick = () => { const n = amt(); if (n <= 0) return toast('Montant invalide', 'error'); socket.emit('modoGift', { to: target, coins: n }, done(`🎁 ${n} 🪙 envoyées`)); };
    if ($('#modo-steal')) $('#modo-steal').onclick = () => { const n = amt(); if (n <= 0) return toast('Montant invalide', 'error'); socket.emit('modoGift', { to: target, coins: -n }, done(`🦹 ${n} 🪙 volées`)); };
    m.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => {
      const fx = b.dataset.fx, text = $('#modo-txt')?.value || '';
      if (fx === 'msg' && !text.trim()) return toast('Écris le message dans le champ 👇', 'error');
      socket.emit('modoFx', { to: target, fx, text }, done(`${b.querySelector('span').textContent} envoyé !`));
    });
    const drawItems = () => {
      const k = $('#modo-kind').value;
      $('#modo-items').innerHTML = SHOP[k].filter(it => it.price).map(it => `<button data-it="${it.id}" class="r-${SHOP.rarity(it.price)}">${k === 'icons' ? `<em>${esc(it.id)}</em>` : k === 'colors' ? `<i style="background:${esc(it.base || it.id)}"></i><span>${esc(it.name || 'Couleur')}</span>` : `${esc(it.emoji || it.emojis || '🎁')} <span>${esc(it.name || it.id)}</span>`}</button>`).join('');
      $$('#modo-items [data-it]').forEach(b => b.onclick = () => socket.emit('modoItem', { to: target, kind: k, id: b.dataset.it }, done('🎁 Objet offert')));
    };
    if ($('#modo-kind')) { $('#modo-kind').onchange = drawItems; drawItems(); }
    m.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const act = b.dataset.act, to = b.dataset.p;
      let name;
      if (act === 'rename') { name = prompt('Nouveau pseudo ?'); if (!name) return; }
      if (act === 'kick' && !confirm('Exclure ce joueur ?')) return;
      socket.emit('modoAct', { act, to, name }, (r) => r?.ok ? (toast(act === 'mute' ? (r.muted ? '🤐 Chat coupé 2 min' : '🗣️ Chat rétabli') : '✅ C\'est fait'), setTimeout(panel, 300)) : toast(r?.error || 'Erreur', 'error'));
    });
    m.querySelector('.modo-off').onclick = () => { store.set('mz_modo', ''); on = false; btn().classList.add('hidden'); m.classList.add('hidden'); toast('Mode modo désactivé sur cet appareil'); };
    m.classList.remove('hidden');
  }
  btn().onclick = () => on && panel();
  socket.on('connect', () => { const k = store.get('mz_modo', ''); if (k) login(k, true); });
  socket.on('modoGift', ({ coins }) => {
    if (coins < 0) { const n = Math.min(save.coins, -coins); save.coins -= n; persist(); renderProfile(); toast(`🦹 Un voleur masqué t'a piqué ${n} 🪙 !`, 'error'); sfx('buzzer'); document.body.classList.add('sn-shake'); setTimeout(() => document.body.classList.remove('sn-shake'), 500); return; }
    save.coins += coins; persist(); renderProfile();
    toast(`🎁 Cadeau surprise : +${coins} 🪙 !`); coinFountain(Math.min(60, 10 + Math.round(coins / 20))); sfx('legend');
  });
  socket.on('modoItem', ({ kind, id }) => {
    const it = SHOP[kind]?.find(x => x.id === id); if (!it) return;
    if (!save.owned.includes(kind + ':' + id)) save.owned.push(kind + ':' + id);
    persist(); renderProfile();
    toast(`🎁 Cadeau surprise : « ${it.name || (kind === 'colors' ? 'une couleur' : id)} » débloqué dans la boutique !`); burst('fireworks', 18); sfx('legend');
  });
  socket.on('modoFx', (p) => PRANK(p));
  return { login };
})();
// 🎭 farces envoyées par le modo (durée courte, tout se remet en place tout seul)
function PRANK({ fx, text }) {
  const L = $('#reactions-layer'), B = document.body;
  const cls = (c, ms) => { B.classList.add(c); setTimeout(() => B.classList.remove(c), ms); };
  const el = (c, html, ms, css = {}) => { const e = document.createElement('div'); e.className = c; e.innerHTML = html; Object.assign(e.style, css); L.appendChild(e); setTimeout(() => e.remove(), ms); return e; };
  switch (fx) {
    case 'flip': cls('pr-flip', 6000); sfx('spin'); break;
    case 'spin': cls('pr-spin', 3200); sfx('spin'); break;
    case 'disco': cls('pr-disco', 6000); for (let i = 0; i < 6; i++) setTimeout(() => sfx('tick', .5), i * 450); el('pr-ball', '🪩', 6000); break;
    case 'wobble': cls('pr-wobble', 5000); break;
    case 'tiny': cls('pr-tiny', 5000); break;
    case 'big': cls('pr-big', 4000); break;
    case 'blur': cls('pr-blur', 5000); break;
    case 'quake': cls('pr-quake', 2200); sfx('bang'); setTimeout(() => sfx('bang'), 400); break;
    case 'clown': cls('pr-clown', 20000); sfx('klaxon'); break;
    case 'dark': {
      const d = el('pr-dark', '', 7000);
      const mv = (e) => { const t = e.touches ? e.touches[0] : e; d.style.setProperty('--x', t.clientX + 'px'); d.style.setProperty('--y', t.clientY + 'px'); };
      addEventListener('mousemove', mv); addEventListener('touchmove', mv); setTimeout(() => { removeEventListener('mousemove', mv); removeEventListener('touchmove', mv); }, 7000);
      break;
    }
    case 'ducks': for (let i = 0; i < 14; i++) setTimeout(() => { el('pr-duck', '🦆', 4200, { top: (8 + Math.random() * 80) + 'vh', fontSize: (2 + Math.random() * 2.5) + 'rem', animationDuration: (2.5 + Math.random() * 1.6) + 's' }); if (i % 3 === 0) sfx('klaxon', .4); }, i * 180); break;
    case 'ghost': el('pr-ghost', '👻<b>BOUH !</b>', 1600); sfx('buzzer'); cls('pr-quake', 500); break;
    case 'horn': el('pr-horn', '📯 <b>POUET POUET !</b>', 2200); for (let i = 0; i < 3; i++) setTimeout(() => sfx('klaxon'), i * 300); cls('pr-quake', 900); break;
    case 'fakelegend': {
      const e = el('pr-fake', '<div class="pr-fk"><small>✨ OBJET LÉGENDAIRE ✨</small><b>👑 Couronne du roi</b><span>débloqué !</span></div>', 5200);
      burst('supernova', 22); sfx('legend');
      setTimeout(() => { e.querySelector('.pr-fk').innerHTML = '<b>…c\'était une blague 😜</b><small>signé : le modo</small>'; e.classList.add('troll'); sfx('buzzer'); }, 2600);
      break;
    }
    case 'rain': { const em = [...(text || '💩').trim()].filter(c => c.trim()).slice(0, 4).join('') || '💩'; for (let i = 0; i < 40; i++) setTimeout(() => el('flying pr-rain', em.split('')[0] && [...em][i % [...em].length], 3300, { left: Math.random() * 100 + 'vw', fontSize: (1.4 + Math.random() * 2) + 'rem' }), i * 60); break; }
    case 'msg': el('pr-msg', `<small>📢 MESSAGE DU MODO</small><b>${esc(text || '')}</b>`, 5000); sfx('drum'); break;
  }
}
$('#reacts').innerHTML = REACTS.map(r => `<button type="button">${r}</button>`).join('');
$$('#reacts button').forEach(b => b.onclick = () => socket.emit('react', b.textContent));
socket.on('react', ({ emoji, avatar, name }) => {
  const el = document.createElement('div');
  el.className = 'flying';
  el.style.left = (5 + Math.random() * 85) + 'vw';
  el.innerHTML = `${emoji}<small>${avatar} ${esc(name)}</small>`;
  $('#reactions-layer').appendChild(el);
  setTimeout(() => el.remove(), 2700);
});

// ───────────── Divers ─────────────
function toast(text, type = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + type; t.textContent = text;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
socket.on('toast', (t) => toast(t.text, t.type));

function confetti(n) {
  const emojis = ['🎉', '⭐', '🎵', '🎶', '🟥', '🟨'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'flying';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    el.style.animationDelay = Math.random() * .6 + 's';
    el.textContent = emojis[i % emojis.length];
    $('#reactions-layer').appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }
}


// ═════════════════════ 🃏 MODE ZIZANIE ═════════════════════
let powersTick = null, myPowers = null;

socket.on('powers', (p) => {
  stopAudio(); resetEffects();
  myPowers = { ...p, endAt: Date.now() + p.endsIn };
  showView('v-powers');
  $('#pw-num').textContent = `${p.index + 1} / ${p.total}`;
  $('#pw-targets').classList.add('hidden');
  $('#pw-cards').className = 'pw-cards';
  $('#pw-cards').innerHTML = p.offers.map(o => `
    <button class="pw-card ${o.type} ${o.rarity}" data-id="${o.id}">
      <span class="tag">${o.type === 'bonus' ? '🎁 Bonus' : '😈 Malus'}</span>
      <span class="rar">${{ common: 'Commune', rare: '◆ Rare', epic: '✦ ÉPIQUE ✦', legendary: '★ LÉGENDAIRE ★' }[o.rarity] || ''}</span>
      <span class="em">${o.emoji}</span><b>${esc(o.name)}</b><small>${esc(o.desc)}</small>
    </button>`).join('');
  $$('#pw-cards .pw-card').forEach(c => c.onclick = () => pickCard(c));
  if (p.offers.some(o => o.rarity === 'legendary')) { sfx('legend'); setTimeout(() => sfx('legend'), 350); toast('🌈 Carte LÉGENDAIRE dans ta main !!!'); }
  else if (p.offers.some(o => o.rarity === 'epic')) { sfx('legend'); toast('💜 Carte ÉPIQUE !'); }
  $('#btn-pw-none').classList.remove('hidden');
  $('#pw-status').textContent = p.offers.some(o => o.type === 'malus') ? 'Un bonus pour toi, ou un malus pour embêter quelqu\'un ?' : 'Choisis un bonus !';
  if (p.chosen) lockCards(p.chosen.id);
  clearInterval(powersTick);
  powersTick = setInterval(() => {
    const left = Math.max(0, myPowers.endAt - Date.now());
    $('#pw-bar').style.transform = `scaleX(${left / 10000})`;
    if (!left) clearInterval(powersTick);
  }, 100);
  renderPowerStatus();
});

function pickCard(card) {
  const id = card.dataset.id;
  const offer = myPowers.offers.find(o => o.id === id);
  $$('#pw-cards .pw-card').forEach(c => c.classList.toggle('sel', c === card));
  if (offer.type === 'bonus') return sendPower(id);
  // malus : choisir la victime
  const others = state.players.filter(p => p.id !== pid && p.online);
  $('#pw-targets').classList.remove('hidden');
  $('#pw-targets').innerHTML = `<div class="lbl2">${offer.emoji} Sur qui ?</div>` +
    others.map(p => `<button data-t="${p.id}">${avatarHTML(p, 30)} ${nameHTML(p)}</button>`).join('');
  $$('#pw-targets [data-t]').forEach(b => b.onclick = () => sendPower(id, b.dataset.t));
}

function sendPower(id, target) {
  socket.emit('power', { id, target }, (r) => {
    if (r?.error) return toast(r.error, 'error');
    lockCards(id, target);
    sfx('pop');
  });
}
function lockCards(id, target) {
  $('#pw-cards').classList.add('locked');
  $('#pw-targets').classList.add('hidden');
  $('#btn-pw-none').classList.add('hidden');
  const o = myPowers?.offers.find(x => x.id === id);
  const tg = target && state.players.find(p => p.id === target);
  $('#pw-status').textContent = id === 'none' ? '😇 Tu passes ton tour. En attente des autres…'
    : `✅ ${o?.emoji || ''} ${o?.name || ''}${tg ? ' → ' + tg.avatar + ' ' + tg.name : ''} · En attente des autres…`;
}
$('#btn-pw-none').onclick = () => sendPower('none');

function renderPowerStatus() {
  if (!state || state.phase !== 'powers') return;
  const waiting = state.players.filter(p => p.online && !p.powered).length;
  if ($('#pw-cards').classList.contains('locked')) {
    $('#pw-status').textContent = $('#pw-status').textContent.split(' · ')[0] + (waiting ? ` · Encore ${waiting} joueur${waiting > 1 ? 's' : ''}…` : ' · C\'est parti !');
  }
}

// ───── effets pendant l'écoute ─────
let mosquitoNode = null;
let fxTimers = [], yoyoTimer = null, frozenUntil = 0, crazyKeys = false, rainTimer = null;

function resetEffects() {
  fxTimers.forEach(clearTimeout); fxTimers = [];
  clearInterval(yoyoTimer); yoyoTimer = null;
  frozenUntil = 0;
  document.body.classList.remove('flipped', 'blind');
  crazyKeys = false; clearInterval(rainTimer); rainTimer = null;
  document.body.classList.remove('blackout'); try { audio.muted = false; } catch {}
  if (mosquitoNode) { try { mosquitoNode.stop(); } catch {} mosquitoNode = null; }
  try { speechSynthesis.cancel(); } catch {}
  $('#freeze-layer').classList.add('hidden');
  $('#fx-area').innerHTML = '';
  try { audio.playbackRate = 1; audio.preservesPitch = true; audio.mozPreservesPitch = true; audio.loop = false; audio.volume = baseVolume; } catch {}
}

function at(ms, fn) { fxTimers.push(setTimeout(fn, Math.max(0, ms))); }

function applyEffects(fx) {
  if (!fx) return;
  const area = $('#fx-area');
  const startIn = round.startAt - Date.now();
  const dur = round.duration * 1000;
  if (fx.bonus) {
    const b = fx.bonus;
    area.insertAdjacentHTML('beforeend', `<div class="fx bonus ${b.rarity || ''}">
      ${b.image ? `<div class="fx-img"><img src="${esc(b.image)}" alt=""></div>` : `<span class="em">${b.emoji}</span>`}
      <div><div>${b.emoji} ${esc(b.name)}</div>${b.hint ? `<div class="hint">${esc(b.hint)}</div>` : ''}${b.id === 'double' ? '<div class="hint">×2 sur cet extrait !</div>' : ''}${b.id === 'triple' ? '<div class="hint">×3 sur cet extrait !!</div>' : ''}${b.id === 'jackpot' ? '<div class="hint">🎰 ×4 !!!</div>' : ''}${b.id === 'eclair' ? '<div class="hint">+50 si trouvé en moins de 10 s</div>' : ''}${b.id === 'plume' ? '<div class="hint">✍️ Pose ton clavier…</div>' : ''}${b.id === 'souffleur' ? '<div class="small">🎧 Monte le son, la voix arrive dans 4 s…</div>' : ''}${b.id === 'shield' ? '<div class="hint">Protégé !</div>' : ''}</div></div>`);
    if (b.id === 'early' && round.preview) {
      round.early = true;
      area.lastElementChild.querySelector('div:last-child').insertAdjacentHTML('beforeend', '<div class="hint">Écoute… 🤫</div>');
      at(startIn - 3000, () => { try { audio.currentTime = 0; } catch {} audio.play().then(() => $('#eq').classList.remove('paused')).catch(() => {}); });
    }
    if (b.whisper) at(startIn + 4000, () => whisper(b.whisper));
    if (b.autotype) at(startIn + 2500, () => autoType(b.autotype));
    if (b.autoChoice) at(startIn + 3000, () => { const el = $(`#qcm-answer [data-id="${CSS.escape(b.autoChoice)}"]`); if (el) { el.classList.add('magic'); el.click(); } });
    if (b.remove) at(startIn, () => b.remove.forEach(id => { const el = $(`#qcm-answer [data-id="${CSS.escape(id)}"]`); if (el) el.style.visibility = 'hidden'; }));
  }
  if (fx.sent) toast(fx.sent.blocked ? `🛡️ ${fx.sent.target} avait un bouclier… raté !` : `${fx.sent.emoji} ${fx.sent.name} envoyé à ${fx.sent.target} 😈`);
  for (let m of fx.maluses) {
    if (m.id === 'imposteur' && !m.blocked) {
      if (m.decoy && m.decoy !== 'mock-decoy') {
        // la victime n'est PAS prévenue : elle entend juste une autre chanson 😈
        round.imposteur = true;
        try { audio.src = m.decoy; audio.load(); } catch {}
        continue;
      }
      m = { ...m, id: 'bazar', name: 'Le Grand Bazar (de secours)' };
    }
    if (m.blocked) {
      area.insertAdjacentHTML('beforeend', `<div class="fx blocked"><span class="em">🛡️</span><div>Ton bouclier a bloqué « ${esc(m.name)} » de ${m.fromAvatar} ${esc(m.from)}</div></div>`);
      continue;
    }
    area.insertAdjacentHTML('beforeend', `<div class="fx malus ${m.rarity || ''}"><span class="em">${m.emoji}</span><div>${m.fromAvatar} ${esc(m.from)} t'a envoyé <b>${esc(m.name)}</b> !</div></div>`);
    toast(`${m.emoji} ${m.from} t'a envoyé « ${m.name} » !`, 'error');
    sfx('buzzer', .5);
    const bazar = m.id === 'bazar';
    if (bazar) { sfx('legend'); toast('🎪 LE GRAND BAZAR !!! 🎪', 'error'); }
    if (m.id === 'buzzer' || bazar) {
      const n = 6 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) at(startIn + 600 + Math.random() * (dur - 1500), () => { sfx(randomSfx()); document.querySelector('.stage').classList.add('shake-hard'); setTimeout(() => document.querySelector('.stage').classList.remove('shake-hard'), 400); });
    }
    if (m.id === 'flip') { at(startIn, () => document.body.classList.add('flipped')); at(startIn + 12000, () => document.body.classList.remove('flipped')); }
    if (bazar) at(startIn, () => document.body.classList.add('flipped'));
    if (m.id === 'rain' || bazar) at(startIn, () => { rainTimer = setInterval(emojiDrop, bazar ? 260 : 180); });
    if (m.id === 'crazykeys') at(startIn, () => { crazyKeys = true; });
    if (m.id === 'slowmo') {
      try { audio.preservesPitch = false; audio.mozPreservesPitch = false; audio.loop = true; } catch {}
      at(startIn, () => { try { audio.playbackRate = 0.72; } catch {} });
      at(startIn + 300, () => { try { audio.playbackRate = 0.72; } catch {} });
    }
    if (m.id === 'chipmunk' || bazar) {
      try { audio.preservesPitch = false; audio.mozPreservesPitch = false; audio.loop = true; } catch {}
      at(startIn, () => { try { audio.playbackRate = 1.35; } catch {} });
      // la lecture démarre au même moment que pour les autres : on réapplique la vitesse
      at(startIn + 300, () => { try { audio.playbackRate = 1.35; } catch {} });
    }
    if (m.id === 'freeze') {
      frozenUntil = round.startAt + 7000;
      at(startIn, () => {
        $('#guess').disabled = true; $('#freeze-layer').classList.remove('hidden');
        const iv = setInterval(() => {
          const l = Math.ceil((frozenUntil - Date.now()) / 1000);
          $('#freeze-count').textContent = l > 0 ? l + ' s' : '';
          if (l <= 0) { clearInterval(iv); $('#freeze-layer').classList.add('hidden'); if (!$('#guess').placeholder.startsWith('🎉')) { $('#guess').disabled = false; $('#guess').focus(); } }
        }, 200);
        fxTimers.push(iv);
      });
    }
    if (m.id === 'moustique') at(startIn, () => mosquito(dur));
    if (m.id === 'coupures') {
      for (let i = 0; i < 4; i++) {
        const t0 = startIn + 1500 + Math.random() * (dur - 4000);
        at(t0, () => { audio.muted = true; document.body.classList.add('blackout'); sfx('wrong', .4); });
        at(t0 + 1800 + Math.random() * 900, () => { audio.muted = false; document.body.classList.remove('blackout'); });
      }
    }
    if (m.id === 'scratch') at(startIn + 800, () => {
      const iv = setInterval(() => {
        if (Math.random() < .55) { try { audio.currentTime = Math.max(0, audio.currentTime - (0.8 + Math.random() * 1.6)); } catch {} sfx('scratch'); }
      }, 1300);
      fxTimers.push(iv);
    });
    if (m.id === 'yoyo') at(startIn, () => {
      let up = false;
      yoyoTimer = setInterval(() => { up = !up; audio.volume = up ? baseVolume : Math.min(baseVolume, 0.04 + Math.random() * 0.1); }, 900 + Math.random() * 600);
    });
    if (m.id === 'blind') at(startIn, () => document.body.classList.add('blind'));
  }
}

// ───── Soundboard (sons générés par le navigateur, aucun fichier) ─────
const SFX = ['buzzer', 'horn', 'klaxon', 'quack', 'boing', 'siren', 'wrong'];
const randomSfx = () => SFX[Math.floor(Math.random() * SFX.length)];
function sfx(name, vol = 1) {
  if (!actx) return;
  try { actx.resume(); } catch {}
  const t0 = actx.currentTime, out = actx.createGain();
  out.gain.value = Math.max(0.15, baseVolume) * 0.45 * vol;
  out.connect(actx.destination);
  const osc = (type, f, start, end, gain = 1) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0 + start);
    g.gain.setValueAtTime(0, t0 + start); g.gain.linearRampToValueAtTime(gain, t0 + start + 0.02);
    g.gain.setValueAtTime(gain, t0 + end - 0.05); g.gain.linearRampToValueAtTime(0, t0 + end);
    o.connect(g); g.connect(out); o.start(t0 + start); o.stop(t0 + end + 0.05);
    return o;
  };
  if (name === 'buzzer') { osc('square', 110, 0, .7); osc('sawtooth', 116, 0, .7, .6); }
  if (name === 'wrong') { osc('square', 300, 0, .18); osc('square', 200, .2, .55); }
  if (name === 'horn') { [440, 554, 659].forEach(f => { const o = osc('sawtooth', f, 0, 1.1, .45); o.frequency.linearRampToValueAtTime(f * 1.03, t0 + 1.1); }); }
  if (name === 'klaxon') { [0, .35].forEach(d => { osc('square', 392, d, d + .28, .7); osc('square', 494, d, d + .28, .5); }); }
  if (name === 'quack') {
    [0, .22].forEach(d => {
      const o = osc('sawtooth', 950, d, d + .16, .9); o.frequency.exponentialRampToValueAtTime(420, t0 + d + .16);
    });
  }
  if (name === 'boing') { const o = osc('sine', 140, 0, .6, 1); o.frequency.exponentialRampToValueAtTime(700, t0 + .25); o.frequency.exponentialRampToValueAtTime(160, t0 + .6); }
  if (name === 'siren') { const o = osc('triangle', 650, 0, 1.6, .9); for (let i = 0; i < 4; i++) o.frequency.linearRampToValueAtTime(i % 2 ? 650 : 1250, t0 + .4 * (i + 1)); }
  if (name === 'scratch') {
    const len = actx.sampleRate * .25, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = actx.createBufferSource(), f = actx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.setValueAtTime(3000, t0); f.frequency.exponentialRampToValueAtTime(600, t0 + .25);
    src.buffer = buf; src.connect(f); f.connect(out); src.start(t0);
  }
  if (name === 'legend') { [523, 659, 784, 1047].forEach((f, i) => osc('triangle', f, i * .09, i * .09 + .5, .7)); }
  if (name === 'pop') { const o = osc('sine', 500, 0, .12, .8); o.frequency.exponentialRampToValueAtTime(1100, t0 + .1); }
  const noise = (dur, f0, f1, type = 'bandpass', gain = 1, start = 0) => {
    const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    f.type = type; f.frequency.setValueAtTime(f0, t0 + start); f.frequency.exponentialRampToValueAtTime(f1, t0 + start + dur);
    g.gain.value = gain; src.buffer = buf; src.connect(f); f.connect(g); g.connect(out); src.start(t0 + start);
  };
  if (name === 'tick') { noise(.03, 4000, 2500, 'highpass', .8); }
  const shaped = (dur, env, f0, f1, type, gain, start = 0) => {
    const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * env(i / len);
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    f.type = type; f.frequency.setValueAtTime(f0, t0 + start); f.frequency.exponentialRampToValueAtTime(f1, t0 + start + dur); f.Q.value = .7;
    g.gain.value = gain; src.buffer = buf; src.connect(f); f.connect(g); g.connect(out); src.start(t0 + start);
  };
  if (name === 'swell') { shaped(1.2, x => Math.pow(x, 1.6), 400, 1600, 'bandpass', 2.6); }
  if (name === 'roar') { shaped(3.2, x => Math.min(1, x * 12) * Math.pow(1 - x, .8), 700, 900, 'bandpass', 3.2); shaped(2.6, x => Math.min(1, x * 10) * (1 - x), 1800, 1400, 'bandpass', 1.4); }
  if (name === 'boom') { const o = osc('sine', 90, 0, 1.1, 1.6); o.frequency.exponentialRampToValueAtTime(28, t0 + 1.1); noise(.5, 600, 60, 'lowpass', 3.2); }
  if (name === 'coin') { [0, .05, .1].forEach((d, i) => { osc('triangle', 2400 + i * 300, d, d + .04, .45); noise(.03, 5000, 3000, 'highpass', .5, d); }); }
  if (name === 'putt') { osc('sine', 900, 0, .06, .9); noise(.05, 3000, 1500, 'bandpass', 1.2); }
  if (name === 'hole') { [0, .09, .2].forEach((d, i) => { const o = osc('sine', 700 - i * 150, d, d + .12, .9); o.frequency.exponentialRampToValueAtTime(300 - i * 60, t0 + d + .12); }); }
  if (name === 'splash') { shaped(.9, x => Math.min(1, x * 30) * Math.pow(1 - x, 2), 2500, 500, 'lowpass', 3); shaped(.5, x => Math.pow(1 - x, 3), 6000, 3000, 'highpass', 1.2); }
  if (name === 'wall') { osc('sine', 260, 0, .07, .7); noise(.04, 1200, 600, 'bandpass', 1); }
  if (name === 'whoosh') { shaped(.6, x => Math.sin(x * Math.PI), 400, 2200, 'bandpass', 2); }
  if (name === 'sand') { shaped(.4, x => Math.pow(1 - x, 1.5), 3000, 1800, 'highpass', 1.6); }
  if (name === 'clunk') { noise(.09, 300, 90, 'lowpass', 3); osc('square', 60, 0, .08, .5); }
  if (name === 'crowd') { noise(2.6, 500, 1100, 'bandpass', 2.4); noise(2.2, 1400, 2200, 'bandpass', 1.2); }
  if (name === 'click') { noise(.05, 2500, 1200, 'bandpass', 1.6); osc('square', 1800, 0, .04, .25); }
  if (name === 'card') { noise(.14, 1500, 5000, 'bandpass', .9); }
  if (name === 'spin') { for (let i = 0; i < 14; i++) noise(.025, 3500, 2500, 'highpass', .7, i * (.04 + i * .006)); }
  if (name === 'drum') { for (let i = 0; i < 18; i++) noise(.05, 1800, 900, 'bandpass', .4 + i * .03, i * .06); }
  if (name === 'bang') { noise(.9, 900, 60, 'lowpass', 3); const o = osc('sine', 120, 0, .5, 1); o.frequency.exponentialRampToValueAtTime(35, t0 + .5); }
  if (name === 'stamp') { noise(.12, 400, 120, 'lowpass', 2.5); osc('sine', 90, 0, .18, .8); }
}


// 💩 Pluie d'emojis
function emojiDrop() {
  const E = ['💩', '🤡', '🦆', '🍌', '🥖', '🐸', '🧀', '🦄', '🍆', '🐔', '🎺', '🌭'];
  const el = document.createElement('div');
  el.className = 'rain-drop';
  el.textContent = E[Math.floor(Math.random() * E.length)];
  el.style.left = (Math.random() * 92) + 'vw';
  el.style.fontSize = (3.5 + Math.random() * 4) + 'rem';
  el.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
  $('#reactions-layer').appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ⌨️ Clavier fou : une lettre sur trois se transforme
$('#guess').addEventListener('input', (e) => {
  if (!crazyKeys || e.inputType !== 'insertText' || Math.random() > 0.35) return;
  const v = $('#guess').value; if (!v) return;
  const L = 'azertyuiopqsdfghjklmwxcvbn';
  $('#guess').value = v.slice(0, -1) + L[Math.floor(Math.random() * L.length)];
});

// 🗣️ Le Souffleur : voix de robot qui chuchote la réponse
function whisper(text) {
  try {
    const u = new SpeechSynthesisUtterance('Psst… la réponse, c\'est… ' + text);
    u.lang = 'fr-FR'; u.rate = 0.85; u.pitch = 1.7; u.volume = 1;
    const v = speechSynthesis.getVoices().find(v => /^fr/i.test(v.lang));
    if (v) u.voice = v;
    audio.volume = Math.min(baseVolume, 0.25); // on baisse la musique pour bien entendre
    u.onend = () => { audio.volume = baseVolume; };
    speechSynthesis.speak(u);
  } catch {
    toast('🗣️ Psst… c\'est « ' + text + ' »');
  }
}


// 🎉 Effet de victoire choisi dans la boutique : pluie d'emojis ou célébration animée
function burst(fxId, n = 16) {
  const fx = SHOP.winFx.find(x => x.id === fxId) || SHOP.winFx[0];
  if (fx.kind && CELEBRATIONS[fx.kind]) {
    if (Date.now() < burst.lock) return; // une célébration animée à la fois
    burst.lock = Date.now() + (fx.kind === 'goat' ? 3200 : fx.kind === 'siuuu' ? 5400 : 1800);
    return CELEBRATIONS[fx.kind](Math.min(1.3, Math.max(.45, n / 22)));
  }
  const em = [...fx.emojis];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'flying';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
    el.style.animationDelay = Math.random() * .5 + 's';
    el.textContent = em[i % em.length];
    $('#reactions-layer').appendChild(el);
    setTimeout(() => el.remove(), 3300);
  }
}
function divineFlash() { fxEl('dv-flash', {}, '<b>✹ DIVIN ✹</b>', 2200); }
function fxEl(cls, css = {}, html = '', life = 2500) {
  const el = document.createElement('div');
  el.className = cls; el.innerHTML = html;
  for (const [k, v] of Object.entries(css)) { if (k.startsWith('--')) el.style.setProperty(k, v); else el.style[k] = v; }
  $('#reactions-layer').appendChild(el);
  setTimeout(() => el.remove(), life);
  return el;
}
const rnd = (a, b) => a + Math.random() * (b - a);
const CELEBRATIONS = {
  // ⚽ SIUUU (rareté DIVINE) : stade de nuit, sprint, saut avec vrille, atterrissage sur LA pose, pyrotechnie
  siuuu(k) {
    const O = '#1c120a', SK = '#c98d5f', SKD = '#a56a3e', WH = '#ffffff', WHD = '#d5dde8', GD = '#e6b325', GDD = '#9a6c00';
    const limb = (d, c, w, cls = '') => `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round" class="${cls}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" class="${cls}"/>`;
    const boot = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-9 -6 Q-10 4 -4 6 L16 6 Q20 5 18 0 Q12 -2 6 -7 Z" fill="#111" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-2 -1 Q6 1 14 1" stroke="${GD}" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;
    const sock = (d) => limb(d, WH, 14) + `<path d="${d}" fill="none" stroke="${GD}" stroke-width="15" stroke-dasharray="3 30" stroke-dashoffset="-2"/>`;
    const head = (front, tilt = -8) => `<g transform="rotate(${tilt} 100 62)">
        <rect x="92" y="70" width="16" height="20" rx="5" fill="${SKD}" stroke="${O}" stroke-width="3"/>
        <ellipse cx="82.5" cy="62" rx="4" ry="6" fill="${SK}" stroke="${O}" stroke-width="2.5"/><ellipse cx="117.5" cy="62" rx="4" ry="6" fill="${SK}" stroke="${O}" stroke-width="2.5"/>
        <ellipse cx="100" cy="60" rx="17" ry="21" fill="${SK}" stroke="${O}" stroke-width="3"/>
        ${front ? `<path d="M90 50 q4 -3 8 0 M102 50 q4 -3 8 0" stroke="${O}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M90 56 q4 3 7 0 M103 56 q4 3 7 0" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M99 58 q-3 7 1 8" stroke="${SKD}" stroke-width="2" fill="none"/>
          <ellipse cx="100" cy="71" rx="5.5" ry="6.5" fill="#3a0d0d" stroke="${O}" stroke-width="2"/><ellipse cx="100" cy="74" rx="3" ry="2" fill="#d65a5a"/>
          <path d="M84 48 Q82 30 100 28 Q119 28 118 48 Q114 38 104 38 Q96 36 90 41 Q86 43 84 48Z" fill="#1d140e"/>
          <path d="M96 30 Q104 22 114 30 Q106 28 98 33Z" fill="#2a1d14"/>`
        : `<path d="M83 52 Q80 30 100 28 Q121 28 117 52 Q118 70 112 76 Q100 80 88 76 Q82 70 83 52Z" fill="#1d140e"/><path d="M88 72 Q100 78 112 72" stroke="#2a1d14" stroke-width="3" fill="none"/>`}
      </g>`;
    const shorts = `<path d="M74 160 H126 L135 198 Q120 203 106 200 L100 186 L94 200 Q80 203 65 198 Z" fill="${WH}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M100 168 L100 186" stroke="${WHD}" stroke-width="3"/><path d="M66 194 L76 196 M134 194 L124 196" stroke="${GD}" stroke-width="3"/>`;
    const shirt = (front) => `<path d="M70 92 Q100 80 130 92 L142 112 L130 120 L128 166 Q100 174 72 166 L70 120 L58 112 Z" fill="${WH}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M128 120 L128 166 Q114 171 104 172 L110 120Z" fill="${WHD}" opacity=".7"/>
      <path d="M58 112 L70 120 M142 112 L130 120" stroke="${GD}" stroke-width="3"/>
      ${front ? `<path d="M88 88 L100 103 L112 88" fill="none" stroke="${GD}" stroke-width="4" stroke-linejoin="round"/><circle cx="86" cy="116" r="6" fill="${GD}" stroke="${GDD}" stroke-width="1.5"/><text x="116" y="124" font-family="Bungee,sans-serif" font-size="14" fill="${GD}" stroke="${GDD}" stroke-width=".8" text-anchor="middle">7</text>`
        : `<text x="100" y="112" font-family="Bungee,sans-serif" font-size="11" letter-spacing="1" fill="${GD}" stroke="${GDD}" stroke-width=".6" text-anchor="middle">SIUUU</text><text x="100" y="158" font-family="Bungee,sans-serif" font-size="44" fill="${GD}" stroke="${GDD}" stroke-width="1.5" text-anchor="middle">7</text>`}`;
    const fig = ({ front = true, arms = 'pose', legs = 'wide', tilt = -8 }) => {
      const A = { pose: ['M66 106 Q54 138 44 168', 'M134 106 Q146 138 156 168'], tuck: ['M66 106 Q52 130 72 148', 'M134 106 Q148 130 128 148'], up: ['M66 106 Q48 84 40 56', 'M134 106 Q152 84 160 56'] }[arms];
      const hands = { pose: [[44, 170], [156, 170]], tuck: [[74, 150], [126, 150]], up: [[40, 52], [160, 52]] }[arms];
      const L = { wide: ['M88 192 L66 232 L54 268', 'M112 192 L134 232 L146 268'], tuck: ['M90 192 L74 222 L94 246', 'M110 192 L126 222 L106 246'] }[legs];
      const ft = { wide: [[50, 276, 1], [150, 276, 0]], tuck: [[98, 252, 0], [102, 252, 1]] }[legs];
      return `${limb(L[0], SK, 13)}${limb(L[1], SK, 13)}
        ${sock(legs === 'wide' ? 'M60 246 L54 268' : 'M86 238 L94 246')}${sock(legs === 'wide' ? 'M140 246 L146 268' : 'M114 238 L106 246')}
        ${boot(...ft[0])}${boot(...ft[1])}${shorts}
        ${limb(A[0], SK, 12)}${limb(A[1], SK, 12)}
        ${hands.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${SK}" stroke="${O}" stroke-width="2.8"/>`).join('')}
        ${shirt(front)}
        ${limb(A[0].split(' ').slice(0, 2).join(' ') + ' 60 122', WH, 17)}${limb(A[1].split(' ').slice(0, 2).join(' ') + ' 140 122', WH, 17)}
        ${head(front, tilt)}`;
    };
    const runFrame = (a) => {
      const legs = a ? ['M104 178 L128 196 L124 236', 'M96 178 L80 214 L52 226'] : ['M104 178 L114 216 L136 236', 'M96 178 L94 206 L70 196'];
      const feet = a ? [[126, 244, 0], [48, 230, 1]] : [[140, 242, 0], [66, 200, 1]];
      const arms = a ? ['M96 104 Q80 128 66 120', 'M108 104 Q124 128 140 110'] : ['M96 104 Q112 132 128 128', 'M108 104 Q92 128 74 136'];
      return `<g class="sv-rf ${a ? 'a' : 'b'}"><g transform="rotate(14 100 160)">
        ${limb(legs[1], SKD, 13)}${boot(...feet[1])}${limb(arms[0], SKD, 11)}
        <path d="M80 158 H120 L124 196 L100 200 L76 196 Z" fill="${WH}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
        ${limb(legs[0], SK, 13)}${boot(...feet[0])}
        <path d="M82 90 Q104 82 120 92 L122 166 Q100 172 80 166 Z" fill="${WH}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M108 92 L122 166 Q112 170 104 170 Z" fill="${WHD}" opacity=".7"/>
        ${limb(arms[1], SK, 11)}
        <g transform="translate(6 2)">${head(true, 6)}</g></g></g>`;
    };
    const V = 'viewBox="-10 0 220 300"';
    fxEl('sv-scene', {}, `<div class="sv-cam">
        <div class="sv-sky"></div>
        <div class="sv-stands"><i></i><i></i><i></i></div>
        <div class="sv-beam l"></div><div class="sv-beam r"></div><div class="sv-tower l"><b></b></div><div class="sv-tower r"><b></b></div><div class="sv-lamp l"></div><div class="sv-lamp r"></div>
        <div class="sv-pitch"></div>
        <div class="sv-rays"></div>
        <div class="sv-pyro l"><i></i><i></i><i></i></div><div class="sv-pyro r"><i></i><i></i><i></i></div>
        <div class="sv-hero">
          <div class="sv-runner"><svg ${V}>${runFrame(1)}${runFrame(0)}</svg></div>
          <div class="sv-air"><div class="sv-spin"><svg ${V} class="sv-f">${fig({ front: true, arms: 'tuck', legs: 'tuck', tilt: 0 })}</svg><svg ${V} class="sv-b">${fig({ front: false, arms: 'tuck', legs: 'tuck', tilt: 0 })}</svg></div></div>
          <div class="sv-pose"><div class="sv-glow"></div><svg ${V}>${fig({ front: true, arms: 'pose', legs: 'wide', tilt: -12 })}</svg></div>
          <div class="sv-dust l"></div><div class="sv-dust r"></div><div class="sv-ring"></div><div class="sv-ring two"></div>
        </div>
        <div class="sv-flash"></div>
        <div class="sv-title"><div class="sv-word">${[...'SIUUUUU'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div><small>✹ CÉLÉBRATION DIVINE ✹</small></div>
      </div>`, 5600);
    const sc = $('#reactions-layer .sv-scene:last-child');
    // flashs de téléphones dans les tribunes
    for (let i = 0; i < (innerWidth < 700 ? 40 : 90); i++) fxEl('sv-ph', { left: rnd(0, 100) + 'vw', top: rnd(20, 58) + 'vh', animationDelay: rnd(.4, 5) + 's', '--s': rnd(.5, 1.4) }, '', 5600);
    // confettis dorés à l'atterrissage
    for (let i = 0; i < (innerWidth < 700 ? 50 : 110); i++) fxEl('sv-conf', { left: rnd(0, 100) + 'vw', background: ['#ffe58a', '#fff', '#e6b325', '#fff6c9', '#ff5a5a'][i % 5], '--d': rnd(2, 3.6) + 's', '--x': rnd(-120, 120) + 'px', '--r': rnd(360, 1440) + 'deg', animationDelay: rnd(2.2, 3) + 's', width: rnd(6, 12) + 'px', height: rnd(10, 20) + 'px' }, '', 5600);
    for (let i = 0; i < 40; i++) fxEl('sv-spark', { left: `calc(50vw + ${rnd(-30, 30)}vmin)`, bottom: '16vh', '--x': rnd(-40, 40) + 'vmin', '--y': rnd(30, 70) + 'vh', animationDelay: rnd(2.2, 3.4) + 's' }, '', 5600);
    const S = (n, v, t) => setTimeout(() => { try { sfx(n, v); } catch (e) {} }, t);
    [0, 140, 280, 420].forEach(t => S('clunk', .9, 80 + t));
    for (let t = 650; t < 1700; t += 135) S('tick', .9, t);
    S('swell', 1, 1500);
    setTimeout(() => { try { const u = new SpeechSynthesisUtterance('Siiiiiuuuuuuu'); u.lang = 'pt-PT'; u.rate = .5; u.pitch = .5; u.volume = 1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }, 1550);
    S('boom', 1, 2350); S('roar', 1, 2350); S('bang', .8, 2350); S('legend', 1, 2650);
    setTimeout(() => { document.body.classList.add('sn-shake'); setTimeout(() => document.body.classList.remove('sn-shake'), 600); }, 2350);
  },

  // 🎆 bouquets de particules colorées
  fireworks(k) {
    const colors = ['#ff2e4d', '#ffc21a', '#00e5ff', '#7dff8a', '#ff4fa3', '#c13cff', '#fff'];
    const shots = Math.round(3 + 4 * k);
    for (let s = 0; s < shots; s++) setTimeout(() => {
      const x = rnd(12, 88), y = rnd(15, 55), c = colors[s % colors.length];
      fxEl('fw-flash', { left: x + 'vw', top: y + 'vh', '--c': c }, '', 700);
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2, d = rnd(60, 140) * k + 30;
        fxEl('fw-p', { left: x + 'vw', top: y + 'vh', '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d + 'px', '--c': i % 3 ? c : '#fff' }, '', 1300);
      }
    }, s * 260);
  },
  // 💥 onomatopées de BD
  comics(k) {
    const words = ['BAM !', 'POW !', 'WOW !', 'ZAP !', 'BOOM !', 'KAPOW !', 'YES !'];
    const n = Math.round(2 + 3 * k);
    for (let i = 0; i < n; i++) setTimeout(() => fxEl('cx-word', { left: rnd(8, 72) + 'vw', top: rnd(12, 62) + 'vh', '--r': rnd(-18, 18) + 'deg', '--bg': ['#ffe14d', '#ff4fa3', '#00e5ff', '#7dff8a'][i % 4] },
      `<span>${words[Math.floor(Math.random() * words.length)]}</span>`, 1500), i * 220);
  },
  // ⬆️ LEVEL UP façon jeu rétro
  levelup(k) {
    fxEl('lv-text', {}, 'LEVEL UP!', 2000);
    for (let i = 0; i < Math.round(10 + 10 * k); i++) fxEl('lv-star', { left: rnd(25, 75) + 'vw', '--d': rnd(0, .6) + 's', '--x': rnd(-80, 80) + 'px', color: ['#ffe14d', '#7dff8a', '#00e5ff'][i % 3] }, '★', 2000);
  },
  // 🕸️ toiles qui jaillissent des coins de l'écran
  webs(k) {
    const corners = [[0, 0], [100, 0], [0, 100], [100, 100]].slice(0, k > .8 ? 4 : 2);
    corners.forEach(([x, y], i) => setTimeout(() => {
      fxEl('web-shot', { left: x + 'vw', top: y + 'vh', '--rot': (x ? (y ? 225 : 135) : (y ? 315 : 45)) + 'deg' }, '', 1700);
      const tx = x ? rnd(55, 75) : rnd(25, 45), ty = y ? rnd(55, 75) : rnd(25, 45);
      fxEl('web-net', { left: tx + 'vw', top: ty + 'vh' }, `<svg viewBox="-50 -50 100 100">${[...Array(8)].map((_, j) => `<line x1="0" y1="0" x2="${48 * Math.cos(j * Math.PI / 4)}" y2="${48 * Math.sin(j * Math.PI / 4)}"/>`).join('')}${[12, 24, 36, 47].map(r => `<polygon points="${[...Array(8)].map((_, j) => `${r * Math.cos(j * Math.PI / 4)},${r * Math.sin(j * Math.PI / 4)}`).join(' ')}"/>`).join('')}</svg>`, 1900);
    }, i * 180));
  },
  // 🌌 spirale d'étoiles et de planètes
  galaxy(k) {
    fxEl('gx-core', {}, '', 2600);
    const items = ['✨', '🪐', '⭐', '🌟', '☄️', '💫', '🌌'];
    const n = Math.round(14 + 16 * k);
    for (let i = 0; i < n; i++) fxEl('gx-star', { '--a': (i * 137.5) + 'deg', '--r': (30 + i * 9 * k) + 'px', animationDelay: (i * 0.03) + 's', fontSize: rnd(1, 2) + 'rem' }, items[i % items.length], 2600);
  },
  // 🌟 explosion d'étoile : flash, ondes de choc, écran qui tremble
  supernova(k) {
    fxEl('sn-flash', {}, '', 900);
    [0, 160, 320].forEach((d, i) => setTimeout(() => fxEl('sn-ring', { '--c': ['#fff', '#ffc21a', '#ff4fa3'][i] }, '', 1400), d));
    for (let i = 0; i < Math.round(16 + 16 * k); i++) {
      const a = Math.random() * Math.PI * 2, dist = rnd(30, 55);
      fxEl('sn-shard', { '--dx': Math.cos(a) * dist + 'vmax', '--dy': Math.sin(a) * dist + 'vmax' }, ['🌟', '✨', '⭐', '💥'][i % 4], 1600);
    }
    document.body.classList.add('sn-shake'); setTimeout(() => document.body.classList.remove('sn-shake'), 600);
  },
  // 🐐👑 G.O.A.T. : la chèvre à lunettes débarque sur son podium, la couronne tombe pile sur sa tête
  goat(k) {
    const svg = `<svg viewBox="0 0 220 220" class="goat-svg">
      <defs><radialGradient id="gtF" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6dccb"/></radialGradient>
      <linearGradient id="gtH" x1="0" x2="1"><stop offset="0" stop-color="#6b4a2a"/><stop offset="1" stop-color="#b98a52"/></linearGradient>
      <linearGradient id="gtP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#f0b429"/><stop offset="1" stop-color="#9a6200"/></linearGradient></defs>
      <path d="M40 186h140l-10 24H50z" fill="url(#gtP)" stroke="#7a4a00" stroke-width="3"/><text x="110" y="205" text-anchor="middle" font-family="Bungee,sans-serif" font-size="14" fill="#7a4a00">N°1</text>
      <g class="goat-body">
        <rect x="62" y="140" width="12" height="44" rx="5" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/><rect x="82" y="142" width="12" height="42" rx="5" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/>
        <rect x="120" y="142" width="12" height="42" rx="5" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/><rect x="140" y="140" width="12" height="44" rx="5" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/>
        <path d="M60 180h16v6H60zM80 180h16v6H80zM118 180h16v6h-16zM138 180h16v6h-16z" fill="#3a2a1a"/>
        <path d="M46 118c-8-4-12-14-6-18" fill="none" stroke="#3a2a1a" stroke-width="5" stroke-linecap="round" class="goat-tail"/>
        <ellipse cx="102" cy="128" rx="58" ry="32" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/>
        <path d="M70 112q10-6 20 0M96 108q10-6 20 0" fill="none" stroke="#d8ccb8" stroke-width="3" stroke-linecap="round"/>
        <path d="M84 150h40" stroke="#ffc21a" stroke-width="7" stroke-linecap="round"/><circle cx="104" cy="158" r="9" fill="url(#gtP)" stroke="#7a4a00" stroke-width="2"/><text x="104" y="162" text-anchor="middle" font-size="10" font-weight="900" fill="#7a4a00">1</text>
        <g class="goat-head">
          <path d="M140 64c-4-26 10-40 26-42-12 8-16 22-14 38z" fill="url(#gtH)" stroke="#3a2a1a" stroke-width="3"/>
          <path d="M160 66c4-24 22-34 38-32-14 6-22 18-24 34z" fill="url(#gtH)" stroke="#3a2a1a" stroke-width="3"/>
          <path d="M128 78c-14-2-24 4-28 12 12 2 22 0 30-6z" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/>
          <path d="M184 80c14-4 24 0 30 8-12 4-22 4-30-2z" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/>
          <path d="M132 70c0-14 14-20 26-20s26 6 26 20c0 22-8 50-26 50s-26-28-26-50z" fill="url(#gtF)" stroke="#3a2a1a" stroke-width="3"/>
          <path d="M148 116l10 26 10-26z" fill="#e6dccb" stroke="#3a2a1a" stroke-width="3" stroke-linejoin="round" class="goat-beard"/>
          <ellipse cx="158" cy="104" rx="14" ry="10" fill="#ffd0c8" stroke="#3a2a1a" stroke-width="2.5"/>
          <ellipse cx="153" cy="103" rx="2.4" ry="3" fill="#3a2a1a"/><ellipse cx="163" cy="103" rx="2.4" ry="3" fill="#3a2a1a"/>
          <path d="M152 112q6 5 12 0" fill="none" stroke="#3a2a1a" stroke-width="2.5" stroke-linecap="round"/>
          <g class="goat-shades"><path d="M128 78h60v4l-4 12c-2 6-20 6-22 0l-2-6h-4l-2 6c-2 6-20 6-22 0l-4-12z" fill="#111" stroke="#000" stroke-width="2"/>
          <path d="M136 82l6 0-4 8zM166 82l6 0-4 8z" fill="#fff" opacity=".7"/></g>
        </g>
      </g></svg>`;
    const crown = `<svg viewBox="0 0 100 70"><defs><linearGradient id="gtC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset=".45" stop-color="#ffc21a"/><stop offset="1" stop-color="#a86a00"/></linearGradient></defs>
      <path d="M8 62L4 18l22 20L50 4l24 34 22-20-4 44z" fill="url(#gtC)" stroke="#7a4a00" stroke-width="3" stroke-linejoin="round"/>
      <rect x="8" y="54" width="84" height="10" rx="3" fill="#ffd84d" stroke="#7a4a00" stroke-width="2.5"/>
      <circle cx="50" cy="40" r="7" fill="#ff2e6e" stroke="#7a0030" stroke-width="2"/><circle cx="26" cy="46" r="4.5" fill="#2fd3ff" stroke="#0a5a7a" stroke-width="1.5"/><circle cx="74" cy="46" r="4.5" fill="#3dff8e" stroke="#0a6a30" stroke-width="1.5"/>
      <circle cx="4" cy="18" r="4" fill="#fff6c0"/><circle cx="50" cy="4" r="4.5" fill="#fff6c0"/><circle cx="96" cy="18" r="4" fill="#fff6c0"/></svg>`;
    fxEl('goat-rays', {}, '', 3400);
    fxEl('goat-stage', {}, `<div class="goat-hop">${svg}<div class="goat-crown">${crown}</div><div class="goat-flash"></div></div>`, 3400);
    fxEl('goat-title', {}, [...'G.O.A.T.'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('') + '<small>GREATEST OF ALL TIME</small>', 3400);
    for (let i = 0; i < Math.round((innerWidth < 700 ? 14 : 26) + (innerWidth < 700 ? 10 : 24) * k); i++)
      fxEl('goat-glit', { left: rnd(0, 100) + 'vw', '--d': rnd(.9, 2) + 's', '--x': rnd(-60, 60) + 'px', fontSize: rnd(.9, 2.1) + 'rem', animationDelay: rnd(.8, 1.8) + 's' }, ['✦', '👑', '✨', '🐐', '✦'][i % 5], 3400);
    setTimeout(() => { try { sfx('legend'); } catch (e) {} if (!$('#shop').classList.contains('hidden')) return; document.body.classList.add('sn-shake'); setTimeout(() => document.body.classList.remove('sn-shake'), 500); }, 1250);
  },
};


// 🦟 Moustique : bzzzz aigu continu
function mosquito(ms) {
  if (!actx) return;
  try {
    const o = actx.createOscillator(), g = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 1900;
    lfo.frequency.value = 9; lg.gain.value = 140; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.value = Math.max(0.15, baseVolume) * 0.07;
    o.connect(g); g.connect(actx.destination);
    o.start(); lfo.start();
    o.stop(actx.currentTime + ms / 1000); lfo.stop(actx.currentTime + ms / 1000);
    mosquitoNode = { stop: () => { try { o.stop(); lfo.stop(); } catch {} } };
  } catch {}
}

// ✍️ La Plume Magique : la réponse s'écrit toute seule
async function autoType(answers) {
  const input = $('#guess');
  for (const ans of answers) {
    if (!state || state.phase !== 'playing') return;
    input.disabled = false; input.value = ''; input.classList.add('magic');
    for (const ch of ans) {
      if (!state || state.phase !== 'playing') return;
      input.value += ch;
      await new Promise(r => setTimeout(r, 70 + Math.random() * 60));
    }
    await new Promise(r => setTimeout(r, 300));
    $('#guess-form').requestSubmit();
    await new Promise(r => setTimeout(r, 700));
  }
  input.classList.remove('magic');
}


// ═════════════════ 🎁 CADEAU (toutes les 10 min) & 💰 COFFRE (toutes les heures) ═════════════════
// Disponibles pendant l'attente (accueil, salon, fin de partie). Le minuteur est gardé dans la sauvegarde.
const REWARD = { gift: SHOP.gift, chest: SHOP.chest };
function rewardLeft(kind) { return Math.max(0, (save[kind + 'At'] || 0) - Date.now()); }
const fmtLeft = (ms) => { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
function rewardsVisible() {
  const home = $('#home').classList.contains('active');
  const waiting = $('#room').classList.contains('active') && state && ['lobby', 'end'].includes(state.phase);
  return home || waiting;
}
function tickRewards() {
  $('#rewards').classList.toggle('hidden', !rewardsVisible());
  for (const k of ['gift', 'chest']) {
    const left = rewardLeft(k), btn = $('#rw-' + k);
    btn.classList.toggle('ready', !left);
    $(`#rw-${k}-t`).textContent = left ? fmtLeft(left) : 'À ouvrir !';
  }
}
// ── dessins du cadeau et du coffre (SVG faits main, un jeu d'ids par exemplaire) ──
const ART = (() => {
  let n = 0;
  // ── 🎁 cadeau vu de 3/4 : papier bleu nuit étoilé, ruban doré, gros nœud brillant ──
  const giftBody = (u) => `<svg viewBox="0 0 220 220" class="art"><defs>
    <linearGradient id="gf${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3cff"/><stop offset="1" stop-color="#2a118f"/></linearGradient>
    <linearGradient id="gs${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a118f"/><stop offset="1" stop-color="#170960"/></linearGradient>
    <linearGradient id="gr${u}" x1="0" x2="1"><stop offset="0" stop-color="#b37400"/><stop offset=".35" stop-color="#fff2a8"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#9a6200"/></linearGradient>
    <pattern id="gt${u}" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M6 3l1.3 2.8 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#ffe27a" opacity=".75"/><circle cx="17" cy="15" r="1.6" fill="#fff" opacity=".55"/></pattern></defs>
    <ellipse cx="112" cy="204" rx="92" ry="11" fill="#000" opacity=".4"/>
    <path d="M30 104H152V202H30Z" fill="url(#gf${u})"/><path d="M30 104H152V202H30Z" fill="url(#gt${u})"/>
    <path d="M152 104L192 84V182L152 202Z" fill="url(#gs${u})"/><path d="M152 104L192 84V182L152 202Z" fill="url(#gt${u})" opacity=".5"/>
    <rect x="82" y="104" width="18" height="98" fill="url(#gr${u})"/><rect x="86" y="104" width="3" height="98" fill="#fff" opacity=".6"/>
    <path d="M168 96L178 91V189L168 194Z" fill="#c48a00"/><path d="M170 95L172 94V192L170 193Z" fill="#fff3b0" opacity=".6"/>
    <path d="M34 110V196" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 104H152V202H30ZM152 104L192 84V182L152 202" fill="none" stroke="#0d0440" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  const giftLid = (u) => `<svg viewBox="0 0 220 220" class="art"><defs>
    <linearGradient id="lf${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d50ff"/><stop offset="1" stop-color="#3a1fc0"/></linearGradient>
    <linearGradient id="lt${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9d8bff"/><stop offset="1" stop-color="#5b3cff"/></linearGradient>
    <linearGradient id="lr${u}" x1="0" x2="1"><stop offset="0" stop-color="#b37400"/><stop offset=".35" stop-color="#fff2a8"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#9a6200"/></linearGradient>
    <radialGradient id="lk${u}" cx=".35" cy=".3"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffc21a"/><stop offset="1" stop-color="#8a5200"/></radialGradient>
    <pattern id="lp${u}" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M6 3l1.3 2.8 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#ffe27a" opacity=".75"/></pattern></defs>
    <path d="M22 98L64 76H200L158 98Z" fill="url(#lt${u})"/><path d="M22 98L64 76H200L158 98Z" fill="url(#lp${u})" opacity=".6"/>
    <path d="M22 98H158V122H22Z" fill="url(#lf${u})"/><path d="M22 98H158V122H22Z" fill="url(#lp${u})"/>
    <path d="M158 98L200 76V100L158 122Z" fill="#2a118f"/>
    <path d="M34 92L170 92L182 86L46 86Z" fill="url(#lr${u})"/>
    <path d="M82 98H100L142 76H124Z" fill="url(#lr${u})"/>
    <rect x="82" y="98" width="18" height="24" fill="url(#lr${u})"/><rect x="86" y="98" width="3" height="24" fill="#fff" opacity=".6"/>
    <path d="M176 110L186 105V81L176 86Z" fill="#c48a00"/>
    <path d="M22 98L64 76H200L158 98ZM22 98H158V122H22ZM158 122L200 100V76" fill="none" stroke="#0d0440" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M30 102H150" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
    <g class="gf-bowg">
      <path d="M112 84C120 108 132 120 140 128L132 124L130 134C120 120 112 104 108 88Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="1.5"/>
      <path d="M108 84C96 106 86 118 76 124L86 122L86 132C98 120 106 104 112 88Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="1.5"/>
      <path d="M110 82C88 40 42 46 56 74C64 92 92 92 110 82Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="2"/>
      <path d="M106 80C90 54 64 56 68 72C72 84 92 84 106 80Z" fill="#a86a00" opacity=".55"/>
      <path d="M112 82C134 40 180 46 166 74C158 92 130 92 112 82Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="2"/>
      <path d="M116 80C132 54 158 56 154 72C150 84 130 84 116 80Z" fill="#a86a00" opacity=".55"/>
      <path d="M62 62C68 52 82 52 90 60" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="111" cy="82" rx="14" ry="12" fill="url(#lk${u})" stroke="#7a4a00" stroke-width="2"/>
      <ellipse cx="106" cy="77" rx="4.5" ry="3" fill="#fff" opacity=".85"/>
    </g></svg>`;
  // ── 💰 coffre de pirate vu de 3/4 : bois, ferrures dorées, cadenas, trésor ──
  const chestBody = (u) => `<svg viewBox="0 0 240 220" class="art"><defs>
    <linearGradient id="cw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8692e"/><stop offset="1" stop-color="#6a3010"/></linearGradient>
    <linearGradient id="cs${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a3010"/><stop offset="1" stop-color="#3e1a06"/></linearGradient>
    <linearGradient id="cg${u}" x1="0" x2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#fff0a0"/><stop offset=".55" stop-color="#f0b429"/><stop offset="1" stop-color="#7a4a00"/></linearGradient>
    <linearGradient id="ci${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140600"/><stop offset="1" stop-color="#3a1806"/></linearGradient>
    <filter id="cn${u}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.35" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .08  0 0 0 0 .02  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
    <ellipse cx="120" cy="206" rx="100" ry="11" fill="#000" opacity=".45"/>
    <path d="M26 120L64 98H214L176 120Z" fill="url(#ci${u})"/>
    <path d="M26 120H176V202H26Z" fill="url(#cw${u})"/><path d="M26 120H176V202H26Z" fill="#000" filter="url(#cn${u})"/>
    <path d="M176 120L214 98V180L176 202Z" fill="url(#cs${u})"/><path d="M176 120L214 98V180L176 202Z" fill="#000" filter="url(#cn${u})" opacity=".7"/>
    <path d="M26 147H176M26 174H176M176 147L214 125M176 174L214 152" stroke="#2a0f02" stroke-width="2.5" opacity=".7"/>
    <path d="M26 149H176M26 176H176" stroke="#fff" stroke-width="1" opacity=".12"/>
    <rect x="44" y="120" width="16" height="82" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    <rect x="142" y="120" width="16" height="82" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    <path d="M190 106L200 100V182L190 188Z" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    ${[132, 160, 188].map(y => `<circle cx="52" cy="${y}" r="3" fill="#fff4c2" stroke="#5a3a00"/><circle cx="150" cy="${y}" r="3" fill="#fff4c2" stroke="#5a3a00"/>`).join('')}
    <path d="M26 194H176V202H26ZM176 194L214 172V180L176 202Z" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M26 120h14v8h-6v12h-8zM26 202h14v-8h-6v-12h-8zM176 120h-14v8h6v12h8zM176 202h-14v-8h6v-12h8z" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M26 120H176V202H26ZM176 120L214 98V180L176 202" fill="none" stroke="#1e0a00" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  const chestLid = (u) => `<svg viewBox="0 0 240 220" class="art"><defs>
    <linearGradient id="kw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0843e"/><stop offset="1" stop-color="#8a4418"/></linearGradient>
    <linearGradient id="kt${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e09a55"/><stop offset="1" stop-color="#9a5020"/></linearGradient>
    <linearGradient id="kg${u}" x1="0" x2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#fff0a0"/><stop offset=".55" stop-color="#f0b429"/><stop offset="1" stop-color="#7a4a00"/></linearGradient>
    <filter id="kn${u}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.3" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .08  0 0 0 0 .02  0 0 0 .5 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
    <path d="M24 100Q24 64 101 60Q178 64 178 100L216 78Q216 42 139 38Q62 42 62 78Z" fill="url(#kt${u})"/>
    <path d="M178 100V122L216 100V78Z" fill="#5a2608"/>
    <path d="M24 122V100Q24 64 101 60Q178 64 178 100V122Z" fill="url(#kw${u})"/><path d="M24 122V100Q24 64 101 60Q178 64 178 100V122Z" fill="#000" filter="url(#kn${u})"/>
    <path d="M26 100Q28 70 101 66Q174 70 176 100" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
    <path d="M42 122V80Q46 70 56 68V122Z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    <path d="M144 122V68Q156 70 160 80V122Z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    <path d="M44 74Q50 66 58 66L98 44Q88 44 82 52Z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M144 66Q154 66 160 74L198 52Q192 44 182 44Z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M22 114H180V124H22Z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.2"/><path d="M180 114L218 92V102L180 124Z" fill="#b07a10" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M24 100Q24 64 101 60Q178 64 178 100L216 78Q216 42 139 38Q62 42 62 78ZM24 122V100M178 100V122" fill="none" stroke="#1e0a00" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M89 112h24v14h-24z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.5"/></svg>`;
  const chestLidOpen = (u) => `<svg viewBox="0 0 240 220" class="art"><defs>
    <linearGradient id="ko${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2608"/><stop offset="1" stop-color="#2a0e02"/></linearGradient>
    <linearGradient id="kq${u}" x1="0" x2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#fff0a0"/><stop offset=".55" stop-color="#f0b429"/><stop offset="1" stop-color="#7a4a00"/></linearGradient></defs>
    <path d="M62 100V46Q62 8 139 4Q216 8 216 46V100Z" fill="url(#ko${u})" stroke="#1e0a00" stroke-width="2.5"/>
    <path d="M70 100V48Q72 16 139 12Q206 16 208 48V100" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5"/>
    <path d="M62 92H216V100H62Z" fill="url(#kq${u})" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M80 100V30M198 100V30" stroke="url(#kq${u})" stroke-width="10"/></svg>`;
  const treasure = (u) => `<svg viewBox="0 0 240 220" class="art"><defs>
    <radialGradient id="tc${u}" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6c4"/><stop offset=".55" stop-color="#ffc21a"/><stop offset="1" stop-color="#a86a00"/></radialGradient></defs>
    <path d="M30 120Q44 82 84 86Q110 60 140 80Q178 70 210 100L176 120Z" fill="url(#tc${u})" stroke="#8a5a00" stroke-width="2"/>
    ${[[56, 102], [78, 92], [100, 80], [124, 74], [148, 82], [172, 90], [190, 98], [66, 112], [112, 96], [150, 104], [134, 110], [92, 108]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="url(#tc${u})" stroke="#8a5a00" stroke-width="1.5"/>`).join('')}
    <path d="M84 74l8-11 8 11-8 9z" fill="#2fd3ff" stroke="#0a5a7a" stroke-width="1.5"/><path d="M160 70l9-9 9 9-9 9z" fill="#ff2e6e" stroke="#7a0030" stroke-width="1.5"/>
    <path d="M122 60l7-7 7 7-7 10z" fill="#3dff8e" stroke="#0a6a30" stroke-width="1.5"/>
    <path d="M108 80l6-13 6 8 6-11 6 11 6-8 6 13z" fill="url(#tc${u})" stroke="#8a5a00" stroke-width="1.5"/>
    <circle cx="96" cy="66" r="2" fill="#fff"/><circle cx="170" cy="62" r="2" fill="#fff"/></svg>`;
  const lock = (u) => `<svg viewBox="0 0 240 220" class="art"><defs>
    <linearGradient id="lg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#f0b429"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>
    <path d="M91 124V114Q91 102 101 102Q111 102 111 114V124" fill="none" stroke="#c9c9c9" stroke-width="5"/>
    <rect x="84" y="122" width="34" height="30" rx="6" fill="url(#lg${u})" stroke="#5a3a00" stroke-width="2"/>
    <circle cx="101" cy="134" r="4.5" fill="#2a1600"/><path d="M98.5 136h5l1.5 9h-8z" fill="#2a1600"/>
    <circle cx="90" cy="127" r="2" fill="#fff" opacity=".8"/></svg>`;
  return {
    gift: () => { const u = 'g' + n++; return `<div class="gf-halo"></div><div class="gf-shine"></div><div class="gf-body">${giftBody(u)}</div><div class="gf-lid">${giftLid(u)}</div>`; },
    chest: () => { const u = 'c' + n++; return `<div class="c-glow"></div><div class="c-lido">${chestLidOpen(u)}</div><div class="c-body">${chestBody(u)}</div><div class="c-gold">${treasure(u)}</div><div class="c-lid">${chestLid(u)}</div><div class="c-lock">${lock(u)}</div>`; },
  };
})();
// ── version CARTOON (v27) : gros contours, couleurs vives, cadeau avec une bouille ──
const TOON = (() => {
  const O = '#2b1640';
  const gift = () => `<div class="toon tg"><div class="tg-rays"></div><svg viewBox="0 0 240 250" class="tg-svg">
      <defs><pattern id="tgDots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="4" fill="#ffe14d"/><circle cx="19" cy="19" r="3" fill="#fff" opacity=".7"/></pattern></defs>
      <ellipse cx="120" cy="236" rx="86" ry="10" fill="#000" opacity=".35" class="tg-shadow"/>
      <g class="tg-body">
        <rect x="38" y="112" width="164" height="114" rx="16" fill="#ff5fa2" stroke="${O}" stroke-width="7"/>
        <rect x="38" y="112" width="164" height="114" rx="16" fill="url(#tgDots)"/>
        <path d="M48 124 v86" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".45"/>
        <rect x="106" y="112" width="28" height="114" fill="#3fe0c5" stroke="${O}" stroke-width="6"/>
        <rect x="112" y="116" width="6" height="106" fill="#fff" opacity=".5"/>
        <g class="tg-face">
          <g class="tg-eyes"><ellipse cx="78" cy="160" rx="9" ry="12" fill="${O}"/><ellipse cx="162" cy="160" rx="9" ry="12" fill="${O}"/><circle cx="81" cy="155" r="3.5" fill="#fff"/><circle cx="165" cy="155" r="3.5" fill="#fff"/></g>
          <g class="tg-squint"><path d="M68 154 l14 7 -14 7 M172 154 l-14 7 14 7" fill="none" stroke="${O}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
          <g class="tg-happy"><path d="M68 164 q10 -14 20 0 M152 164 q10 -14 20 0" fill="none" stroke="${O}" stroke-width="6" stroke-linecap="round"/></g>
          <ellipse cx="66" cy="182" rx="11" ry="6" fill="#ff2e7a" opacity=".55"/><ellipse cx="174" cy="182" rx="11" ry="6" fill="#ff2e7a" opacity=".55"/>
          <path d="M84 184 q8 10 16 0" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round" class="tg-mouth"/>
          <path d="M140 184 q8 10 16 0" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round" class="tg-mouth"/>
        </g>
      </g>
      <g class="tg-lid">
        <rect x="28" y="84" width="184" height="40" rx="12" fill="#ff7ab8" stroke="${O}" stroke-width="7"/>
        <path d="M40 94 h160" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/>
        <rect x="104" y="84" width="32" height="40" fill="#3fe0c5" stroke="${O}" stroke-width="6"/>
        <g class="tg-bow">
          <path d="M120 82 C96 40 50 46 62 74 C70 92 100 90 120 82Z" fill="#3fe0c5" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
          <path d="M120 82 C144 40 190 46 178 74 C170 92 140 90 120 82Z" fill="#3fe0c5" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
          <path d="M76 66 q8 -12 22 -6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
          <path d="M108 86 l-12 26 10 -4 6 9 4 -30Z M132 86 l12 26 -10 -4 -6 9 -4 -30Z" fill="#2cc4aa" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
          <circle cx="120" cy="82" r="14" fill="#7dffe6" stroke="${O}" stroke-width="6"/><circle cx="115" cy="77" r="4" fill="#fff"/>
        </g>
      </g>
      <g class="tg-pop"><path d="M120 40 l12 26 28 3 -21 19 6 28 -25 -14 -25 14 6 -28 -21 -19 28 -3Z" fill="#ffe14d" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><circle cx="110" cy="72" r="4" fill="${O}"/><circle cx="130" cy="72" r="4" fill="${O}"/><path d="M112 84 q8 8 16 0" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/></g>
    </svg></div>`;
  const chest = () => `<div class="toon tc"><div class="tc-rays"></div><svg viewBox="0 0 260 250" class="tc-svg">
      <defs><linearGradient id="tcIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset="1" stop-color="#ffb300"/></linearGradient></defs>
      <ellipse cx="130" cy="236" rx="100" ry="11" fill="#000" opacity=".35"/>
      <g class="tc-inside"><path d="M44 128 Q130 96 216 128 L216 142 L44 142Z" fill="#4a1a08" stroke="${O}" stroke-width="6"/>
        <g class="tc-loot"><path d="M54 132 Q80 92 110 104 Q130 78 156 100 Q186 90 206 130Z" fill="url(#tcIn)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
          ${[[74, 118], [96, 108], [124, 98], [150, 106], [176, 112], [192, 124], [110, 120], [140, 118]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#ffd21f" stroke="${O}" stroke-width="3.5"/>`).join('')}
          <path d="M100 90 l10 -12 10 12 -10 12Z" fill="#3fe0ff" stroke="${O}" stroke-width="4"/><path d="M152 86 l10 -10 10 10 -10 12Z" fill="#ff4d8a" stroke="${O}" stroke-width="4"/><path d="M128 80 l7 -14 7 14 -7 8Z" fill="#7dff8a" stroke="${O}" stroke-width="4"/></g></g>
      <g class="tc-body">
        <rect x="34" y="128" width="192" height="98" rx="14" fill="#ff8a3d" stroke="${O}" stroke-width="7"/>
        <path d="M40 160 H220 M40 192 H220" stroke="#c4541a" stroke-width="5"/>
        <path d="M46 140 v76" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".4"/>
        <rect x="58" y="128" width="22" height="98" fill="#ffd21f" stroke="${O}" stroke-width="6"/><rect x="180" y="128" width="22" height="98" fill="#ffd21f" stroke="${O}" stroke-width="6"/>
        <circle cx="69" cy="146" r="4" fill="${O}"/><circle cx="69" cy="208" r="4" fill="${O}"/><circle cx="191" cy="146" r="4" fill="${O}"/><circle cx="191" cy="208" r="4" fill="${O}"/>
        <g class="tc-lock"><path d="M130 196 C100 176 104 150 120 150 C126 150 130 156 130 160 C130 156 134 150 140 150 C156 150 160 176 130 196Z" fill="#ffd21f" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><circle cx="130" cy="166" r="5" fill="${O}"/><path d="M127 168 h6 l2 12 h-10Z" fill="${O}"/><circle cx="120" cy="160" r="3" fill="#fff"/></g>
      </g>
      <g class="tc-lid">
        <path d="M30 132 Q30 64 130 60 Q230 64 230 132Z" fill="#ff9d4f" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>
        <path d="M44 120 Q48 80 120 72" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".45"/>
        <path d="M56 132 V86 Q62 76 78 72 V132Z M182 72 Q198 76 204 86 V132 H182Z" fill="#ffd21f" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
        <rect x="26" y="122" width="208" height="16" rx="6" fill="#ffd21f" stroke="${O}" stroke-width="6"/>
        <path d="M118 138 h24 v-14 h-24Z" fill="#ffd21f" stroke="${O}" stroke-width="5"/>
        <circle cx="150" cy="86" r="5" fill="#fff" class="tc-twinkle"/>
      </g>
    </svg></div>`;
  return { gift, chest };
})();
ART.gift = TOON.gift; ART.chest = TOON.chest;
$('#op-box .gift3d').innerHTML = ART.gift();
$('#op-box .chest3d').innerHTML = ART.chest();
$('#rw-gift .rw-ico').innerHTML = `<span class="mini-art gift3d">${ART.gift()}</span>`;
$('#rw-chest .rw-ico').innerHTML = `<span class="mini-art chest3d">${ART.chest()}</span>`;
setInterval(tickRewards, 1000); tickRewards();

// ───────────── 🎡 Roue de la chance ─────────────
window.WHEEL = (() => {
  const W = SHOP.wheel, N = W.slices.length, A = 360 / N;
  const KIND_LABEL = { icons: 'Icône', colors: 'Couleur de pseudo', frames: 'Cadre', nameFx: 'Effet de pseudo', titles: 'Titre', winFx: 'Célébration', pawns: 'Pion', boards: 'Plateau', pcfx: 'Animation chevaux', cardbacks: 'Dos de cartes', chessb: "Plateau d'échecs", chesspc: "Pièces d'échecs" };
  const SL = {
    c60: { t: '60', e: '🪙', c: '#ffb12b', c2: '#b35a00', c3: '#ffe39a', pat: 'coins' }, c120: { t: '120', e: '💰', c: '#ffd84d', c2: '#b37800', c3: '#fff3b8', pat: 'coins' },
    c250: { t: '250', e: '💰', c: '#ff8a1f', c2: '#a83f00', c3: '#ffd2a0', pat: 'coins' }, c500: { t: '500', e: '💎', c: '#ff5aa0', c2: '#8a0a48', c3: '#ffd0e6', pat: 'gems' },
    common: { t: 'COMMUN', e: '🎁', c: '#8fb0cf', c2: '#3f5873', c3: '#e2eefa', pat: 'stripes' }, rare: { t: 'RARE', e: '🔷', c: '#3b95ff', c2: '#0b3c96', c3: '#bfe0ff', pat: 'stripes' },
    epic: { t: 'ÉPIQUE', e: '🔮', c: '#ab64ff', c2: '#4a0d9c', c3: '#ead6ff', pat: 'stars' }, legendary: { t: 'LÉGENDE', e: '👑', c: '#ffd000', c2: '#c4005a', c3: '#fff7c2', pat: 'rainbow' },
  };
  const FX = { rare: 1, epic: 1, legendary: 1, c500: 1, c250: 1 };
  let rot = 0, spinning = false;
  function wheelSVG() {
    const R = 150, cx = 160, cy = 160;
    const pt = (a, r) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
    const wedge = (a0, a1, r = R) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}Z`; };
    const defs = Object.entries(SL).map(([id, s]) => `<radialGradient id="wg-${id}" cx="160" cy="160" r="150" gradientUnits="userSpaceOnUse"><stop offset=".12" stop-color="${s.c3}"/><stop offset=".55" stop-color="${s.c}"/><stop offset="1" stop-color="${s.c2}"/></radialGradient>`).join('')
      + `<pattern id="wp-coins" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="3.2" fill="#fff" opacity=".22"/></pattern>
         <pattern id="wp-gems" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="5" y="5" width="6" height="6" fill="#fff" opacity=".22"/></pattern>
         <pattern id="wp-stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="5" height="12" fill="#fff" opacity=".13"/></pattern>
         <pattern id="wp-stars" width="22" height="22" patternUnits="userSpaceOnUse"><text x="11" y="13" font-size="9" text-anchor="middle" fill="#fff" opacity=".35">✦</text></pattern>
         <linearGradient id="wp-rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff004c" stop-opacity=".55"/><stop offset=".25" stop-color="#ffe600" stop-opacity=".45"/><stop offset=".5" stop-color="#3dff6e" stop-opacity=".45"/><stop offset=".75" stop-color="#00e5ff" stop-opacity=".45"/><stop offset="1" stop-color="#c13cff" stop-opacity=".55"/></linearGradient>`;
    const slices = W.slices.map((id, i) => {
      const a0 = i * A, a1 = a0 + A, s = SL[id], mid = a0 + A / 2, d = wedge(a0, a1);
      const [tx, ty] = pt(mid, R * (/^c\d/.test(id) ? .6 : .47)), [ex, ey] = pt(mid, R * .85);
      const sparks = [.38, .55, .72, .9].map((r, j) => { const [sx, sy] = pt(a0 + A * (.2 + ((j * 37) % 60) / 100), R * r); return `<text x="${sx}" y="${sy}" class="wh-spark s${j} f-${id}" text-anchor="middle" dominant-baseline="central" style="animation-delay:${(i * .23 + j * .45) % 2}s">✦</text>`; }).join('');
      return `<g class="wh-sl sl-${id}" style="--i:${i}">
        <path d="${d}" fill="url(#wg-${id})"/>
        <path d="${d}" fill="url(#wp-${s.pat})" class="wh-pat"/>
        <path d="${d}" class="wh-flash f-${id}" style="animation-delay:${(i * .17) % 1.6}s"/>
        <path d="${wedge(a0 + 1.2, a1 - 1.2, R - 3)}" class="wh-edge f-${id}"/>
        ${sparks}
        <g class="wh-badge" style="transform-origin:${ex}px ${ey}px">
          <circle cx="${ex}" cy="${ey}" r="15" class="wh-disc f-${id}"/>
          <text x="${ex}" y="${ey + 1}" font-size="18" text-anchor="middle" dominant-baseline="central" transform="rotate(${mid} ${ex} ${ey})" class="wh-em f-${id}">${s.e}</text>
        </g>
        <text x="${tx}" y="${ty}" class="wl ${/^c\d/.test(id) ? 'coin' : 'it'} f-${id}" text-anchor="middle" dominant-baseline="central" transform="rotate(${mid + 90} ${tx} ${ty})">${s.t}</text>
      </g>`;
    }).join('');
    const seps = W.slices.map((_, i) => { const [x, y] = pt(i * A, R), [sx, sy] = pt(i * A, R - 6); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="url(#wGold2)" stroke-width="3"/><circle cx="${sx}" cy="${sy}" r="3.6" fill="#fff2b0" stroke="#7a4a00" stroke-width="1.2" class="wh-rivet"/>`; }).join('');
    const bulbs = Array.from({ length: 24 }, (_, i) => { const [x, y] = pt(i * 15, R + 13); return `<circle cx="${x}" cy="${y}" r="4.5" class="bulb b${i % 3}"/>`; }).join('');
    const VB = 'viewBox="-18 -18 356 356"';
    return `<svg ${VB} class="wh-svg wh-base"><defs><linearGradient id="wGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#e2a70f"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>
      <circle cx="160" cy="160" r="168" fill="#3a0d1f" stroke="url(#wGold)" stroke-width="10"/><circle cx="160" cy="160" r="160" fill="none" stroke="#ffd84d55" stroke-width="2" stroke-dasharray="3 7" class="wh-ring"/>${bulbs}</svg>
      <svg ${VB} class="wh-svg wh-rot" id="wh-rot"><defs>${defs}
      <linearGradient id="wGold2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#e2a70f"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>${slices}${seps}
      <circle cx="160" cy="160" r="150" fill="none" stroke="#2a1600" stroke-width="3"/></svg>
      <div class="wh-glint"></div>
      <svg ${VB} class="wh-svg"><circle cx="160" cy="160" r="34" fill="url(#wGold)" stroke="#5a3a00" stroke-width="3" class="wh-hubring"/>
      <circle cx="160" cy="160" r="26" fill="#3a0d1f"/>
      <text x="160" y="161" text-anchor="middle" dominant-baseline="central" class="wh-hub">PZ</text></svg>`;
  }
  function build() {
    let el = $('#wheel');
    if (el) return el;
    el = document.createElement('div'); el.id = 'wheel'; el.className = 'wheel hidden';
    el.innerHTML = `<div class="wh-rays"></div><div class="wh-box">
      <button class="wh-x" id="wh-x">✕</button>
      <h2 class="wh-title">🎡 ROUE DE LA CHANCE</h2>
      <p class="wh-sub">Tente ta chance : pièces ou objet surprise de la boutique !</p>
      <div class="wh-wheel"><div class="wh-pointer" id="wh-pointer"></div>${wheelSVG()}</div>
      <div class="wh-result" id="wh-result"></div>
      <button class="btn btn-primary wh-spin" id="wh-spin"></button>
      <div class="wh-odds">${W.odds.map(o => `<span class="o-${o.id}">${o.coins ? o.coins + ' 🪙' : SL[o.id].e + ' ' + { common: 'Objet commun', rare: 'Objet rare', epic: 'Objet épique', legendary: 'Objet légendaire' }[o.id]} <b>${String(o.p).replace('.', ',')} %</b></span>`).join('')}</div>
    </div>`;
    document.body.appendChild(el);
    $('#wh-x').onclick = close;
    el.onclick = (e) => { if (e.target === el) close(); };
    $('#wh-spin').onclick = spin;
    return el;
  }
  function refresh() {
    const b = $('#wh-spin'); if (!b) return;
    b.disabled = spinning || save.coins < W.cost;
    b.innerHTML = spinning ? '🎡 Ça tourne…' : save.coins < W.cost ? `Il te manque ${W.cost - save.coins} 🪙` : `Tourner la roue · 🪙 ${W.cost}`;
  }
  function open() { build().classList.remove('hidden'); $('#wh-result').innerHTML = ''; refresh(); unlockAudio?.(); sfx('pop'); }
  function close() { if (spinning) return; $('#wheel')?.classList.add('hidden'); }
  function draw() {
    let r = Math.random() * W.odds.reduce((a, o) => a + o.p, 0);
    for (const o of W.odds) { r -= o.p; if (r < 0) return o; }
    return W.odds[0];
  }
  function spin() {
    if (spinning || save.coins < W.cost) return;
    const o = draw();
    // on applique le gain tout de suite (pas de triche en rechargeant la page)
    save.coins -= W.cost;
    let prize;
    if (o.coins) { prize = { coins: o.coins }; save.coins += o.coins; }
    else {
      const pool = W.kinds.flatMap(k => SHOP[k].filter(it => it.price && SHOP.rarity(it.price) === o.rar && !owns(k, it.id)).map(it => ({ k, it })));
      if (pool.length) { prize = pool[Math.floor(Math.random() * pool.length)]; save.owned.push(prize.k + ':' + prize.it.id); }
      else { prize = { coins: W.fallback[o.rar], all: true }; save.coins += prize.coins; }
    }
    persist(); renderProfile();
    spinning = true; refresh(); $('#wh-result').innerHTML = '';
    const idx = W.slices.map((s, i) => s === o.id ? i : -1).filter(i => i >= 0);
    const i = idx[Math.floor(Math.random() * idx.length)];
    const target = -(i * A + A / 2) + (Math.random() - .5) * A * .7;
    const cur = ((rot % 360) + 360) % 360;
    rot += 360 * 6 + ((((target - cur) % 360) + 360) % 360);
    const g = $('#wh-rot');
    g.style.transition = 'transform 5.4s cubic-bezier(.12,.72,.14,1)';
    g.style.transform = `rotate(${rot}deg)`;
    $('#wheel').classList.add('spinning');
    // tic-tac du pointeur à chaque case
    let lastSlice = null; const t0 = performance.now();
    const tick = () => {
      const m = getComputedStyle(g).transform;
      if (m && m !== 'none') {
        const [a, b] = m.slice(7, -1).split(',').map(Number);
        const ang = ((Math.atan2(b, a) * 180 / Math.PI) + 360) % 360, sl = Math.floor(ang / A);
        if (sl !== lastSlice) { lastSlice = sl; sfx('tick', .7); const p = $('#wh-pointer'); p.classList.remove('flick'); void p.offsetWidth; p.classList.add('flick'); }
      }
      if (performance.now() - t0 < 5400) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => reveal(o, prize), 5500);
  }
  function reveal(o, prize) {
    spinning = false; $('#wheel').classList.remove('spinning');
    const res = $('#wh-result');
    if (prize.coins) {
      res.innerHTML = `<div class="wh-win coins ${o.id === 'c500' || o.id === 'c250' ? 'big' : ''}"><b>+${prize.coins} 🪙</b><small>${prize.all ? `Tu as déjà tous les objets ${SL[o.id].t.toLowerCase()}s : pièces de consolation !` : prize.coins >= W.cost ? 'Gagné !' : 'Petit lot… retente ta chance ?'}</small></div>`;
      coinFountain(Math.min(60, Math.round(prize.coins / 6) + 6));
      sfx(prize.coins >= W.cost ? 'legend' : 'pop');
      if (prize.coins >= 250) burst('supernova', 26);
    } else {
      const rar = SHOP.rarity(prize.it.price), lk = LOOK_KEY[prize.k];
      res.innerHTML = `<div class="wh-win item r-${rar}"><span class="f-tag">${RARITY_LABEL[rar]} · ${KIND_LABEL[prize.k]}</span>
        <div class="wh-prev">${itemPreview(prize.k, prize.it, me(), true)}</div><b>${esc(prize.it.name || prize.it.id)}</b>
        <small>Valeur boutique : 🪙 ${prize.it.price}</small><button class="btn btn-yellow" id="wh-equip">✨ Équiper</button></div>`;
      $('#wh-equip').onclick = () => { save.look[lk] = prize.it.id; persist(); applyCardback(); renderProfile(); pushLook(); toast('✨ Équipé !'); $('#wh-equip').disabled = true; if (prize.k === 'boards') window.HORSES?.skinBoard(); };
      sfx('legend'); if (rar !== 'common') setTimeout(() => sfx('legend'), 280);
      burst(rar === 'legendary' ? 'galaxy' : rar === 'epic' ? 'supernova' : rar === 'rare' ? 'fireworks' : 'party', rar === 'legendary' ? 50 : 24);
      if (prize.k === 'winFx') setTimeout(() => burst(prize.it.id, 24), 600);
      if (prize.k === 'pcfx') setTimeout(() => window.HORSES?.demo(prize.it.id), 600);
    }
    refresh();
  }
  return { open };
})();

let opening = null;
function openReward(kind) {
  if (rewardLeft(kind) || opening) { if (rewardLeft(kind)) toast(`${kind === 'gift' ? '🎁 Prochain cadeau' : '💰 Prochain coffre'} dans ${fmtLeft(rewardLeft(kind))}`); return; }
  unlockAudio?.();
  opening = { kind, opened: false };
  const ov = $('#opener');
  ov.className = 'opener ' + kind;
  $('#op-title').textContent = kind === 'gift' ? '🎁 Un cadeau pour toi ! Touche pour l\'ouvrir' : '💰 Coffre au trésor ! Touche pour l\'ouvrir';
  $('#op-amount').textContent = ''; $('#op-close').classList.add('hidden');
  sfx('pop');
}
$('#rw-gift').onclick = () => openReward('gift');
$('#rw-wheel').onclick = () => window.WHEEL.open();
$('#shop-wheel').onclick = () => { $('#shop').classList.add('hidden'); window.WHEEL.open(); };
$('#rw-chest').onclick = () => openReward('chest');
$('#op-box').onclick = () => {
  if (!opening || opening.opened) return;
  opening.opened = true;
  const { kind } = opening, R = REWARD[kind];
  let amount = Math.round(R.min + Math.random() * (R.max - R.min));
  const jackpot = kind === 'chest' && Math.random() < R.jackpot;
  if (jackpot) amount *= 2;
  // on « consomme » tout de suite pour éviter le double clic / rechargement
  save[kind + 'At'] = Date.now() + R.every; save.coins += amount; persist();
  const ov = $('#opener');
  ov.classList.add('shaking'); sfx('scratch');
  setTimeout(() => {
    ov.classList.remove('shaking'); ov.classList.add('open'); if (jackpot) ov.classList.add('jackpot');
    sfx('legend'); setTimeout(() => sfx('legend'), 250);
    coinFountain(kind === 'chest' ? (jackpot ? 70 : 45) : 22);
    if (kind === 'chest') burst(jackpot ? 'supernova' : 'fireworks', 22); else burst('party', 14);
    const box = $('#op-box');
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('i'); s.className = 'op-spark';
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, d = 120 + Math.random() * 160;
      s.style.setProperty('--x', Math.cos(a) * d + 'px'); s.style.setProperty('--y', Math.sin(a) * d + 'px');
      s.style.animationDelay = (kind === 'chest' ? 300 : 120) + i * 15 + 'ms';
      box.appendChild(s); setTimeout(() => s.remove(), 1600);
    }
    $('#op-title').textContent = jackpot ? '🌟 JACKPOT ! Coffre doré ×2 !' : kind === 'gift' ? '🎉 Bravo !' : '💰 Trésor trouvé !';
    countUp($('#op-amount'), amount);
    setTimeout(() => { renderProfile(); $('#op-close').classList.remove('hidden'); }, 900);
  }, kind === 'chest' ? 1300 : 900);
};
$('#op-close').onclick = () => { $('#opener').className = 'opener hidden'; opening = null; tickRewards(); };
function countUp(el, n) {
  let v = 0; const step = Math.max(1, Math.round(n / 25));
  const iv = setInterval(() => { v = Math.min(n, v + step); el.textContent = `+${v} 🪙`; if (v >= n) clearInterval(iv); }, 35);
}
// pièces qui jaillissent puis filent vers le porte-monnaie
function coinFountain(n) {
  const wallet = [...$$('.coins-n')].map(e => e.getBoundingClientRect()).find(r => r.width) || { left: innerWidth - 80, top: 20 };
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'coin-fly'; c.textContent = '🪙';
    const a = rnd(-Math.PI * .9, -Math.PI * .1), d = rnd(120, 300);
    c.style.setProperty('--dx', Math.cos(a) * d + 'px'); c.style.setProperty('--dy', Math.sin(a) * d + 'px');
    c.style.setProperty('--tx', (wallet.left - innerWidth / 2) + 'px'); c.style.setProperty('--ty', (wallet.top - innerHeight * .45) + 'px');
    c.style.animationDelay = (i * 18) + 'ms';
    $('#reactions-layer').appendChild(c);
    setTimeout(() => c.remove(), 2200 + i * 18);
  }
}
