// Catégories Musikz : chaque catégorie = recherches de playlists Deezer (et/ou un chart).
// Le serveur cherche des playlists correspondant aux requêtes, mélange leurs morceaux,
// et ne garde que ceux qui ont un extrait audio de 30 s.
module.exports = [
  // ⭐ Les incontournables
  { id: 'da-fr', name: 'Dessins animés FR', emoji: '📺', group: 'Écrans', star: true,
    queries: ['génériques dessins animés', 'génériques dessins animés années 80', 'génériques dessins animés années 90', 'club dorothée génériques', 'génériques dessins animés 2000', 'génériques télé enfance'] },
  { id: 'disney-vf', name: 'Disney en VF', emoji: '🏰', group: 'Écrans',
    queries: ['disney chansons français', 'disney vf', 'chansons disney en français'] },
  { id: 'films', name: 'Musiques de films', emoji: '🎬', group: 'Écrans',
    queries: ['musiques de films cultes', 'bandes originales films', 'movie soundtrack hits'] },
  { id: 'series', name: 'Génériques de séries', emoji: '📼', group: 'Écrans',
    queries: ['génériques séries tv', 'tv series theme songs', 'génériques séries cultes'] },
  { id: 'anime', name: 'Animés japonais', emoji: '🍥', group: 'Écrans',
    queries: ['anime openings', 'génériques animés japonais', 'best anime opening'] },
  { id: 'jeux-video', name: 'Jeux vidéo', emoji: '🎮', group: 'Écrans',
    queries: ['video game music', 'musique jeux vidéo culte'] },
  { id: 'pubs', name: 'Musiques de pubs', emoji: '📣', group: 'Écrans',
    queries: ['musiques de pub', 'musiques publicités tv'] },

  // 🇫🇷 Francophone
  { id: 'hits', name: 'Hits du moment', emoji: '🔥', group: 'Francophone', chart: true, queries: ['top france'] },
  { id: 'variete', name: 'Variété française', emoji: '🎙️', group: 'Francophone',
    queries: ['variété française culte', 'chanson française incontournables', 'variété française années 80'] },
  { id: 'rap-fr', name: 'Rap français', emoji: '🎤', group: 'Francophone',
    queries: ['rap français classiques', 'rap fr hits', 'rap français 2010'] },
  { id: 'pop-fr', name: 'Pop française', emoji: '🥖', group: 'Francophone',
    queries: ['pop française', 'hits pop français'] },
  { id: 'annees-fr', name: 'Années 2000 FR', emoji: '📀', group: 'Francophone',
    queries: ['années 2000 français', 'tubes français 2000'] },
  { id: 'chanson-ancienne', name: 'Chanson rétro', emoji: '🎩', group: 'Francophone',
    queries: ['chanson française années 60', 'yéyé', 'piaf brel aznavour'] },
  { id: 'quebec', name: 'Québec', emoji: '🍁', group: 'Francophone',
    queries: ['musique québécoise', 'classiques québécois'] },

  // 🕰️ Décennies
  { id: '70s', name: 'Années 70', emoji: '🕺', group: 'Décennies', queries: ['70s hits', 'années 70 tubes'] },
  { id: '80s', name: 'Années 80', emoji: '📼', group: 'Décennies', queries: ['80s hits', 'années 80 tubes'] },
  { id: '90s', name: 'Années 90', emoji: '💿', group: 'Décennies', queries: ['90s hits', 'années 90 tubes'] },
  { id: '2000s', name: 'Années 2000', emoji: '📱', group: 'Décennies', queries: ['2000s hits', 'années 2000 tubes'] },
  { id: '2010s', name: 'Années 2010', emoji: '🎧', group: 'Décennies', queries: ['2010s hits', 'années 2010 tubes'] },

  // 🎸 Genres
  { id: 'pop', name: 'Pop internationale', emoji: '🌟', group: 'Genres', queries: ['pop hits', 'best pop songs'] },
  { id: 'rock', name: 'Rock', emoji: '🎸', group: 'Genres', queries: ['rock classics', 'best rock songs'] },
  { id: 'metal', name: 'Metal', emoji: '🤘', group: 'Genres', queries: ['metal classics', 'heavy metal hits'] },
  { id: 'hiphop-us', name: 'Hip-hop US', emoji: '🗽', group: 'Genres', queries: ['hip hop classics', 'rap us hits'] },
  { id: 'rnb', name: 'R&B / Soul', emoji: '💜', group: 'Genres', queries: ['rnb classics', 'soul classics'] },
  { id: 'electro', name: 'Électro / Dance', emoji: '⚡', group: 'Genres', queries: ['dance hits', 'electro house hits', 'eurodance'] },
  { id: 'disco-funk', name: 'Disco / Funk', emoji: '🪩', group: 'Genres', queries: ['disco classics', 'funk classics'] },
  { id: 'reggae', name: 'Reggae', emoji: '🇯🇲', group: 'Genres', queries: ['reggae classics', 'bob marley best of'] },
  { id: 'jazz', name: 'Jazz', emoji: '🎷', group: 'Genres', queries: ['jazz classics', 'jazz standards'] },
  { id: 'classique', name: 'Classique', emoji: '🎻', group: 'Genres', queries: ['musique classique célèbre', 'classical music famous'] },
  { id: 'country', name: 'Country', emoji: '🤠', group: 'Genres', queries: ['country hits', 'country classics'] },

  // 🌍 Monde
  { id: 'latino', name: 'Latino', emoji: '💃', group: 'Monde', queries: ['latino hits', 'reggaeton hits', 'musica latina'] },
  { id: 'kpop', name: 'K-pop', emoji: '🇰🇷', group: 'Monde', queries: ['kpop hits', 'best kpop'] },
  { id: 'afro', name: 'Afro / Afrobeats', emoji: '🌍', group: 'Monde', queries: ['afrobeats hits', 'afro hits', 'musique africaine'] },
  { id: 'uk', name: 'Britannique', emoji: '🇬🇧', group: 'Monde', queries: ['britpop', 'uk hits classics'] },
  { id: 'italie', name: 'Italienne', emoji: '🇮🇹', group: 'Monde', queries: ['canzoni italiane famose', 'italian hits'] },
  { id: 'espagne', name: 'Espagnole', emoji: '🇪🇸', group: 'Monde', queries: ['canciones españolas éxitos', 'pop español'] },
  { id: 'allemagne', name: 'Allemande', emoji: '🇩🇪', group: 'Monde', queries: ['deutsche hits', 'deutschpop'] },
  { id: 'bollywood', name: 'Bollywood', emoji: '🇮🇳', group: 'Monde', queries: ['bollywood hits'] },
  { id: 'arabe', name: 'Raï / Arabe', emoji: '🌙', group: 'Monde', queries: ['raï hits', 'arabic hits'] },
];
