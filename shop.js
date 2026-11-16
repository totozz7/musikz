// MUSIKZ — catalogue des cosmétiques (utilisé par le site ET par le serveur)
(function (root) {
  const FREE_ICONS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🦉', '🐺', '🐲', '🐝', '🦖', '🐨', '🐷', '🐶', '🐱', '🦈', '🦩',
    '👽', '🤖', '👻', '💀', '🤡', '🎃', '😎', '🥸', '🤠', '🥷', '🧛', '🧙', '🦸', '🧜', '👑', '🫠',
    '🍕', '🍔', '🌮', '🍩', '🥑', '🌶️', '🥖', '🧀', '🎸', '🎧', '🎤', '🥁', '🎷', '🚀', '⚡', '🔥', '🌈', '💎'];

  const SHOP = {
    startCoins: 300,
    icons: [
      ...FREE_ICONS.map(e => ({ id: e, price: 0 })),
      ...[['🐉', 150], ['🦚', 150], ['🪐', 150], ['🧞', 200], ['🦹', 200], ['🧚', 200], ['🛸', 200], ['🌋', 200], ['🍄', 150], ['🦑', 150],
        ['🐳', 150], ['🦅', 150], ['🧌', 250], ['🫅', 300], ['🪩', 300], ['🎰', 300], ['🧿', 300], ['☄️', 400], ['🌌', 500], ['🏆', 800]]
        .map(([e, p]) => ({ id: e, price: p })),
    ],
    frames: [
      { id: 'none', name: 'Aucun', price: 0 }, { id: 'classic', name: 'Classique', price: 0 },
      { id: 'pixel', name: 'Pixel', price: 150 }, { id: 'gold', name: 'Or', price: 200 }, { id: 'ice', name: 'Glace', price: 200 },
      { id: 'fire', name: 'Feu', price: 300 }, { id: 'stars', name: 'Étoiles', price: 300 }, { id: 'neon', name: 'Néon', price: 350 },
      { id: 'crown', name: 'Couronne', price: 500 }, { id: 'rainbow', name: 'Arc-en-ciel', price: 600 },
      { id: 'neonblink', name: 'Néon clignotant', price: 700 }, { id: 'rgb', name: 'RGB gamer', price: 800 },
      { id: 'glitch', name: 'Glitch', price: 900 }, { id: 'galaxy', name: 'Galaxie', price: 1000 },
      { id: 'electric', name: 'Électrique', price: 1200 }, { id: 'diamond', name: 'Diamant', price: 1500 },
    ],
    nameFx: [
      { id: 'none', name: 'Normal', price: 0 }, { id: 'shadow', name: '3D', price: 150 }, { id: 'ice', name: 'Givré', price: 250 },
      { id: 'fire', name: 'En feu', price: 300 }, { id: 'gold', name: 'Or brillant', price: 400 }, { id: 'neon', name: 'Néon clignotant', price: 500 },
      { id: 'galaxy', name: 'Galaxie', price: 700 }, { id: 'glitch', name: 'Glitch', price: 900 }, { id: 'rgb', name: 'RGB qui bouge', price: 1000 },
    ],
    titles: [
      { id: 'none', name: '(aucun)', price: 0 }, { id: 'debutant', name: 'Petite oreille', price: 0 },
      { id: 'dorothee', name: 'Fan de Dorothée', price: 150 }, { id: 'melomane', name: 'Mélomane', price: 200 },
      { id: 'dj', name: 'DJ de soirée', price: 250 }, { id: 'oreille', name: "Oreille d'or", price: 300 },
      { id: 'generique', name: 'Roi des génériques', price: 400 }, { id: 'chaos', name: 'Agent du chaos', price: 500 },
      { id: 'shazam', name: 'Shazam humain', price: 600 }, { id: 'encyclo', name: 'Encyclopédie vivante', price: 800 },
      { id: 'legende', name: 'Légende du blind test', price: 2000 },
    ],
    winFx: [
      { id: 'party', name: 'Fête', emojis: '🎉🎊✨', price: 0 }, { id: 'stars', name: 'Étoiles', emojis: '⭐🌟✨', price: 150 },
      { id: 'hearts', name: 'Cœurs', emojis: '💖💘💕', price: 150 }, { id: 'pizza', name: 'Pizzas', emojis: '🍕🍕🧀', price: 200 },
      { id: 'ducks', name: 'Canards', emojis: '🦆🦆🐥', price: 250 }, { id: 'fire', name: 'Flammes', emojis: '🔥🔥💥', price: 300 },
      { id: 'money', name: 'Billets', emojis: '💸💵🪙', price: 400 }, { id: 'music', name: 'Notes', emojis: '🎵🎶🎸', price: 400 },
      { id: 'goat', name: 'GOAT', emojis: '🐐👑🐐', price: 800 }, { id: 'galaxy', name: 'Galaxie', emojis: '🪐🌌☄️', price: 1000 },
    ],
  };
  SHOP.ids = (k) => SHOP[k].map(x => x.id);
  if (typeof module !== 'undefined' && module.exports) module.exports = SHOP; else root.SHOP = SHOP;
})(this);
