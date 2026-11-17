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
      frame: 'classic', nameFx: 'none', title: 'debutant', winFx: 'party', pawn: 'classic', board: 'bois', pcfx: 'basic' } };
}
let save;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY)) || defaultSave(); } catch { save = defaultSave(); }
save = { ...defaultSave(), ...save, look: { ...defaultSave().look, ...(save.look || {}) } };
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };
const owns = (kind, id) => { const it = SHOP[kind].find(x => x.id === id); return !!it && (!it.price || save.owned.includes(kind + ':' + id)); };
// un cosmétique équipé mais pas possédé (ancienne version) revient au gratuit
for (const [k, d] of [['icons', null], ['colors', '#ffc21a'], ['frames', 'classic'], ['nameFx', 'none'], ['titles', 'debutant'], ['winFx', 'party'], ['pawns', 'classic'], ['boards', 'bois'], ['pcfx', 'basic']]) {
  const key = k === 'icons' ? 'avatar' : k === 'colors' ? 'color' : k === 'frames' ? 'frame' : k === 'titles' ? 'title' : k === 'pawns' ? 'pawn' : k === 'boards' ? 'board' : k;
  if (!owns(k, save.look[key])) save.look[key] = d || SHOP.icons[0].id;
}
persist();
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

const LOOK_KEY = { icons: 'avatar', colors: 'color', frames: 'frame', nameFx: 'nameFx', titles: 'title', winFx: 'winFx', pawns: 'pawn', boards: 'board', pcfx: 'pcfx' };
const RARITY_LABEL = { common: 'Commun', rare: '◆ Rare', epic: '✦ Épique', legendary: '★ Légendaire' };
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
  const RANK = { free: 0, common: 1, rare: 2, epic: 3, legendary: 4 };
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
    save.look[lookKey] = it.id; persist(); renderProfile(); renderShop(); pushLook();
    if (kind === 'winFx') burst(it.id);
    if (kind === 'pcfx') window.HORSES?.demo(it.id);
    if (kind === 'boards') window.HORSES?.skinBoard();
  };
  const buy = (it, el) => {
    if (save.coins < it.price) { el?.classList.add('shake'); setTimeout(() => el?.classList.remove('shake'), 300); return toast(`Il te manque ${it.price - save.coins} 🪙`, 'error'); }
    save.coins -= it.price; save.owned.push(kind + ':' + it.id);
    const rar = SHOP.rarity(it.price);
    toast(`🛍️ ${rar === 'legendary' ? '★ LÉGENDAIRE ★ ' : ''}Acheté ! (-${it.price} 🪙)`);
    sfx('legend'); if (rar === 'legendary' || rar === 'epic') setTimeout(() => sfx('legend'), 300);
    burst(rar === 'legendary' ? 'galaxy' : rar === 'epic' ? 'money' : 'party', rar === 'legendary' ? 40 : 18);
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
  draw: { emoji: '🎨', name: 'Draw Time', desc: "Un joueur dessine, les autres devinent ! Des mots classiques, marrants… ou un peu pimentés 🌶️", cls: 'g-draw', lobby: 'Sortez les crayons ! ✏️' },
  primo: { emoji: '🎴', name: 'PRIMO !', desc: 'Même couleur ou même chiffre, +2, +4, inversions… et un mode Pagaille plein de cartes vicieuses. Crie PRIMO à ta dernière carte !', cls: 'g-primo', lobby: 'Battez les cartes ! 🃏' },
  guess: { emoji: '🖼️', name: 'Guess Party', desc: 'Une image floutée, pixelisée ou zoomée : dessins animés, films, pochettes de rap… Trouve-la avant les autres !', cls: 'g-guess', lobby: 'Ouvrez grand les yeux ! 👀' },
  liar: { emoji: '🃏', name: 'Bar des Menteurs', desc: 'Pose tes cartes face cachée et bluffe… ou crie MENTEUR ! Le perdant tente sa chance au pistolet à bouchon.', cls: 'g-liar', lobby: 'Tout le monde au comptoir ! 🥃' },
  horses: { emoji: '🐎', name: 'Petits chevaux', desc: 'Le grand classique : lance le dé, sors tes chevaux, renvoie les autres à l\'écurie ! Choisis le skin de tes pions.', cls: 'g-horses', lobby: 'Tous en selle ! 🐎' },
  note: { emoji: '🔢', name: 'Jeu de la Note', desc: "Une note secrète sur 10, trois thèmes : réponds avec quelque chose qui « vaut » ta note. Les autres devinent !", cls: 'g-note', lobby: 'Sur une échelle de 1 à 10… 🔢' },
};
let GAME_INFO = { blindtest: { min: 1, max: 12 }, undercover: { min: 3, max: 12 }, word: { min: 1, max: 12 }, horses: { min: 1, max: 4 }, liar: { min: 1, max: 6 }, guess: { min: 1, max: 12 }, primo: { min: 1, max: 8 }, draw: { min: 2, max: 12 }, note: { min: 2, max: 10 } }, UC_THEMES = [], GP_THEMES = [];
fetch('/api/guess-themes').then(r => r.json()).then(t => { GP_THEMES = t; if (state?.game === 'guess') renderGameLobby?.(); }).catch(() => {});
const playersLabel = (g) => { const i = GAME_INFO[g]; return i.min === i.max ? `${i.min} joueurs` : `${i.min} à ${i.max} joueurs`; };
function renderGames() {
  $('#games').innerHTML = Object.entries(GAME_META).map(([id, m], i) => `
    <button class="game-card ${m.cls}" data-game="${id}" style="--i:${i}">
      <span class="g-bg"></span><span class="g-spark"></span>
      <span class="g-top"><span class="g-emoji">${m.emoji}</span><span class="g-players">👥 ${playersLabel(id)}</span></span>
      <span class="g-info"><b>${m.name}</b><small>${m.desc}</small></span>
      <span class="g-go">Jouer ▶</span>
    </button>`).join('');
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
  $('#btn-start').textContent = `▶ Lancer ${{ note: 'le Jeu de la Note', blindtest: 'le Blind test', undercover: "l'Undercover", word: 'Speed Word', horses: 'les Petits chevaux', liar: 'le Bar des Menteurs', guess: 'la Guess Party', primo: 'PRIMO', draw: 'Draw Time' }[g]}`;
  $('#btn-start').disabled = !ok;
  if (g === 'blindtest') return;
  const box = $('#set-' + g), gs = state.gs?.[g] || {};
  box.classList.toggle('readonly', !isHost());
  if (g === 'undercover') {
    $('#uc-themes').innerHTML = [{ id: 'all', emoji: '🎲', name: 'Tout mélangé' }, ...UC_THEMES].map(t =>
      `<button class="cat ${gs.theme === t.id ? 'on' : ''} ${t.id === 'anime' ? 'star' : ''}" data-t="${t.id}">${t.emoji} ${esc(t.name)}</button>`).join('');
    $$('#uc-themes .cat').forEach(b => b.onclick = () => socket.emit('gsettings', { theme: b.dataset.t }));
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
  function panel() {
    let m = $('#modo-panel');
    if (!m) { m = document.createElement('div'); m.id = 'modo-panel'; m.className = 'modo-panel hidden'; document.body.appendChild(m); m.onclick = (e) => { if (e.target === m) m.classList.add('hidden'); }; }
    const others = (state?.players || []).filter(p => p.id !== pid);
    m.innerHTML = `<div class="modo-box"><button class="modo-x">✕</button>
      <h3>🛡️ Mode modo</h3><p class="muted small">Visible par toi seul. Tes objets ne sont pas débloqués : à toi de les acheter 😉</p>
      <h4>Mes pièces <b>🪙 ${save.coins.toLocaleString('fr-FR')}</b></h4>
      <div class="modo-row">${[1000, 10000, 100000].map(n => `<button class="btn btn-yellow btn-sm" data-self="${n}">+${n.toLocaleString('fr-FR')}</button>`).join('')}<button class="btn btn-ghost btn-sm" data-self="max">♾️ 999 999</button></div>
      <h4>Donner des pièces</h4>
      ${others.length ? `<div class="modo-amt"><input class="input" id="modo-n" type="number" min="1" value="200"><button class="btn btn-primary btn-sm" data-to="*">🎁 À tout le monde</button></div>
      <div class="modo-list">${others.map(p => `<div class="modo-pl">${avatarHTML(p, 30)}<b>${esc(p.name)}</b><button class="btn btn-sm btn-yellow" data-to="${p.id}">🎁 Donner</button></div>`).join('')}</div>` : '<p class="muted small">Personne d\'autre dans le salon pour l\'instant.</p>'}
      <button class="btn btn-ghost btn-sm modo-off">Désactiver sur cet appareil</button></div>`;
    m.querySelector('.modo-x').onclick = () => m.classList.add('hidden');
    m.querySelectorAll('[data-self]').forEach(b => b.onclick = () => {
      if (b.dataset.self === 'max') save.coins = 999999; else save.coins += +b.dataset.self;
      persist(); renderProfile(); coinFountain(20); sfx('legend'); panel();
    });
    m.querySelectorAll('[data-to]').forEach(b => b.onclick = () => {
      const n = Math.round(+$('#modo-n').value || 0); if (n <= 0) return toast('Montant invalide', 'error');
      socket.emit('modoGift', { to: b.dataset.to, coins: n }, (r) => r?.ok ? toast(`🎁 ${n} 🪙 envoyées${r.n > 1 ? ` à ${r.n} joueurs` : ''} !`) : toast(r?.error || 'Erreur', 'error'));
    });
    m.querySelector('.modo-off').onclick = () => { store.set('mz_modo', ''); on = false; btn().classList.add('hidden'); m.classList.add('hidden'); toast('Mode modo désactivé sur cet appareil'); };
    m.classList.remove('hidden');
  }
  btn().onclick = () => on && panel();
  socket.on('connect', () => { const k = store.get('mz_modo', ''); if (k) login(k, true); });
  socket.on('modoGift', ({ coins }) => {
    save.coins += coins; persist(); renderProfile();
    toast(`🎁 Cadeau surprise : +${coins} 🪙 !`); coinFountain(Math.min(60, 10 + Math.round(coins / 20))); sfx('legend');
  });
  return { login };
})();
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
  if (fx.kind && CELEBRATIONS[fx.kind]) return CELEBRATIONS[fx.kind](Math.min(1.3, Math.max(.45, n / 22)));
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
  const giftBody = (u) => `<svg viewBox="0 0 160 118" class="art"><defs>
    <linearGradient id="gp${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b97"/><stop offset=".5" stop-color="#e8174f"/><stop offset="1" stop-color="#9c0b35"/></linearGradient>
    <pattern id="gd${u}" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.4" fill="#fff" opacity=".35"/><path d="M19 13l1.7 3.6 3.9.5-2.9 2.6.8 3.9-3.5-2-3.5 2 .8-3.9-2.9-2.6 3.9-.5z" fill="#ffe27a" opacity=".6"/></pattern>
    <linearGradient id="gr${u}" x1="0" x2="1"><stop offset="0" stop-color="#b37400"/><stop offset=".3" stop-color="#ffe680"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#a86a00"/></linearGradient>
    <linearGradient id="gs${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
    <rect x="4" y="2" width="152" height="114" rx="12" fill="url(#gp${u})"/>
    <rect x="4" y="2" width="152" height="114" rx="12" fill="url(#gd${u})"/>
    <rect x="68" y="2" width="24" height="114" fill="url(#gr${u})"/><rect x="72" y="2" width="4" height="114" fill="#fff" opacity=".5"/>
    <rect x="4" y="2" width="152" height="114" rx="12" fill="url(#gs${u})"/>
    <rect x="12" y="12" width="9" height="92" rx="4.5" fill="#fff" opacity=".2"/>
    <rect x="4" y="2" width="152" height="9" fill="#000" opacity=".22"/>
    <rect x="4" y="2" width="152" height="114" rx="12" fill="none" stroke="#5c0420" stroke-opacity=".5" stroke-width="2"/></svg>`;
  const giftLid = (u) => `<svg viewBox="0 0 176 96" class="art"><defs>
    <linearGradient id="lp${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7ea3"/><stop offset="1" stop-color="#d81447"/></linearGradient>
    <linearGradient id="lr${u}" x1="0" x2="1"><stop offset="0" stop-color="#b37400"/><stop offset=".35" stop-color="#fff0a0"/><stop offset=".65" stop-color="#ffc21a"/><stop offset="1" stop-color="#a86a00"/></linearGradient>
    <radialGradient id="lk${u}" cx=".4" cy=".35"><stop offset="0" stop-color="#fff3b0"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#9a6200"/></radialGradient></defs>
    <path d="M86 58 L66 92 L76 87 L80 96 L92 62Z M90 58 L110 92 L100 87 L96 96 L84 62Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="1.5"/>
    <rect x="2" y="56" width="172" height="36" rx="9" fill="url(#lp${u})" stroke="#5c0420" stroke-opacity=".5" stroke-width="2"/>
    <rect x="76" y="56" width="24" height="36" fill="url(#lr${u})"/><rect x="80" y="56" width="4" height="36" fill="#fff" opacity=".5"/>
    <rect x="10" y="61" width="156" height="6" rx="3" fill="#fff" opacity=".28"/>
    <path d="M88 52 C 62 14, 22 26, 38 54 C 48 70, 74 62, 88 52Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="2"/>
    <path d="M86 50 C 66 26, 40 32, 48 50 C 54 60, 72 56, 86 50Z" fill="#a86a00" opacity=".55"/>
    <path d="M88 52 C 114 14, 154 26, 138 54 C 128 70, 102 62, 88 52Z" fill="url(#lr${u})" stroke="#7a4a00" stroke-width="2"/>
    <path d="M90 50 C 110 26, 136 32, 128 50 C 122 60, 104 56, 90 50Z" fill="#a86a00" opacity=".55"/>
    <path d="M44 40 C 52 28, 66 30, 74 40" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="88" cy="53" rx="13" ry="11" fill="url(#lk${u})" stroke="#7a4a00" stroke-width="2"/>
    <ellipse cx="84" cy="49" rx="4" ry="3" fill="#fff" opacity=".7"/></svg>`;
  const chestBody = (u) => `<svg viewBox="0 0 200 104" class="art"><defs>
    <linearGradient id="cw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8602c"/><stop offset="1" stop-color="#5a2a0e"/></linearGradient>
    <linearGradient id="cg${u}" x1="0" x2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#ffe680"/><stop offset=".55" stop-color="#f0b429"/><stop offset="1" stop-color="#7a4a00"/></linearGradient>
    <linearGradient id="cv${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#f0b429"/><stop offset="1" stop-color="#8a5a00"/></linearGradient>
    <filter id="cn${u}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.32" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .22  0 0 0 0 .1  0 0 0 0 .03  0 0 0 .6 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <radialGradient id="cj${u}" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd1dc"/><stop offset=".4" stop-color="#ff2e4d"/><stop offset="1" stop-color="#7a0018"/></radialGradient></defs>
    <rect x="2" y="2" width="196" height="100" rx="8" fill="url(#cw${u})"/>
    <rect x="2" y="2" width="196" height="100" rx="8" fill="#000" filter="url(#cn${u})"/>
    <path d="M2 36 H198 M2 70 H198" stroke="#2a1004" stroke-width="2.5" opacity=".7"/>
    <path d="M2 38 H198 M2 72 H198" stroke="#fff" stroke-width="1" opacity=".12"/>
    <rect x="24" y="2" width="22" height="100" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    <rect x="154" y="2" width="22" height="100" fill="url(#cg${u})" stroke="#5a3a00" stroke-width="1.5"/>
    ${[14, 52, 90].map(y => `<circle cx="35" cy="${y}" r="3.4" fill="#fff4c2" stroke="#5a3a00"/><circle cx="165" cy="${y}" r="3.4" fill="#fff4c2" stroke="#5a3a00"/>`).join('')}
    <rect x="2" y="2" width="196" height="8" fill="url(#cg${u})"/><rect x="2" y="94" width="196" height="8" rx="3" fill="url(#cg${u})"/>
    <path d="M2 2 h16 v8 h-8 v16 h-8z M198 2 h-16 v8 h8 v16 h8z M2 102 h16 v-8 h-8 v-16 h-8z M198 102 h-16 v-8 h8 v-16 h8z" fill="url(#cv${u})" stroke="#5a3a00" stroke-width="1.2"/>
    <path d="M82 4 h36 v28 q0 16 -18 24 q-18 -8 -18 -24z" fill="url(#cv${u})" stroke="#5a3a00" stroke-width="2"/>
    <circle cx="100" cy="14" r="5.5" fill="url(#cj${u})" stroke="#5a0010"/>
    <circle cx="100" cy="30" r="5" fill="#2a1600"/><path d="M97 32 h6 l2 12 h-10z" fill="#2a1600"/>
    <rect x="2" y="2" width="196" height="100" rx="8" fill="none" stroke="#2a1004" stroke-width="2.5"/></svg>`;
  const chestLid = (u) => `<svg viewBox="0 0 204 68" class="art"><defs>
    <linearGradient id="kw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4773a"/><stop offset="1" stop-color="#7a3a14"/></linearGradient>
    <linearGradient id="kg${u}" x1="0" x2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#ffe680"/><stop offset=".55" stop-color="#f0b429"/><stop offset="1" stop-color="#7a4a00"/></linearGradient>
    <filter id="kn${u}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.3" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .22  0 0 0 0 .1  0 0 0 0 .03  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <clipPath id="kc${u}"><path d="M2 66 V30 Q2 2 102 2 Q202 2 202 30 V66Z"/></clipPath></defs>
    <g clip-path="url(#kc${u})">
      <rect width="204" height="68" fill="url(#kw${u})"/><rect width="204" height="68" fill="#000" filter="url(#kn${u})"/>
      <path d="M2 30 Q102 4 202 30" fill="none" stroke="#2a1004" stroke-width="2.5" opacity=".7"/>
      <path d="M10 22 Q102 0 194 22" fill="none" stroke="#fff" stroke-width="3" opacity=".22"/>
      <rect x="26" width="22" height="68" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.5"/><rect x="156" width="22" height="68" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.5"/>
      ${[22, 46].map(y => `<circle cx="37" cy="${y}" r="3.4" fill="#fff4c2" stroke="#5a3a00"/><circle cx="167" cy="${y}" r="3.4" fill="#fff4c2" stroke="#5a3a00"/>`).join('')}
      <rect y="58" width="204" height="10" fill="url(#kg${u})"/>
    </g>
    <path d="M2 66 V30 Q2 2 102 2 Q202 2 202 30 V66Z" fill="none" stroke="#2a1004" stroke-width="2.5"/>
    <path d="M88 58 h28 v8 h-28z" fill="url(#kg${u})" stroke="#5a3a00" stroke-width="1.5"/></svg>`;
  const treasure = (u) => `<svg viewBox="0 0 180 70" class="art"><defs>
    <radialGradient id="tc${u}" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6c4"/><stop offset=".55" stop-color="#ffc21a"/><stop offset="1" stop-color="#a86a00"/></radialGradient></defs>
    <path d="M6 70 Q20 26 60 30 Q90 4 122 28 Q164 22 174 70Z" fill="url(#tc${u})" stroke="#8a5a00" stroke-width="2"/>
    ${[[30, 44], [52, 36], [74, 22], [98, 16], [120, 28], [144, 38], [40, 56], [86, 40], [130, 52], [110, 50], [64, 52]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="url(#tc${u})" stroke="#8a5a00" stroke-width="1.5"/>`).join('')}
    <path d="M58 22 l8 -10 l8 10 l-8 8z" fill="#2fd3ff" stroke="#0a5a7a" stroke-width="1.5"/><path d="M126 18 l9 -9 l9 9 l-9 9z" fill="#ff2e6e" stroke="#7a0030" stroke-width="1.5"/>
    <path d="M92 6 l7 -6 l7 6 l-7 9z" fill="#3dff8e" stroke="#0a6a30" stroke-width="1.5"/>
    <path d="M84 28 l6 -12 l6 8 l6 -10 l6 10 l6 -8 l6 12z" fill="url(#tc${u})" stroke="#8a5a00" stroke-width="1.5"/></svg>`;
  return {
    gift: () => { const u = 'g' + n++; return `<div class="gf-lid">${giftLid(u)}</div><div class="gf-body">${giftBody(u)}</div><div class="gf-shine"></div>`; },
    chest: () => { const u = 'c' + n++; return `<div class="c-glow"></div><div class="c-gold">${treasure(u)}</div><div class="c-body">${chestBody(u)}</div><div class="c-lid">${chestLid(u)}</div>`; },
  };
})();
$('#op-box .gift3d').innerHTML = ART.gift();
$('#op-box .chest3d').innerHTML = ART.chest();
$('#rw-gift .rw-ico').innerHTML = `<span class="mini-art gift3d">${ART.gift()}</span>`;
$('#rw-chest .rw-ico').innerHTML = `<span class="mini-art chest3d">${ART.chest()}</span>`;
setInterval(tickRewards, 1000); tickRewards();

// ───────────── 🎡 Roue de la chance ─────────────
window.WHEEL = (() => {
  const W = SHOP.wheel, N = W.slices.length, A = 360 / N;
  const KIND_LABEL = { icons: 'Icône', colors: 'Couleur de pseudo', frames: 'Cadre', nameFx: 'Effet de pseudo', titles: 'Titre', winFx: 'Célébration', pawns: 'Pion', boards: 'Plateau', pcfx: 'Animation chevaux' };
  const SL = {
    c25: { t: '25', e: '🪙', c: '#ffcf3d', c2: '#f0a400' }, c60: { t: '60', e: '🪙', c: '#ffb12b', c2: '#e07b00' }, c120: { t: '120', e: '💰', c: '#ffd84d', c2: '#e3a300' },
    c250: { t: '250', e: '💰', c: '#ff9a1f', c2: '#d96500' }, c500: { t: '500', e: '💎', c: '#ff5aa0', c2: '#c4126a' },
    common: { t: 'COMMUN', e: '🎁', c: '#a9bccf', c2: '#6f859b' }, rare: { t: 'RARE', e: '🔷', c: '#3b95ff', c2: '#1356c4' },
    epic: { t: 'ÉPIQUE', e: '🔮', c: '#ab64ff', c2: '#6a1fc9' }, legendary: { t: 'LÉGENDE', e: '👑', c: 'url(#wRain)', c2: '#000' },
  };
  let rot = 0, spinning = false;
  function wheelSVG() {
    const R = 150, cx = 160, cy = 160;
    const pt = (a, r) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
    const slices = W.slices.map((id, i) => {
      const a0 = i * A, a1 = a0 + A, [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), s = SL[id], mid = a0 + A / 2;
      const [tx, ty] = pt(mid, R * .68), [ex, ey] = pt(mid, R * .87);
      return `<path d="M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="${s.c}" stroke="#2a1600" stroke-width="2"/>
        <path d="M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="url(#wShade)"/>
        <text x="${ex}" y="${ey}" font-size="20" text-anchor="middle" dominant-baseline="central" transform="rotate(${mid} ${ex} ${ey})">${s.e}</text>
        <text x="${tx}" y="${ty}" class="wl ${id.startsWith('c') ? 'coin' : ''}" text-anchor="middle" dominant-baseline="central" transform="rotate(${mid + 90} ${tx} ${ty})">${s.t}</text>`;
    }).join('');
    const bulbs = Array.from({ length: 24 }, (_, i) => { const [x, y] = pt(i * 15, R + 13); return `<circle cx="${x}" cy="${y}" r="4.5" class="bulb b${i % 2}"/>`; }).join('');
    const VB = 'viewBox="-18 -18 356 356"';
    return `<svg ${VB} class="wh-svg wh-base"><defs><linearGradient id="wGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#e2a70f"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>
      <circle cx="160" cy="160" r="168" fill="#3a0d1f" stroke="url(#wGold)" stroke-width="10"/>${bulbs}</svg>
      <svg ${VB} class="wh-svg wh-rot" id="wh-rot"><defs>
      <linearGradient id="wRain" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff004c"/><stop offset=".25" stop-color="#ffe600"/><stop offset=".5" stop-color="#3dff6e"/><stop offset=".75" stop-color="#00e5ff"/><stop offset="1" stop-color="#c13cff"/></linearGradient>
      <radialGradient id="wShade" cx="160" cy="160" r="150" gradientUnits="userSpaceOnUse"><stop offset=".2" stop-color="#fff" stop-opacity=".25"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
      <linearGradient id="wGold2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#e2a70f"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>${slices}</svg>
      <svg ${VB} class="wh-svg"><circle cx="160" cy="160" r="34" fill="url(#wGold)" stroke="#5a3a00" stroke-width="3"/>
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
      $('#wh-equip').onclick = () => { save.look[lk] = prize.it.id; persist(); renderProfile(); pushLook(); toast('✨ Équipé !'); $('#wh-equip').disabled = true; if (prize.k === 'boards') window.HORSES?.skinBoard(); };
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
    if (kind === 'chest') burst(jackpot ? 'supernova' : 'fireworks', 22);
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
