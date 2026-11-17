// MUSIKZ — catalogue des cosmétiques (utilisé par le site ET par le serveur)
// Raretés (déduites du prix) : < 300 Commun · < 1200 Rare · < 2500 Épique · ≥ 2500 Légendaire
(function (root) {
  const FREE_ICONS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🦉', '🐺', '🐲', '🐝', '🦖', '🐨', '🐷', '🐶', '🐱', '🦈', '🦩',
    '👽', '🤖', '👻', '💀', '🤡', '🎃', '😎', '🥸', '🤠', '🥷', '🧛', '🧙', '🦸', '🧜', '👑', '🫠',
    '🍕', '🍔', '🌮', '🍩', '🥑', '🌶️', '🥖', '🧀', '🎸', '🎧', '🎤', '🥁', '🎷', '🚀', '⚡', '🔥', '🌈', '💎'];
  const FREE_COLORS = ['#ff2e4d', '#ff7a1a', '#ffc21a', '#c0ff00', '#4cd964', '#30d5c8', '#00e5ff', '#2fa9ff', '#7c5cff', '#e0b0ff', '#ff4fa3', '#ff9ecf', '#ffd59e', '#ffffff'];

  const SHOP = {
    startCoins: 100,
    // gains par partie (le serveur s'en sert) : participation + par bonne réponse + podium
    earn: { base: 10, perGood: 4, podium: [30, 15, 8] },
    // cadeau toutes les 10 min, coffre toutes les heures (pendant l'attente)
    gift: { every: 10 * 60e3, min: 6, max: 15 },
    chest: { every: 60 * 60e3, min: 35, max: 90, jackpot: 0.1 },
    // 🎡 roue de la chance : un tour = cost pièces. p = chances en %. Objets tirés parmi ceux que tu n'as pas encore.
    wheel: {
      cost: 200,
      odds: [
        { id: 'c25', p: 24, coins: 25 }, { id: 'c60', p: 20, coins: 60 }, { id: 'c120', p: 10, coins: 120 },
        { id: 'c250', p: 5, coins: 250 }, { id: 'c500', p: 1.2, coins: 500 },
        { id: 'common', p: 28, rar: 'common' }, { id: 'rare', p: 10, rar: 'rare' }, { id: 'epic', p: 1.5, rar: 'epic' }, { id: 'legendary', p: 0.3, rar: 'legendary' },
      ],
      // si tu possèdes déjà tout dans cette rareté : pièces de consolation
      fallback: { common: 120, rare: 400, epic: 1000, legendary: 2500 },
      slices: ['c25', 'common', 'c60', 'rare', 'c120', 'common', 'epic', 'c60', 'c250', 'common', 'c500', 'legendary'],
      kinds: ['icons', 'colors', 'frames', 'nameFx', 'titles', 'winFx', 'pawns', 'boards', 'pcfx'],
    },
    icons: [
      ...FREE_ICONS.map(e => ({ id: e, price: 0 })),
      // icônes premium
      ...[['🍄', 150], ['🦑', 150], ['🐳', 200], ['🦅', 200], ['🦚', 250], ['🧚', 300], ['🛸', 300], ['🌋', 350], ['🦹', 400], ['🧌', 450],
        ['🫅', 600], ['🪩', 700], ['🎰', 800], ['🧿', 900]].map(([e, p]) => ({ id: e, price: p })),
      // icônes animées
      { id: '🧞', price: 1200, anim: 'float', name: 'Génie flottant' },
      { id: '🪐', price: 1800, anim: 'spin', name: 'Planète en orbite' },
      { id: '☄️', price: 2200, anim: 'comet', name: 'Comète' },
      { id: '👾', price: 2600, anim: 'glitch', name: 'Space invader glitché' },
      { id: '🐉', price: 3200, anim: 'float', name: 'Dragon' },
      { id: '🏆', price: 4000, anim: 'shine', name: 'Trophée doré' },
      // ── héros & jeux vidéo ──
      ...[['🛡️', 300], ['⚔️', 400], ['🏹', 300], ['🧪', 300], ['🕹️', 350], ['🎮', 350], ['💣', 450], ['🪄', 500], ['🦾', 600]].map(([e, p]) => ({ id: e, price: p })),
      { id: '🕷️', price: 1600, anim: 'swing', name: 'Araignée suspendue' },
      { id: '🦇', price: 1400, anim: 'flap', name: 'Chauve-souris' },
      { id: '💥', price: 2000, anim: 'boom', name: 'Explosion comics' },

    ],
    colors: [
      ...FREE_COLORS.map(c => ({ id: c, price: 0, base: c })),
      { id: 'anim:sunset', name: 'Coucher de soleil', price: 400, base: '#ff7a1a' },
      { id: 'anim:ocean', name: 'Océan', price: 400, base: '#2fa9ff' },
      { id: 'anim:toxic', name: 'Toxique', price: 700, base: '#7dff2e' },
      { id: 'anim:vapor', name: 'Vaporwave', price: 900, base: '#ff71ce' },
      { id: 'anim:gold', name: 'Or massif', price: 1500, base: '#ffc21a' },
      { id: 'anim:rainbow', name: 'Arc-en-ciel', price: 2500, base: '#ff4fa3' },
    ],
    frames: [
      { id: 'none', name: 'Aucun', price: 0 }, { id: 'classic', name: 'Classique', price: 0 },
      { id: 'pixel', name: 'Pixel', price: 100 }, { id: 'gold', name: 'Or', price: 150 }, { id: 'ice', name: 'Glace', price: 150 },
      { id: 'fire', name: 'Feu', price: 250 }, { id: 'stars', name: 'Étoiles', price: 300 }, { id: 'neon', name: 'Néon', price: 600 },
      { id: 'crown', name: 'Couronne', price: 800 }, { id: 'rainbow', name: 'Arc-en-ciel', price: 1000 },
      { id: 'neonblink', name: 'Néon clignotant', price: 1200 }, { id: 'rgb', name: 'RGB gamer', price: 1600 },
      { id: 'glitch', name: 'Glitch', price: 1800 }, { id: 'galaxy', name: 'Galaxie', price: 2000 },
      { id: 'electric', name: 'Électrique', price: 2400 }, { id: 'diamond', name: 'Diamant', price: 2800 },
      { id: 'inferno', name: 'Flammes vivantes', price: 3200 }, { id: 'hacker', name: 'Hacker', price: 3500 },
      { id: 'king', name: 'Roi', price: 4000 }, { id: 'strobe', name: 'Arc-en-ciel stroboscope', price: 4500 },
      // ── héros ──
      { id: 'comics', name: 'Comics POW!', price: 900 },
      { id: 'cape', name: 'Cape de héros', price: 700 },
      { id: 'thunder', name: 'Éclair héroïque', price: 1800 },
      { id: 'web', name: 'Le Tisseur', price: 2200 },
      { id: 'cosmic', name: 'Héros cosmique', price: 3400 },
      // ── jeux vidéo ──
      { id: 'arcade', name: 'Arcade 8-bit', price: 500 },
      { id: 'powerup', name: 'Power-up', price: 1000 },
      { id: 'hpbar', name: 'Barre de vie', price: 1500 },
      { id: 'gameover', name: 'Game Over', price: 1400 },
      { id: 'boss', name: 'Boss final', price: 3800 },
    ],
    nameFx: [
      { id: 'none', name: 'Normal', price: 0 }, { id: 'shadow', name: '3D', price: 100 }, { id: 'ice', name: 'Givré', price: 150 },
      { id: 'fire', name: 'En feu', price: 250 }, { id: 'gold', name: 'Or brillant', price: 400 }, { id: 'neon', name: 'Néon clignotant', price: 900 },
      { id: 'galaxy', name: 'Galaxie', price: 1300 }, { id: 'glitch', name: 'Glitch', price: 1600 }, { id: 'rgb', name: 'RGB qui bouge', price: 2000 },
      { id: 'inferno', name: 'Inferno', price: 2800 }, { id: 'hacker', name: 'Hacker', price: 3200 },
      { id: 'royal', name: 'Royal', price: 3600 }, { id: 'strobe', name: 'Stroboscope', price: 4000 },
      { id: 'comics', name: 'Comics', price: 600 }, { id: 'arcade', name: 'Arcade', price: 800 },
      { id: 'heroic', name: 'Héroïque', price: 1800 }, { id: 'web', name: 'Toile', price: 2200 },
      { id: 'boss', name: 'Boss final', price: 3000 },
    ],
    titles: [
      { id: 'debutant', name: 'Débutant', price: 0 },
      { id: 'dorothee', name: 'Fan de Dorothée', price: 150 }, { id: 'melomane', name: 'Mélomane', price: 250 },
      { id: 'dj', name: 'DJ de soirée', price: 400 }, { id: 'oreille', name: "Oreille d'or", price: 600 },
      { id: 'generique', name: 'Roi des génériques', price: 900 }, { id: 'chaos', name: 'Agent du chaos', price: 1300 },
      { id: 'hacker', name: 'Hacker de playlists', price: 1800 }, { id: 'shazam', name: 'Shazam humain', price: 2200 },
      { id: 'encyclo', name: 'Encyclopédie vivante', price: 3000 }, { id: 'roi', name: 'Roi de la soirée', price: 3800 },
      { id: 'legende', name: 'Légende du blind test', price: 6000 },
      { id: 'p1', name: 'Player One', price: 700 }, { id: 'quartier', name: 'Héros du quartier', price: 900 },
      { id: 'justicier', name: 'Justicier masqué', price: 1300 }, { id: 'speedrun', name: 'Speedrunner', price: 1800 },
      { id: 'tisseur', name: 'Le Tisseur', price: 2200 }, { id: 'boss', name: 'Boss final', price: 2500 },
      { id: 'multivers', name: 'Gardien du multivers', price: 4500 },
    ],
    // 🐎 Skins de pions pour les Petits chevaux (le cercle garde la couleur de ton camp)
    pawns: [
      { id: 'classic', name: 'Petit cheval', emoji: '♞', price: 0 },
      { id: 'pion', name: 'Pion rond', emoji: '●', price: 0 },
      { id: 'poney', name: 'Poney', emoji: '🐴', price: 120 },
      { id: 'zebre', name: 'Zèbre', emoji: '🦓', price: 150 },
      { id: 'tortue', name: 'Tortue', emoji: '🐢', price: 150 },
      { id: 'canard', name: 'Canard', emoji: '🦆', price: 200 },
      { id: 'cochon', name: 'Cochon', emoji: '🐷', price: 200 },
      { id: 'escargot', name: 'Escargot turbo', emoji: '🐌', price: 250 },
      { id: 'licorne', name: 'Licorne', emoji: '🦄', price: 450, anim: 'hop' },
      { id: 'trex', name: 'T-Rex', emoji: '🦖', price: 600, anim: 'stomp' },
      { id: 'jockey', name: 'Jockey', emoji: '🏇', price: 700, anim: 'gallop' },
      { id: 'voiture', name: 'Bolide', emoji: '🏎️', price: 800, anim: 'gallop' },
      { id: 'ovni', name: 'Ovni', emoji: '🛸', price: 1000, anim: 'hover' },
      { id: 'feu', name: 'Cheval de feu', emoji: '🐎', price: 1300, fx: 'fire' },
      { id: 'glace', name: 'Cheval de glace', emoji: '🐎', price: 1500, fx: 'ice' },
      { id: 'robot', name: 'Robo-cheval', emoji: '🤖', price: 1800, fx: 'chrome' },
      { id: 'fusee', name: 'Fusée', emoji: '🚀', price: 2000, fx: 'rocket' },
      { id: 'dragon', name: 'Dragon', emoji: '🐲', price: 2300, fx: 'fire' },
      { id: 'arcenciel', name: 'Licorne arc-en-ciel', emoji: '🦄', price: 3000, fx: 'rainbow' },
      { id: 'royal', name: 'Destrier royal', emoji: '🐎', price: 3600, fx: 'royal' },
      { id: 'fantome', name: 'Cavalier fantôme', emoji: '👻', price: 4200, fx: 'ghost' },
      { id: 'pegase', name: 'Pégase cosmique', emoji: '🪽', price: 5000, fx: 'cosmic' },
    ],
    // plateaux des Petits chevaux (chacun voit le plateau qu'il a équipé)
    boards: [
      { id: 'bois', name: 'Bois verni', emoji: '🪵', price: 0 },
      { id: 'feutre', name: 'Tapis de casino', emoji: '🎰', price: 180 },
      { id: 'bonbon', name: 'Bonbons', emoji: '🍬', price: 250 },
      { id: 'plage', name: 'Plage', emoji: '🏖️', price: 500 },
      { id: 'jungle', name: 'Jungle', emoji: '🌴', price: 750 },
      { id: 'marbre', name: 'Marbre & or', emoji: '🏛️', price: 1000 },
      { id: 'pixel', name: 'Pixel 8-bit', emoji: '👾', price: 1400 },
      { id: 'neon', name: 'Néon arcade', emoji: '🌃', price: 1800 },
      { id: 'lave', name: 'Volcan', emoji: '🌋', price: 2200 },
      { id: 'galaxie', name: 'Galaxie', emoji: '🌌', price: 3200 },
      { id: 'trone', name: "Trône d'or", emoji: '👑', price: 4000 },
      { id: 'prisme', name: 'Prisme arc-en-ciel', emoji: '🌈', price: 5500 },
    ],
    // animations quand TON cheval en mange un autre ou rentre au centre (tout le monde les voit)
    pcfx: [
      { id: 'basic', name: 'Classique', emoji: '💥', price: 0, color: '#ffc21a', parts: '⭐✨💫', text: 'POW !', victim: 'spin' },
      { id: 'cartoon', name: 'Boum cartoon', emoji: '🗯️', price: 200, color: '#ff4fa3', parts: '💫⭐💢', text: 'BOUM !', special: 'comic', victim: 'launch' },
      { id: 'sabot', name: 'Coup de sabot', emoji: '🐾', price: 280, color: '#d9b27a', parts: '💨🐾🌾', text: 'HIIII !', special: 'dust', victim: 'launch' },
      { id: 'zap', name: 'Éclair', emoji: '⚡', price: 450, color: '#7fd6ff', parts: '⚡✨', text: 'ZAP !', special: 'bolt', victim: 'zap' },
      { id: 'tornade', name: 'Tornade', emoji: '🌪️', price: 700, color: '#b8d0e6', parts: '🍃💨🍂', text: 'WHOOSH !', special: 'vortex', victim: 'suck' },
      { id: 'plouf', name: 'Plouf', emoji: '🌊', price: 950, color: '#2fb8ff', parts: '💧💦🐟', text: 'PLOUF !', special: 'splash', victim: 'launch' },
      { id: 'boom', name: 'Explosion', emoji: '💣', price: 1300, color: '#ff7a1a', parts: '🔥💥', text: 'KABOOM !', special: 'flame', victim: 'burn', flash: '#ff7a1a' },
      { id: 'jackpot', name: "Pluie d'or", emoji: '🪙', price: 1700, color: '#ffd84d', parts: '🪙💰✨', text: 'JACKPOT !', special: 'rain', victim: 'spin', flash: '#ffd84d' },
      { id: 'trounoir', name: 'Trou noir', emoji: '🕳️', price: 2200, color: '#a35cff', parts: '✨🌑', text: 'ASPIRÉ !', special: 'hole', victim: 'suck', flash: '#2a0050' },
      { id: 'meteore', name: 'Météore', emoji: '☄️', price: 2900, color: '#ff5a00', parts: '🔥☄️💥', text: 'IMPACT !', special: 'meteor', victim: 'burn', flash: '#ff5a00' },
      { id: 'dragon', name: 'Souffle du dragon', emoji: '🐉', price: 3600, color: '#ff2e4d', parts: '🔥🔥✨', text: 'GRAAAH !', special: 'dragon', victim: 'burn', flash: '#ff2e00' },
      { id: 'bigbang', name: 'Big Bang', emoji: '🌌', price: 4800, color: '#c13cff', parts: '🌟🪐✨💫', text: 'BIG BANG !', special: 'cosmic', victim: 'launch', flash: '#ffffff' },
    ],
    winFx: [
      { id: 'party', name: 'Fête', emojis: '🎉🎊✨', price: 0 }, { id: 'stars', name: 'Étoiles', emojis: '⭐🌟✨', price: 150 },
      { id: 'hearts', name: 'Cœurs', emojis: '💖💘💕', price: 150 }, { id: 'pizza', name: 'Pizzas', emojis: '🍕🍕🧀', price: 250 },
      { id: 'ducks', name: 'Canards', emojis: '🦆🦆🐥', price: 350 }, { id: 'fire', name: 'Flammes', emojis: '🔥🔥💥', price: 500 },
      { id: 'money', name: 'Billets', emojis: '💸💵🪙', price: 900 }, { id: 'music', name: 'Notes', emojis: '🎵🎶🎸', price: 900 },
      { id: 'goat', name: 'GOAT', emojis: '🐐👑🐐', price: 2500 },
      // célébrations animées (pas juste une pluie d'emojis)
      { id: 'comics', name: 'BAM ! POW !', emojis: '💥', kind: 'comics', price: 900 },
      { id: 'levelup', name: 'Level up', emojis: '⬆️', kind: 'levelup', price: 1000 },
      { id: 'fireworks', name: "Feu d'artifice", emojis: '🎆', kind: 'fireworks', price: 1500 },
      { id: 'webs', name: 'Toiles du Tisseur', emojis: '🕸️', kind: 'webs', price: 2200 },
      { id: 'galaxy', name: 'Galaxie', emojis: '🪐🌌☄️', kind: 'galaxy', price: 3500 },
      { id: 'supernova', name: 'Supernova', emojis: '🌟', kind: 'supernova', price: 4500 },
    ],
  };
  SHOP.ids = (k) => SHOP[k].map(x => x.id);
  SHOP.rarity = (price) => price >= 2500 ? 'legendary' : price >= 1200 ? 'epic' : price >= 300 ? 'rare' : 'common';
  SHOP.colorBase = (id) => (SHOP.colors.find(c => c.id === id) || {}).base || (/^#[0-9a-f]{6}$/i.test(id) ? id : '#ffc21a');
  SHOP.iconAnim = (id) => (SHOP.icons.find(i => i.id === id) || {}).anim || '';
  if (typeof module !== 'undefined' && module.exports) module.exports = SHOP; else root.SHOP = SHOP;
})(this);
