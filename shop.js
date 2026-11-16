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
    ],
    nameFx: [
      { id: 'none', name: 'Normal', price: 0 }, { id: 'shadow', name: '3D', price: 100 }, { id: 'ice', name: 'Givré', price: 150 },
      { id: 'fire', name: 'En feu', price: 250 }, { id: 'gold', name: 'Or brillant', price: 400 }, { id: 'neon', name: 'Néon clignotant', price: 900 },
      { id: 'galaxy', name: 'Galaxie', price: 1300 }, { id: 'glitch', name: 'Glitch', price: 1600 }, { id: 'rgb', name: 'RGB qui bouge', price: 2000 },
      { id: 'inferno', name: 'Inferno', price: 2800 }, { id: 'hacker', name: 'Hacker', price: 3200 },
      { id: 'royal', name: 'Royal', price: 3600 }, { id: 'strobe', name: 'Stroboscope', price: 4000 },
    ],
    titles: [
      { id: 'none', name: '(aucun)', price: 0 }, { id: 'debutant', name: 'Petite oreille', price: 0 },
      { id: 'dorothee', name: 'Fan de Dorothée', price: 150 }, { id: 'melomane', name: 'Mélomane', price: 250 },
      { id: 'dj', name: 'DJ de soirée', price: 400 }, { id: 'oreille', name: "Oreille d'or", price: 600 },
      { id: 'generique', name: 'Roi des génériques', price: 900 }, { id: 'chaos', name: 'Agent du chaos', price: 1300 },
      { id: 'hacker', name: 'Hacker de playlists', price: 1800 }, { id: 'shazam', name: 'Shazam humain', price: 2200 },
      { id: 'encyclo', name: 'Encyclopédie vivante', price: 3000 }, { id: 'roi', name: 'Roi de la soirée', price: 3800 },
      { id: 'legende', name: 'Légende du blind test', price: 6000 },
    ],
    winFx: [
      { id: 'party', name: 'Fête', emojis: '🎉🎊✨', price: 0 }, { id: 'stars', name: 'Étoiles', emojis: '⭐🌟✨', price: 150 },
      { id: 'hearts', name: 'Cœurs', emojis: '💖💘💕', price: 150 }, { id: 'pizza', name: 'Pizzas', emojis: '🍕🍕🧀', price: 250 },
      { id: 'ducks', name: 'Canards', emojis: '🦆🦆🐥', price: 350 }, { id: 'fire', name: 'Flammes', emojis: '🔥🔥💥', price: 500 },
      { id: 'money', name: 'Billets', emojis: '💸💵🪙', price: 900 }, { id: 'music', name: 'Notes', emojis: '🎵🎶🎸', price: 900 },
      { id: 'goat', name: 'GOAT', emojis: '🐐👑🐐', price: 2500 }, { id: 'galaxy', name: 'Galaxie', emojis: '🪐🌌☄️', price: 3500 },
    ],
  };
  SHOP.ids = (k) => SHOP[k].map(x => x.id);
  SHOP.rarity = (price) => price >= 2500 ? 'legendary' : price >= 1200 ? 'epic' : price >= 300 ? 'rare' : 'common';
  SHOP.colorBase = (id) => (SHOP.colors.find(c => c.id === id) || {}).base || (/^#[0-9a-f]{6}$/i.test(id) ? id : '#ffc21a');
  SHOP.iconAnim = (id) => (SHOP.icons.find(i => i.id === id) || {}).anim || '';
  if (typeof module !== 'undefined' && module.exports) module.exports = SHOP; else root.SHOP = SHOP;
})(this);
